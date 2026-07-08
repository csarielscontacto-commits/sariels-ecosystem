alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.contacts enable row level security;
alter table public.wallet_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.audit_logs enable row level security;

-- Helpers
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_support()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'support'
  );
$$;

-- profiles
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
for update using (id = auth.uid() or public.is_admin());

-- customers
drop policy if exists "customers_read_own_or_admin_support" on public.customers;
create policy "customers_read_own_or_admin_support" on public.customers
for select using (created_by = auth.uid() or public.is_admin() or public.is_support());

drop policy if exists "customers_insert_seller_admin" on public.customers;
create policy "customers_insert_seller_admin" on public.customers
for insert with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "customers_update_own_or_admin" on public.customers;
create policy "customers_update_own_or_admin" on public.customers
for update using (created_by = auth.uid() or public.is_admin());

-- contacts
drop policy if exists "contacts_read_own_or_admin_support" on public.contacts;
create policy "contacts_read_own_or_admin_support" on public.contacts
for select using (owner_user_id = auth.uid() or public.is_admin() or public.is_support());

drop policy if exists "contacts_write_own_or_admin" on public.contacts;
create policy "contacts_write_own_or_admin" on public.contacts
for all using (owner_user_id = auth.uid() or public.is_admin())
with check (owner_user_id = auth.uid() or public.is_admin());

-- wallet_addresses (solo admin escribe; todos autenticados leen activas)
drop policy if exists "wallet_read_auth" on public.wallet_addresses;
create policy "wallet_read_auth" on public.wallet_addresses
for select using (auth.uid() is not null);

drop policy if exists "wallet_write_admin" on public.wallet_addresses;
create policy "wallet_write_admin" on public.wallet_addresses
for all using (public.is_admin())
with check (public.is_admin());

-- orders
drop policy if exists "orders_read_own_or_admin_support" on public.orders;
create policy "orders_read_own_or_admin_support" on public.orders
for select using (seller_user_id = auth.uid() or public.is_admin() or public.is_support());

drop policy if exists "orders_insert_seller_admin" on public.orders;
create policy "orders_insert_seller_admin" on public.orders
for insert with check (seller_user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_update_own_or_admin_support" on public.orders;
create policy "orders_update_own_or_admin_support" on public.orders
for update using (seller_user_id = auth.uid() or public.is_admin() or public.is_support());

-- payment_attempts (lectura seller de su orden; escritura backend con service role)
drop policy if exists "payment_attempts_read_related_orders" on public.payment_attempts;
create policy "payment_attempts_read_related_orders" on public.payment_attempts
for select using (
  exists (
    select 1 from public.orders o
    where o.id = payment_attempts.order_id
      and (o.seller_user_id = auth.uid() or public.is_admin() or public.is_support())
  )
);

-- audit_logs solo admin/support lectura; escritura backend (service role)
drop policy if exists "audit_read_admin_support" on public.audit_logs;
create policy "audit_read_admin_support" on public.audit_logs
for select using (public.is_admin() or public.is_support());
