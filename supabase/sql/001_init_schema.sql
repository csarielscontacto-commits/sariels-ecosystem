-- Extensiones
create extension if not exists pgcrypto;

-- Enum de roles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin','seller','support');
  end if;
end$$;

-- Enum de estados de orden
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending','confirmed','failed','refunded','expired','canceled');
  end if;
end$$;

-- Enum de proveedor
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_provider') then
    create type public.payment_provider as enum ('nowpayments','coinbase');
  end if;
end$$;

-- Enum de moneda
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_currency') then
    create type public.payment_currency as enum ('USDT','USDC');
  end if;
end$$;

-- Enum de red
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_network') then
    create type public.payment_network as enum ('TRC20','ERC20');
  end if;
end$$;

-- Tabla de perfiles / roles (relacionada con auth.users de Supabase)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'seller',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clientes
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Contactos (mi-red)
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  relation_status text not null check (relation_status in ('contact','request_sent','request_received','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, customer_id)
);

-- Wallet addresses de recepción por moneda/red (una activa por combinación)
create table if not exists public.wallet_addresses (
  id uuid primary key default gen_random_uuid(),
  currency public.payment_currency not null,
  network public.payment_network not null,
  address text not null,
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(currency, network, active) deferrable initially immediate
);

-- Órdenes
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  external_order_id text unique, -- id del proveedor (si aplica)
  customer_id uuid references public.customers(id),
  seller_user_id uuid not null references auth.users(id),
  provider public.payment_provider not null,
  currency public.payment_currency not null,
  network public.payment_network not null,
  amount numeric(18,6) not null check (amount > 0),
  status public.order_status not null default 'pending',
  checkout_url text,
  payment_address text,
  reference text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_seller on public.orders(seller_user_id);

-- Intentos / eventos de pago
create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider public.payment_provider not null,
  provider_payment_id text,
  event_type text not null,
  raw_payload jsonb not null,
  normalized_status public.order_status,
  tx_hash text,
  amount_received numeric(18,6),
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_attempts_order on public.payment_attempts(order_id);
create index if not exists idx_payment_attempts_provider_payment on public.payment_attempts(provider_payment_id);

-- Auditoría
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity text not null,
  entity_id text,
  ip text,
  user_agent text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Updated_at trigger genérico
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_contacts_updated_at on public.contacts;
create trigger trg_contacts_updated_at before update on public.contacts
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();
