-- 006_search_fn.sql

DROP FUNCTION IF EXISTS public.search_products CASCADE;

create or replace function search_products(
  brands text[] default null,
  category_slug text default null,
  cod_only boolean default false,
  in_stock_only boolean default false,
  max_price integer default null,
  min_discount integer default null,
  min_price integer default null,
  min_rating numeric default null,
  page integer default 1,
  page_size integer default 24,
  q text default null,
  sort text default 'popularity',
  subcategory_slug text default null
)
returns jsonb
language plpgsql
stable
as $$
#variable_conflict use_column
declare
  v_offset int;
  v_limit int;
  v_cat_id int;
  v_subcat_id int;
  v_has_q boolean;
  v_query tsquery;
  v_sort text;
  v_order_clause text;
  v_sql text;
  v_result jsonb;
begin
  v_limit := least(greatest(coalesce(page_size, 24), 1), 48);
  v_offset := (greatest(coalesce(page, 1), 1) - 1) * v_limit;
  v_sort := coalesce(sort, 'popularity');

  if q is not null and trim(q) <> '' then
    v_has_q := true;
    v_query := websearch_to_tsquery('simple', trim(q));
    if v_sort = 'popularity' then
      v_sort := 'relevance';
    end if;
  else
    v_has_q := false;
  end if;

  if category_slug is not null and category_slug <> '' then
    select id into v_cat_id from categories where slug = category_slug;
  end if;

  if subcategory_slug is not null and subcategory_slug <> '' then
    select id into v_subcat_id from categories where slug = subcategory_slug;
  end if;

  v_order_clause := case 
    when v_sort = 'price_asc' then 'p.price asc, p.rating_count desc, p.id asc'
    when v_sort = 'price_desc' then 'p.price desc, p.rating_count desc, p.id asc'
    when v_sort = 'rating' or v_sort = 'rating_desc' then 'p.rating desc, p.rating_count desc, p.id asc'
    when v_sort = 'rating_asc' then 'p.rating asc, p.rating_count desc, p.id asc'
    when v_sort = 'name_asc' then 'p.title asc, p.id asc'
    when v_sort = 'name_desc' then 'p.title desc, p.id asc'
    when v_sort = 'discount' then 'p.discount_pct desc, p.rating_count desc, p.id asc'
    when v_sort = 'newest' then 'p.created_at desc, p.id asc'
    when v_sort = 'relevance' then 'relevance_score desc, p.rating_count desc, p.id asc'
    else 'p.rating_count desc, p.id asc'
  end;

  v_sql := format('
    with filtered as (
      select 
        p.id,
        p.slug,
        p.title,
        p.description,
        p.brand,
        p.category_id,
        p.subcategory_id,
        p.price,
        p.mrp,
        p.discount_pct,
        p.rating,
        p.rating_count,
        p.colors_count,
        p.sizes,
        p.material,
        p.cod_available,
        p.return_days,
        p.delivery_days,
        p.seller_name,
        p.image_url,
        case when p.image_url is not null then ARRAY[p.image_url]::text[] else ARRAY[]::text[] end as images,
        p.stock_total,
        p.stock_available,
        p.is_flash_deal,
        p.created_at,
        c.slug as category_slug,
        sc.slug as subcategory_slug,
        case 
          when %L then
            coalesce(ts_rank(p.search_vector, %L), 0.0) + coalesce(similarity(p.title, %L), 0.0)
          else 0.0
        end as relevance_score
      from products p
      left join categories c on p.category_id = c.id
      left join categories sc on p.subcategory_id = sc.id
      where
        (%L = false or (p.search_vector @@ %L or p.title %% %L))
        and (%L::int is null or p.category_id = %L::int)
        and (%L::int is null or p.subcategory_id = %L::int)
        and (%L::text[] is null or p.brand = any(%L::text[]))
        and (%L::int is null or p.price >= %L::int)
        and (%L::int is null or p.price <= %L::int)
        and (%L::numeric is null or p.rating >= %L::numeric)
        and (%L::int is null or p.discount_pct >= %L::int)
        and (%L::boolean = false or p.stock_available > 0)
        and (%L::boolean = false or p.cod_available = true)
    ),
    counted as (
      select count(*) as total from filtered
    ),
    paginated as (
      select 
        id, slug, title, description, brand, category_id, subcategory_id,
        price, mrp, discount_pct, rating, rating_count, colors_count, sizes,
        material, cod_available, return_days, delivery_days, seller_name,
        image_url, images, stock_total, stock_available, is_flash_deal,
        created_at, category_slug, subcategory_slug
      from filtered
      order by %s
      limit %s offset %s
    ),
    brand_facets as (
      select jsonb_agg(json_build_object(''name'', brand, ''count'', cnt)) as data
      from (
        select brand, count(*) as cnt
        from filtered
        where brand is not null
        group by brand
        order by cnt desc
        limit 20
      ) b
    ),
    price_range as (
      select min(price) as min_p, max(price) as max_p from filtered
    ),
    cat_facets as (
      select jsonb_agg(json_build_object(''slug'', cat_slug, ''name'', cat_name, ''count'', cnt)) as data
      from (
        select c.slug as cat_slug, c.name as cat_name, count(*) as cnt
        from filtered f
        join categories c on f.category_id = c.id
        group by c.slug, c.name
        order by cnt desc
      ) cf
    )
    select jsonb_build_object(
      ''items'', coalesce((select jsonb_agg(row_to_json(paginated)) from paginated), ''[]''::jsonb),
      ''total'', (select total from counted),
      ''facets'', jsonb_build_object(
        ''brands'', coalesce((select data from brand_facets), ''[]''::jsonb),
        ''price'', jsonb_build_object(''min'', coalesce((select min_p from price_range), 0), ''max'', coalesce((select max_p from price_range), 10000)),
        ''categories'', coalesce((select data from cat_facets), ''[]''::jsonb)
      )
    );
  ', 
    v_has_q, v_query, q,
    v_has_q, v_query, q,
    v_cat_id, v_cat_id,
    v_subcat_id, v_subcat_id,
    brands, brands,
    min_price, min_price,
    max_price, max_price,
    min_rating, min_rating,
    min_discount, min_discount,
    in_stock_only,
    cod_only,
    v_order_clause, v_limit, v_offset
  );

  execute v_sql into v_result;
  return v_result;
end;
$$;
