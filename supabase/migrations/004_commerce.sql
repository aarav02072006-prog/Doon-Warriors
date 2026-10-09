-- 004_commerce.sql

create table if not exists carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz default now()
);

create table if not exists cart_items (
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text references products(id) on delete cascade not null,
  qty int check (qty between 1 and 10) not null default 1,
  size text not null default '',
  updated_at timestamptz default now(),
  primary key (user_id, product_id, size)
);

create index if not exists cart_items_user_id_idx on cart_items(user_id);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text check (status in ('pending_payment','placed','cancelled','expired')) not null default 'placed',
  subtotal int not null,
  delivery_fee int default 0,
  total int not null,
  payment_method text check (payment_method in ('upi','card','cod')) not null,
  address jsonb not null,
  created_at timestamptz default now()
);

create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_status_idx on orders(status);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id text references products(id) on delete set null,
  title text not null,
  price int not null,
  qty int not null,
  size text default ''
);

create index if not exists order_items_order_id_idx on order_items(order_id);
