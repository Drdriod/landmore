-- Land & More Reality: Supabase schema
-- Run this once in your Supabase project's SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses "create table if not exists".

create extension if not exists "pgcrypto";

-- ---------- PLOTS (inventory & pricing) ----------
create table if not exists plots (
  id uuid primary key default gen_random_uuid(),
  size_sqm text not null,               -- e.g. "300" or "Custom"
  unit_label text not null default 'Square Metres',
  price numeric not null default 0,     -- current price in Naira
  original_price numeric,               -- set to show a strike-through discount
  status text not null default 'available', -- available | reserved | sold
  featured boolean not null default false,
  features text[] not null default '{}',
  whatsapp_note text,                   -- optional custom message for this plot's WhatsApp link
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PROMOS (site-wide banner / discount) ----------
create table if not exists promos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  discount_percent numeric,
  active boolean not null default false,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

-- ---------- TESTIMONIALS ----------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,                            -- e.g. "Plot Owner, 450sqm"
  quote text not null,
  rating int not null default 5,
  photo_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- PROGRESS GALLERY ----------
create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  taken_on date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- FAQS (also powers AEO / FAQPage schema) ----------
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- INSPECTION REQUESTS (leads captured from the form) ----------
create table if not exists inspection_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  plot_size text,
  preferred_date date,
  preferred_time text,
  status text not null default 'new', -- new | contacted | booked | closed
  created_at timestamptz not null default now()
);

-- ---------- SITE SETTINGS (single row of editable global content) ----------
create table if not exists site_settings (
  id int primary key default 1,
  hero_badge text not null default 'VERIFIED LAND · UYO, AKWA IBOM',
  hero_title text not null default E'Own the land.\nBuild your future.',
  hero_subtitle text not null default 'Trust · Legality · Transparency',
  hero_description text not null default 'Secure premium plots at Dara Villa on Uyo''s fast-growing New Ring Road corridor, with verified titles and clear guidance from inspection to allocation.',
  address text not null default 'New Ring Road by Berger Junction, Off Idoro Road, Uyo, Akwa Ibom State',
  phone text not null default '08061730950',
  whatsapp_number text not null default '2348144236651',
  email text not null default 'landmorereality@gmail.com',
  advisor_name text not null default 'Mrs. Mabel Bassey',
  rc_number text not null default '9035696',
  bank_account_name text not null default 'Land & More Reality Ltd.',
  bank_account_number text not null default '1311106621',
  bank_name text not null default 'Zenith Bank',
  map_embed_url text,
  google_rating numeric,
  google_review_count int,
  constraint single_row check (id = 1)
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ---------- Row Level Security ----------
-- Public (anon) can READ everything except inspection_requests.
-- Only authenticated users (you, logged into /admin) can WRITE anywhere,
-- and only authenticated users can READ inspection_requests (they're leads, not public data).

alter table plots enable row level security;
alter table promos enable row level security;
alter table testimonials enable row level security;
alter table gallery_images enable row level security;
alter table faqs enable row level security;
alter table site_settings enable row level security;
alter table inspection_requests enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'plots' and policyname = 'public read plots') then
    create policy "public read plots" on plots for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'plots' and policyname = 'admin write plots') then
    create policy "admin write plots" on plots for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'promos' and policyname = 'public read promos') then
    create policy "public read promos" on promos for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'promos' and policyname = 'admin write promos') then
    create policy "admin write promos" on promos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'public read testimonials') then
    create policy "public read testimonials" on testimonials for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'admin write testimonials') then
    create policy "admin write testimonials" on testimonials for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'gallery_images' and policyname = 'public read gallery') then
    create policy "public read gallery" on gallery_images for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'gallery_images' and policyname = 'admin write gallery') then
    create policy "admin write gallery" on gallery_images for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'faqs' and policyname = 'public read faqs') then
    create policy "public read faqs" on faqs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'faqs' and policyname = 'admin write faqs') then
    create policy "admin write faqs" on faqs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'public read settings') then
    create policy "public read settings" on site_settings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'site_settings' and policyname = 'admin write settings') then
    create policy "admin write settings" on site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'inspection_requests' and policyname = 'public insert inspection') then
    create policy "public insert inspection" on inspection_requests for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'inspection_requests' and policyname = 'admin read inspection') then
    create policy "admin read inspection" on inspection_requests for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'inspection_requests' and policyname = 'admin update inspection') then
    create policy "admin update inspection" on inspection_requests for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;

-- ---------- Seed starter data (matches the current design, safe to edit later in /admin) ----------
insert into plots (size_sqm, unit_label, price, status, featured, features, sort_order)
select '300', 'Square Metres', 4500000, 'available', false,
  array['Starter home','Land banking','Flexible payment'], 1
where not exists (select 1 from plots);

insert into plots (size_sqm, unit_label, price, status, featured, features, sort_order)
select '450', 'Square Metres', 6500000, 'available', true,
  array['Family residence','Generous outdoor space','Higher resale potential'], 2
where not exists (select 1 from plots where size_sqm = '450');

insert into faqs (question, answer, sort_order)
select 'Is the land free from disputes?', 'All title documents are available for review before purchase. We recommend independent verification.', 1
where not exists (select 1 from faqs);

insert into faqs (question, answer, sort_order)
select 'Can I pay in instalments?', 'Yes. Flexible payment terms are available and confirmed in writing before payment.', 2
where not exists (select 1 from faqs where question like 'Can I pay%');

insert into faqs (question, answer, sort_order)
select 'What happens during inspection?', 'An advisor meets you on site, walks the estate boundary, and answers your questions.', 3
where not exists (select 1 from faqs where question like 'What happens%');

