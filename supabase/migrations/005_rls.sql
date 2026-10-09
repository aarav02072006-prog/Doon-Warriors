-- 005_rls.sql

alter table categories enable row level security;
alter table products enable row level security;
alter table reviews enable row level security;
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table wishlist enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Categories
create policy "Public categories select" on categories for select using (true);

-- Products
create policy "Public products select" on products for select using (true);

-- Reviews
create policy "Public reviews select" on reviews for select using (true);
create policy "Users insert own reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews" on reviews for update using (auth.uid() = user_id);

-- Profiles
create policy "Users select own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Addresses
create policy "Users manage own addresses" on addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Wishlist
create policy "Users manage own wishlist" on wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Carts
create policy "Users manage own cart" on carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cart Items
create policy "Users manage own cart items" on cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders
create policy "Users manage own orders" on orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Order Items
create policy "Users manage own order items" on order_items for all using (
  exists (
    select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()
  )
);
