-- 007_reservations.sql: Concurrency-Safe Flash Checkout & Inventory Reservation

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('active', 'confirmed', 'expired', 'cancelled')) not null default 'active',
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists reservations_user_id_idx on reservations(user_id);
create index if not exists reservations_status_expires_idx on reservations(status, expires_at);

create table if not exists reservation_items (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete cascade not null,
  product_id text references products(id) on delete cascade not null,
  qty int not null check (qty > 0),
  price int not null,
  size text default ''
);

create index if not exists reservation_items_reservation_id_idx on reservation_items(reservation_id);

-- Enable RLS on reservation tables
alter table reservations enable row level security;
alter table reservation_items enable row level security;

create policy "Users manage own reservations" on reservations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own reservation items" on reservation_items for all using (
  exists (
    select 1 from reservations where reservations.id = reservation_items.reservation_id and reservations.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from reservations where reservations.id = reservation_items.reservation_id and reservations.user_id = auth.uid()
  )
);

-- Function to release expired reservations and return stock
create or replace function release_expired_reservations()
returns void
language plpgsql
security definer
as $$
declare
  r record;
  item record;
begin
  for r in 
    select id from reservations 
    where status = 'active' and expires_at < now()
  loop
    update reservations set status = 'expired' where id = r.id;

    for item in 
      select product_id, qty from reservation_items where reservation_id = r.id
    loop
      update products 
      set stock_available = stock_available + item.qty 
      where id = item.product_id;
    end loop;
  end loop;
end;
$$;

-- Function to reserve cart items safely with FOR UPDATE row locking
create or replace function reserve_cart(p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation_id uuid;
  v_item record;
  v_stock int;
  v_subtotal int := 0;
  v_expires_at timestamptz;
begin
  perform release_expired_reservations();

  for v_item in 
    select ci.product_id, ci.qty, ci.size, p.price, p.title 
    from cart_items ci
    join products p on ci.product_id = p.id
    where ci.user_id = p_user_id
  loop
    select stock_available into v_stock 
    from products 
    where id = v_item.product_id 
    for update;

    if v_stock is null or v_stock < v_item.qty then
      raise exception 'Out of stock for product %', v_item.product_id using errcode = 'P0001';
    end if;
  end loop;

  v_expires_at := now() + interval '3 minutes';

  insert into reservations (user_id, status, expires_at)
  values (p_user_id, 'active', v_expires_at)
  returning id into v_reservation_id;

  for v_item in 
    select ci.product_id, ci.qty, ci.size, p.price, p.title 
    from cart_items ci
    join products p on ci.product_id = p.id
    where ci.user_id = p_user_id
  loop
    update products 
    set stock_available = stock_available - v_item.qty 
    where id = v_item.product_id;

    insert into reservation_items (reservation_id, product_id, qty, price, size)
    values (v_reservation_id, v_item.product_id, v_item.qty, v_item.price, v_item.size);

    v_subtotal := v_subtotal + (v_item.price * v_item.qty);
  end loop;

  return json_build_object(
    'reservation_id', v_reservation_id,
    'expires_at', v_expires_at,
    'subtotal', v_subtotal
  );
end;
$$;

-- Function to confirm reservation and convert into an order
create or replace function confirm_reservation(
  p_reservation_id uuid,
  p_user_id uuid,
  p_payment_method text,
  p_address jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_res record;
  v_subtotal int := 0;
  v_delivery_fee int := 0;
  v_total int;
  v_order_id uuid;
  v_item record;
begin
  select * into v_res 
  from reservations 
  where id = p_reservation_id and user_id = p_user_id
  for update;

  if v_res is null then
    raise exception 'Reservation not found' using errcode = 'P0002';
  end if;

  if v_res.status <> 'active' then
    raise exception 'Reservation is no longer active (status: %)', v_res.status using errcode = 'P0003';
  end if;

  if v_res.expires_at < now() then
    update reservations set status = 'expired' where id = p_reservation_id;
    for v_item in select product_id, qty from reservation_items where reservation_id = p_reservation_id loop
      update products set stock_available = stock_available + v_item.qty where id = v_item.product_id;
    end loop;
    raise exception 'Reservation has expired' using errcode = 'P0004';
  end if;

  select sum(price * qty) into v_subtotal
  from reservation_items
  where reservation_id = p_reservation_id;

  v_subtotal := coalesce(v_subtotal, 0);
  v_delivery_fee := case when v_subtotal >= 299 then 0 else 49 end;
  v_total := v_subtotal + v_delivery_fee;

  insert into orders (user_id, status, subtotal, delivery_fee, total, payment_method, address)
  values (p_user_id, 'placed', v_subtotal, v_delivery_fee, v_total, p_payment_method, p_address)
  returning id into v_order_id;

  for v_item in 
    select ri.product_id, ri.qty, ri.price, ri.size, p.title
    from reservation_items ri
    join products p on ri.product_id = p.id
    where ri.reservation_id = p_reservation_id
  loop
    insert into order_items (order_id, product_id, title, price, qty, size)
    values (v_order_id, v_item.product_id, v_item.title, v_item.price, v_item.qty, v_item.size);
  end loop;

  update reservations set status = 'confirmed' where id = p_reservation_id;

  delete from cart_items where user_id = p_user_id;

  return json_build_object(
    'order_id', v_order_id,
    'total', v_total,
    'status', 'placed'
  );
end;
$$;
