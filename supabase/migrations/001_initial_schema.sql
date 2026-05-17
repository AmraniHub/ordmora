-- ============================================================
-- ORDMORA — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (clients)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  username    text unique not null,
  phone       text unique not null,
  city        text not null,
  delivery_address text not null,
  points_total integer not null default 0 check (points_total >= 0),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Clients can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Clients can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- ADMIN USERS
-- ============================================================
create type admin_role as enum ('admin', 'manager', 'delivery');

create table public.admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text not null,
  role        admin_role not null default 'manager',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read all admin users"
  on public.admin_users for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ============================================================
-- PRODUCTS
-- ============================================================
create type product_category as enum ('parfums', 'packs', 'accessoires');

create table public.products (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  price        numeric(10,2) not null check (price >= 0),
  image_url    text,
  category     product_category not null,
  points_value integer not null default 0 check (points_value >= 0),
  stock        integer not null default 0 check (stock >= 0),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy "Admins can manage products"
  on public.products for all
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ============================================================
-- ORDERS
-- ============================================================
create type order_status as enum ('en_attente', 'en_cours', 'livree', 'annulee');

create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  order_number     text unique not null default 'CMD' || to_char(now(), 'YYYYMMDD') || lpad(floor(random() * 10000)::text, 4, '0'),
  client_id        uuid not null references public.profiles(id) on delete restrict,
  status           order_status not null default 'en_attente',
  total_amount     numeric(10,2) not null check (total_amount >= 0),
  delivery_address text not null,
  notes            text,
  updated_by       uuid references public.admin_users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Clients can view own orders"
  on public.orders for select
  using (auth.uid() = client_id);

create policy "Clients can create orders"
  on public.orders for insert
  with check (auth.uid() = client_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can update orders"
  on public.orders for update
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table public.order_items (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     uuid not null references public.products(id) on delete restrict,
  quantity       integer not null default 1 check (quantity > 0),
  unit_price     numeric(10,2) not null check (unit_price >= 0),
  points_earned  integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "Clients can view own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and client_id = auth.uid()));

create policy "Clients can insert order items"
  on public.order_items for insert
  with check (exists (select 1 from public.orders where id = order_id and client_id = auth.uid()));

create policy "Admins can view all order items"
  on public.order_items for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================
create type transaction_type as enum ('earned', 'spent', 'adjusted', 'expired');

create table public.wallet_transactions (
  id                   uuid primary key default uuid_generate_v4(),
  client_id            uuid not null references public.profiles(id) on delete cascade,
  points               integer not null,
  type                 transaction_type not null,
  description          text not null,
  order_id             uuid references public.orders(id),
  gift_redemption_id   uuid,
  expires_at           timestamptz,
  created_at           timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Clients can view own transactions"
  on public.wallet_transactions for select
  using (auth.uid() = client_id);

create policy "Admins can view all transactions"
  on public.wallet_transactions for select
  using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "Admins can insert transactions"
  on public.wallet_transactions for insert
  with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- ============================================================
-- GIFTS
-- ============================================================
create table public.gifts (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text,
  image_url        text,
  points_required  integer not null check (points_required > 0),
  stock            integer not null default 0 check (stock >= 0),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.gifts enable row level security;

create policy "Anyone can view active gifts"
  on public.gifts for select
  using (is_active = true);

create policy "Admins can manage gifts"
  on public.gifts for all
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ============================================================
-- GIFT REDEMPTIONS
-- ============================================================
create type redemption_status as enum ('pending', 'shipped', 'delivered');

create table public.gift_redemptions (
  id           uuid primary key default uuid_generate_v4(),
  client_id    uuid not null references public.profiles(id) on delete restrict,
  gift_id      uuid not null references public.gifts(id) on delete restrict,
  points_spent integer not null check (points_spent > 0),
  status       redemption_status not null default 'pending',
  created_at   timestamptz not null default now()
);

alter table public.gift_redemptions enable row level security;

create policy "Clients can view own redemptions"
  on public.gift_redemptions for select
  using (auth.uid() = client_id);

create policy "Clients can create redemptions"
  on public.gift_redemptions for insert
  with check (auth.uid() = client_id);

create policy "Admins can manage redemptions"
  on public.gift_redemptions for all
  using (exists (select 1 from public.admin_users where id = auth.uid()));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto update orders.updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function update_updated_at();

-- When order status → 'livree': auto-add points to wallet
create or replace function handle_order_delivered()
returns trigger language plpgsql security definer as $$
declare
  item record;
  total_points integer := 0;
begin
  if new.status = 'livree' and old.status != 'livree' then
    -- Sum points from all items
    select coalesce(sum(oi.points_earned), 0)
    into total_points
    from public.order_items oi
    where oi.order_id = new.id;

    if total_points > 0 then
      -- Add wallet transaction
      insert into public.wallet_transactions
        (client_id, points, type, description, order_id, expires_at)
      values
        (new.client_id, total_points, 'earned',
         'Points earned from order ' || new.order_number,
         new.id,
         now() + interval '6 months');

      -- Update profile total
      update public.profiles
      set points_total = points_total + total_points
      where id = new.client_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger on_order_delivered
  after update on public.orders
  for each row execute function handle_order_delivered();

-- Gift redemption: subtract points atomically
create or replace function redeem_gift(p_client_id uuid, p_gift_id uuid)
returns json language plpgsql security definer as $$
declare
  v_gift public.gifts;
  v_client public.profiles;
  v_redemption_id uuid;
begin
  -- Lock and fetch gift
  select * into v_gift from public.gifts where id = p_gift_id and is_active = true for update;
  if not found then
    return json_build_object('success', false, 'error', 'Gift not found');
  end if;
  if v_gift.stock <= 0 then
    return json_build_object('success', false, 'error', 'Gift out of stock');
  end if;

  -- Lock and fetch client
  select * into v_client from public.profiles where id = p_client_id for update;
  if v_client.points_total < v_gift.points_required then
    return json_build_object(
      'success', false,
      'error', 'Insufficient points',
      'missing', v_gift.points_required - v_client.points_total
    );
  end if;

  -- Create redemption
  insert into public.gift_redemptions (client_id, gift_id, points_spent)
  values (p_client_id, p_gift_id, v_gift.points_required)
  returning id into v_redemption_id;

  -- Subtract points
  update public.profiles
  set points_total = points_total - v_gift.points_required
  where id = p_client_id;

  -- Log transaction
  insert into public.wallet_transactions
    (client_id, points, type, description, gift_redemption_id)
  values
    (p_client_id, -v_gift.points_required, 'spent',
     'Redeemed gift: ' || v_gift.name, v_redemption_id);

  -- Decrement stock
  update public.gifts set stock = stock - 1 where id = p_gift_id;

  return json_build_object('success', true, 'redemption_id', v_redemption_id);
end;
$$;

-- Expire old points (called by Edge Function cron)
create or replace function expire_old_points()
returns void language plpgsql security definer as $$
declare
  rec record;
begin
  for rec in
    select client_id, sum(points) as pts
    from public.wallet_transactions
    where type = 'earned'
      and expires_at < now()
      and id not in (
        select coalesce((metadata->>'source_transaction_id')::uuid, uuid_nil())
        from public.wallet_transactions
        where type = 'expired'
      )
    group by client_id
  loop
    insert into public.wallet_transactions (client_id, points, type, description)
    values (rec.client_id, -rec.pts, 'expired', 'Points expired after 6 months');

    update public.profiles
    set points_total = greatest(0, points_total - rec.pts)
    where id = rec.client_id;
  end loop;
end;
$$;

-- ============================================================
-- INDEXES
-- ============================================================
create index orders_client_id_idx on public.orders(client_id);
create index orders_status_idx on public.orders(status);
create index wallet_client_id_idx on public.wallet_transactions(client_id);
create index wallet_expires_at_idx on public.wallet_transactions(expires_at);
create index gift_redemptions_client_id_idx on public.gift_redemptions(client_id);
