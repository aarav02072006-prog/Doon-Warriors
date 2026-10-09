-- 006_search_fn.sql

create or replace function search_products(
  q text default null,
  category_slug text default null,
  subcategory_slug text default null,
  brands text[] default null,
  min_price int default null,
  max_price int default null,
  min_rating numeric default null,
  min_discount int default null,
  in_stock_only boolean default false,
  cod_only boolean default false,
  sort text default 'popularity',
  page int default 1,
  page_size int default 24
)
returns jsonb
language plpgsql
stable
as $$
declare
  v_offset int;
  v_limit int;
  v_total int;
  v_items jsonb;
  v_facets jsonb;
  v_cat_id int;
  v_subcat_id int;
  v_has_q boolean;
  v_query tsquery;
  v_sort text;
begin
  -- Validate and bound page size
  v_limit := least(greatest(coalesce(page_size, 24), 1), 48);
  v_offset := (greatest(coalesce(page, 1), 1) - 1) * v_limit;
  v_sort := coalesce(sort, 'popularity');

  if q is not null and trim(q) <> '' then
    v_has_q := true;
    -- Build simple websearch query
    v_query := websearch_to_tsquery('simple', trim(q));
    if v_sort = 'popularity' and q is not null then
      v_sort := 'relevance';
    end if;
  else
    v_has_q := false;
  end if;

  -- Resolve category ID if slug provided
  if category_slug is not null and category_slug <> '' then
    select id into v_cat_id from categories where slug = category_slug;
  end if;

  if subcategory_slug is not null and subcategory_slug <> '' then
    select id into v_subcat_id from categories where slug = subcategory_slug;
  end if;

  -- Base filter CTE or query logic for counting and selecting
  -- We can use a common filtered set
  with filtered as (
    select 
      p.*,
      c.slug as category_slug,
      sc.slug as subcategory_slug,
      case 
        when v_has_q then
          coalesce(ts_rank(p.search_vector, v_query), 0.0) + coalesce(similarity(p.title, q), 0.0)
        else 0.0
      end as relevance_score
    from products p
    left join categories c on p.category_id = c.id
    left join categories sc on p.subcategory_id = sc.id
    where
      (not v_has_q or (p.search_vector @@ v_query or p.title % q))
      and (v_cat_id is null or p.category_id = v_cat_id)
      and (v_subcat_id is null or p.subcategory_id = v_subcat_id)
      and (brands is null or p.brand = any(brands))
      and (min_price is null or p.price >= min_price)
      and (max_price is null or p.price <= max_price)
      and (min_rating is null or p.rating >= min_rating)
      and (min_discount is null or p.discount_pct >= min_discount)
      and (not in_stock_only or p.stock_available > 0)
      and (not cod_only or p.cod_available = true)
  ),
  counted as (
    select count(*) as total from filtered
  ),
  paginated as (
    select 
      id,
      slug,
      title,
      brand,
      price,
      mrp,
      discount_pct,
      rating,
      rating_count,
      stock_available,
      is_flash_deal,
      category_slug,
      cod_available,
      delivery_days
    from filtered
    order by
      case when v_sort = 'relevance' then relevance_score end desc,
      case when v_sort = 'price_asc' then price end asc,
      case when v_sort = 'price_desc' then price end desc,
      case when v_sort = 'rating' then rating end desc,
      case when v_sort = 'discount' then discount_pct end desc,
      case when v_sort = 'newest' then created_at end desc,
      case when v_sort = 'popularity' then rating_count end desc,
      rating_count desc
    limit v_limit offset v_offset
  ),
  brand_facets as (
    select json_agg(json_build_object('name', brand, 'count', cnt)) as data
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
    select json_agg(json_build_object('slug', cat_slug, 'name', cat_name, 'count', cnt)) as data
    from (
      select c.slug as cat_slug, c.name as cat_name, count(*) as cnt
      from filtered f
      join categories c on f.category_id = c.id
      group by c.slug, c.name
      order by cnt desc
    ) cf
  )
  select 
    (select total from counted),
    coalesce((select json_agg(row_to_json(paginated)) from paginated), '[]'::jsonb),
    json_build_object(
      'brands', coalesce((select data from brand_facets), '[]'::jsonb),
      'price', json_build_object('min', coalesce((select min_p from price_range), 0), 'max', coalesce((select max_p from price_range), 10000)),
      'categories', coalesce((select data from cat_facets), '[]'::jsonb)
    )
  into v_total, v_items, v_facets;

  return json_build_object(
    'items', v_items,
    'total', v_total,
    'facets', v_facets
  );
end;
$$;
