-- Land & More Reality — Staff roles + Referral program
-- Run this AFTER schema.sql, once, in Supabase's SQL Editor.
-- Safe to re-run.

-- ---------- PROFILES (staff vs admin) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'staff', -- 'admin' | 'staff'
  referral_code text unique,          -- staff's own referral code, for commission tracking
  commission_percent numeric default 2, -- default commission % if this staff member refers a buyer
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Helper used by RLS policies to check "is this logged-in user an admin?"
-- security definer lets it read `profiles` without recursively triggering profiles' own RLS.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin' and active = true
  );
$$;

alter table profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'read own or admin reads all') then
    create policy "read own or admin reads all" on profiles for select
      using (id = auth.uid() or is_admin());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'admin manages profiles') then
    create policy "admin manages profiles" on profiles for all
      using (is_admin()) with check (is_admin());
  end if;
end $$;

-- ---------- Tighten existing content tables to ADMIN ONLY writes ----------
-- (previously any logged-in user could write; now only role = 'admin' can)
drop policy if exists "admin write plots" on plots;
create policy "admin write plots" on plots for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write promos" on promos;
create policy "admin write promos" on promos for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write testimonials" on testimonials;
create policy "admin write testimonials" on testimonials for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write gallery" on gallery_images;
create policy "admin write gallery" on gallery_images for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write faqs" on faqs;
create policy "admin write faqs" on faqs for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write settings" on site_settings;
create policy "admin write settings" on site_settings for all using (is_admin()) with check (is_admin());

-- Inspection requests stay open to ANY logged-in user (staff manage leads, admin too).
-- No change needed — "admin read inspection" / "admin update inspection" already use auth.role() = 'authenticated'.

-- Track which referral code (if any) brought a lead in.
alter table inspection_requests add column if not exists referral_code text;

-- ---------- REFERRERS (both staff and customers can refer buyers) ----------
create table if not exists referrers (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'customer', -- 'staff' | 'customer'
  name text not null,
  phone text not null,
  address text,
  code text not null unique,
  reward_type text not null default 'fixed', -- 'fixed' (naira amount) | 'percent' (of sale)
  reward_value numeric not null default 0,
  profile_id uuid references profiles(id), -- set only when type = 'staff'
  created_at timestamptz not null default now()
);
-- In case this table already existed from an earlier run without `address`:
alter table referrers add column if not exists address text;

alter table referrers enable row level security;

do $$
begin
  -- Customers can self-register their own referral code from the public site.
  if not exists (select 1 from pg_policies where tablename = 'referrers' and policyname = 'public self-serve customer referral') then
    create policy "public self-serve customer referral" on referrers for insert
      with check (type = 'customer');
  end if;
  -- Only admin can view/manage the referrer list (staff referrers, reward terms, etc).
  if not exists (select 1 from pg_policies where tablename = 'referrers' and policyname = 'admin manages referrers') then
    create policy "admin manages referrers" on referrers for all
      using (is_admin()) with check (is_admin());
  end if;
end $$;

-- ---------- REFERRAL REWARDS (payout tracking) ----------
create table if not exists referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references referrers(id) on delete cascade,
  inspection_request_id uuid references inspection_requests(id),
  plot_id uuid references plots(id),
  amount numeric not null default 0,
  status text not null default 'pending', -- 'pending' | 'approved' | 'paid'
  note text,
  created_at timestamptz not null default now()
);

alter table referral_rewards enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'referral_rewards' and policyname = 'admin manages rewards') then
    create policy "admin manages rewards" on referral_rewards for all
      using (is_admin()) with check (is_admin());
  end if;
end $$;

-- ---------- Customer referral reward default (editable in Site Settings) ----------
alter table site_settings add column if not exists customer_referral_reward numeric not null default 50000;
alter table site_settings add column if not exists staff_referral_commission_percent numeric not null default 2;

-- ---------- IMPORTANT: create your own admin profile ----------
-- 1. In Supabase: Authentication -> Users -> Add user (your own email/password) if you haven't already.
-- 2. Copy that user's UUID (shown in the Users list).
-- 3. Run this, replacing the UUID and name:
--
-- insert into profiles (id, full_name, role)
-- values ('paste-your-auth-user-uuid-here', 'Your Name', 'admin');
--
-- This first row must be inserted here in the SQL Editor (not from /admin),
-- since nobody is an admin yet to unlock the admin-only screens.
