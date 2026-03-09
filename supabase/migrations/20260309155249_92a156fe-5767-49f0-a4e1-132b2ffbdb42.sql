
-- Create app_role enum and user_roles table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS for user_roles
create policy "Read own or admin reads all roles" on public.user_roles
for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admin insert roles" on public.user_roles
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admin update roles" on public.user_roles
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin delete roles" on public.user_roles
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Add email to profiles
alter table public.profiles add column if not exists email text;

-- Update trigger to include email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  return new;
end;
$$;

-- Platform settings table
create table public.platform_settings (
    id uuid primary key default gen_random_uuid(),
    key text unique not null,
    value text not null,
    updated_at timestamp with time zone default now()
);

alter table public.platform_settings enable row level security;

create policy "Read settings" on public.platform_settings
for select to authenticated using (true);

create policy "Admin insert settings" on public.platform_settings
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admin update settings" on public.platform_settings
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Insert default platform settings
insert into public.platform_settings (key, value) values
('site_name', 'CourseVerse'),
('maintenance_mode', 'false'),
('refund_policy', 'Refunds are available within 7 days of purchase.');

-- Admin read policies on existing tables
create policy "Admin read all profiles" on public.profiles
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all purchases" on public.purchases
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all subscriptions" on public.subscriptions
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all reseller_apps" on public.reseller_applications
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin update reseller_apps" on public.reseller_applications
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all cv_balances" on public.cv_coin_balances
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all cv_transactions" on public.cv_coin_transactions
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all exchange_reqs" on public.exchange_requests
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin update exchange_reqs" on public.exchange_requests
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all sell_reqs" on public.sell_requests
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin update sell_reqs" on public.sell_requests
for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all notifications" on public.notifications
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin send notifications" on public.notifications
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all cart" on public.cart
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admin read all wishlist" on public.wishlist
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));
