-- 002_catalog.sql

create table if not exists categories (
  id serial primary key,
  slug text unique not null,
  name text not null,
  parent_id int references categories(id) on delete cascade,
  sort_order int default 0
);

create table if not exists products (
  id text primary key,
  slug text unique not null,
  title text not null,
  description text,
  brand text,
  category_id int references categories(id) on delete set null,
  subcategory_id int references categories(id) on delete set null,
  price int not null,
  mrp int not null,
  discount_pct int not null,
  rating numeric(2,1) default 0.0,
  rating_count int default 0,
  colors_count int default 1,
  sizes text[] default '{}',
  material text,
  cod_available boolean default true,
  return_days int default 0,
  delivery_days int default 5,
  seller_name text,
  image_url text,
  stock_total int default 50,
  stock_available int check (stock_available >= 0) default 50,
  is_flash_deal boolean default false,
  created_at timestamptz default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) stored
);

create index if not exists products_search_vector_idx on products using gin(search_vector);
create index if not exists products_title_trgm_idx on products using gin(title extensions.gin_trgm_ops);
create index if not exists products_category_id_idx on products(category_id);
create index if not exists products_subcategory_id_idx on products(subcategory_id);
create index if not exists products_price_idx on products(price);
create index if not exists products_rating_idx on products(rating desc);
create index if not exists products_discount_pct_idx on products(discount_pct desc);
create index if not exists products_brand_idx on products(brand);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating int check (rating between 1 and 5) not null,
  title text,
  body text,
  is_seeded boolean default false,
  created_at timestamptz default now()
);

create unique index if not exists reviews_product_user_idx on reviews(product_id, user_id) where user_id is not null;
create index if not exists reviews_product_created_idx on reviews(product_id, created_at desc);
