-- 003_users.sql

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- Trigger to auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text check (pincode ~ '^[1-9][0-9]{5}$'),
  is_default boolean default false,
  created_at timestamptz default now()
);

create index if not exists addresses_user_id_idx on addresses(user_id);

create table if not exists wishlist (
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text references products(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);

create index if not exists wishlist_user_id_idx on wishlist(user_id);
