-- Game Shop schema (Supabase PostgreSQL)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  game text not null,
  description text,
  rarity text,
  attributes jsonb,
  price numeric(12,2) not null,
  discount numeric(5,2) default 0,
  stock int not null default 0,
  image_url text,
  category_id uuid references public.categories(id),
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  balance numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  type text not null check (type in ('credit','debit')),
  amount numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  reference text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  total numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','completed','cancelled')),
  note text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity int not null,
  price numeric(12,2) not null
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  method text not null check (method in ('card','bank')),
  provider text,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','verified','failed')),
  txn_code text unique not null,
  card_info jsonb,
  bank_info jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  target text,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.deposits enable row level security;
alter table public.notifications enable row level security;

-- Public read products/categories
create policy "products public read" on public.products for select using (visible = true);
create policy "categories public read" on public.categories for select using (true);

-- User own data
create policy "profile self" on public.profiles for select using (auth.uid() = id);
create policy "profile self update" on public.profiles for update using (auth.uid() = id);
create policy "wallet self" on public.wallets for select using (auth.uid() = user_id);
create policy "transactions self" on public.transactions for select using (auth.uid() = user_id);
create policy "orders self read" on public.orders for select using (auth.uid() = user_id);
create policy "order_items self read" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "deposits self" on public.deposits for select using (auth.uid() = user_id);
create policy "notifications self" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications self update" on public.notifications for update using (auth.uid() = user_id);

-- Admin policies (role check)
create policy "admin products all" on public.products for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "admin categories all" on public.categories for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "admin orders all" on public.orders for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "admin deposits all" on public.deposits for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "admin profiles all" on public.profiles for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "admin wallets all" on public.wallets for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));
create policy "admin transactions all" on public.transactions for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- Trigger: create profile + wallet on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  insert into public.wallets (user_id) values (new.id);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
