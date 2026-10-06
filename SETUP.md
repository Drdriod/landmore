# Setup Guide — Land & More Reality (Modernized)

This turns the site from a fully static page into one where the client can edit
plots, prices, promos, testimonials, photos, and FAQs themselves from a private
`/admin` dashboard — no code changes needed for day-to-day updates.

## What changed, in plain terms

- The site now pulls its content (plots, prices, promos, testimonials, gallery
  photos, FAQs, contact details) from a small free database (Supabase) instead
  of having it typed directly into the code.
- A new `/admin` page lets you log in and edit all of that through forms —
  like a mini version of a WordPress dashboard.
- If you don't set up the database yet, the site still works exactly as
  before, using the same numbers that were hardcoded — nothing breaks.

## Step 1 — Create a free Supabase project

1. Go to https://supabase.com and sign up (free tier is enough for this site).
2. Click **New Project**. Pick any name (e.g. "landmore"), set a database
   password (save it somewhere), and choose a region close to Nigeria (e.g.
   Europe West).
3. Wait about 2 minutes for it to finish setting up.

## Step 2 — Create the database tables

1. In your new project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from this project, copy everything in
   it, and paste it into the SQL editor.
4. Click **Run**. This creates all the tables (plots, promos, testimonials,
   gallery, FAQs, settings, inspection requests) and fills in the same
   starting data the site already had, so nothing changes visually at first.

## Step 3 — Get your API keys

1. In Supabase, click **Settings** (gear icon) -> **API**.
2. Copy the **Project URL** and the **anon public** key.
3. In this project folder, copy `.env.example` to a new file named `.env`.
4. Paste your values in:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   The "anon" key is safe to use in the browser — it's the public key
   Supabase is designed to expose. The database rules (already set up by the
   SQL script) make sure visitors can only read content, and only a logged-in
   admin can change anything.

## Step 4 — Create your admin login

1. In Supabase, click **Authentication** -> **Users** -> **Add user**.
2. Enter the email and password you want to use to log into `/admin`.
3. That's it — no public sign-up page exists, so only people you personally
   create a login for can access the dashboard.

## Step 5 — Run it locally to check everything works

```bash
pnpm install
pnpm run dev
```

Visit the site, then visit `/admin`, and log in with the user you created in
Step 4. Try editing a plot's price and refresh the homepage to see it change.

## Step 6 — Deploy to Vercel

This project now includes a `vercel.json` that's already set up for you —
Vercel will automatically use the right build command and output folder.

1. Push this project to GitHub (same Termux pattern you already use), then
   import the repo in Vercel (New Project -> pick the repo).
2. Before the first deploy, go to **Project Settings -> Environment
   Variables** and add:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   (Vercel doesn't read your local `.env` file — these have to be entered
   here, since Vite bakes them into the site at build time.)
3. Deploy. Vercel will run `npm run build:vercel` automatically (from
   `vercel.json`) and serve the `dist` folder.
4. Once it's live, open `index.html`, `public/robots.txt`,
   `public/sitemap.xml`, and `public/llms.txt` and replace every
   `YOUR-DOMAIN.vercel.app` placeholder with your real Vercel URL (or custom
   domain, once you attach one) — this matters for Google and AI tools to
   correctly identify your site.

Still using GitHub Pages for anything? `pnpm run build:github` still works
exactly as before — nothing about that path changed.

### A note on what got cleaned up
This project was originally pulled out of a larger Replit workspace, so its
`package.json` had several dependencies pinned to `catalog:` (a version
placeholder that only resolves inside that workspace) and one dependency on
an internal package that doesn't exist outside it. Those would have made
`npm install` fail completely on Vercel (and anywhere else outside Replit).
Everything now has a real, pinned version — `npm install` and
`pnpm install` both work standalone.

## Step 7 — Staff accounts and the referral program (optional)

If you want staff logins (limited to managing Leads only) and the referral
program (staff commissions + customer "refer a friend" rewards):

1. In Supabase SQL Editor, run `supabase/migration_staff_referrals.sql`
   (after `schema.sql`).
2. This tightens permissions so **only an Admin** can edit plots, prices,
   promos, testimonials, gallery, FAQs, and settings — Staff accounts can
   only view and manage Leads.
3. Follow the note at the bottom of that SQL file to create your own Admin
   profile — you do this once, directly in the SQL Editor, using the User ID
   from the login you created in Step 4.
4. After that, log into `/admin` and open **Staff** to add any other team
   members. For each one: create their login in Supabase Authentication
   first (same as Step 4), then paste their User ID into the Staff form here
   — that's what links their login to the Staff role.

### How the referral program works
- **Staff** get a referral code automatically (shown on their Staff profile)
  and earn a commission percentage — set per staff member, or use the
  default in Site Settings.
- **Customers** get their own code for free from the "Refer & Earn" section
  on the live site — no login needed. They enter their name and phone and
  get a shareable link instantly.
- When someone visits the site through a referral link (`?ref=CODE`), that
  code is automatically attached to their inspection request if they book
  one — you'll see it in **Leads**.
- When a referred lead actually buys a plot, go to **Referral Program →
  Rewards & Payouts** and record the reward manually (amount + which
  referrer). Mark it Pending → Approved → Paid as you process it. This is a
  manual step by design, since only you know when a sale has actually closed.

## Using the admin dashboard day to day

Go to `yoursite.com/admin`, log in, and you can:

- **Plots & Pricing** — add a plot size, change its price, set an "original
  price" to show a discount, mark it Available / Reserved / Sold.
- **Promos & Discounts** — turn on a site-wide banner with a message and an
  optional end date.
- **Testimonials** — add client reviews with a star rating.
- **Progress Gallery** — add photos of the estate's development (paste an
  image URL — upload the photo somewhere like Imgur or Cloudinary first).
- **FAQs** — add questions and answers; these also show up as rich results
  in Google and help AI tools like ChatGPT answer questions about the estate
  correctly.
- **Leads** — every booking form submission is saved here too, not just sent
  to WhatsApp, so nothing gets lost. Shows the referral code if the visitor
  came through one.
- **Referral Program** (Admin only) — manage staff/customer referral codes
  and record commission or reward payouts.
- **Staff** (Admin only) — add team members and set their access level.
- **Site Settings** — hero text, contact info, bank details, Google Maps
  embed link, Google rating, and referral program defaults.

## New features added to the live site

- Site-wide promo/discount banner
- Live plot status (Available / Reserved / Sold) with a "plots remaining" counter
- Interactive payment plan calculator (down payment + monthly instalments)
- Per-plot WhatsApp deep links with a pre-filled message
- Google Maps embed (once you paste a link in Site Settings)
- Testimonials section
- Development progress photo gallery with lightbox
- FAQ section with expand/collapse, feeding Google + AI answer engines
- Floating call and WhatsApp buttons
- Inspection form submissions saved to the database as backup leads
- SEO: proper meta tags, sitemap.xml, robots.txt, structured data
- AEO (AI answer engine optimization): llms.txt file and FAQ schema so tools
  like ChatGPT, Perplexity, and Google AI Overviews can answer questions
  about the estate accurately
- Staff accounts with role-based access (Staff can manage Leads only; Admin
  has full access)
- Referral program: staff commissions + a public "Refer & Earn" section
  where customers enter their name, phone, and address to generate their own
  referral number and shareable link
- A swipeable photo carousel in the Progress Gallery section, instead of a
  plain grid, so estate development photos feel more like a real product
  tour than a static page
