import { supabase, isSupabaseConfigured } from "./supabase";
import {
  defaultFaqs,
  defaultGallery,
  defaultPlots,
  defaultSettings,
  defaultTestimonials,
} from "./defaults";
import type {
  Faq,
  GalleryImage,
  InspectionRequest,
  Plot,
  Profile,
  Promo,
  ReferralReward,
  Referrer,
  SiteSettings,
  Testimonial,
} from "./types";

// ---------- READ (used by the public landing page) ----------

export async function fetchSettings(): Promise<SiteSettings> {
  if (!supabase) return defaultSettings;
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return defaultSettings;
  return data as SiteSettings;
}

export async function fetchPlots(): Promise<Plot[]> {
  if (!supabase) return defaultPlots;
  const { data, error } = await supabase
    .from("plots")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return defaultPlots;
  return data as Plot[];
}

export async function fetchActivePromo(): Promise<Promo | null> {
  if (!supabase) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("promos")
    .select("*")
    .eq("active", true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as Promo;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return defaultTestimonials;
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return defaultTestimonials;
  return data as Testimonial[];
}

export async function fetchGallery(): Promise<GalleryImage[]> {
  if (!supabase) return defaultGallery;
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data) return defaultGallery;
  return data as GalleryImage[];
}

export async function fetchFaqs(): Promise<Faq[]> {
  if (!supabase) return defaultFaqs;
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return defaultFaqs;
  return data as Faq[];
}

export async function submitInspectionRequest(payload: {
  name: string;
  phone: string;
  email: string;
  plot_size: string;
  preferred_date: string;
  preferred_time: string;
  referral_code?: string | null;
}) {
  if (!supabase) return { ok: true, saved: false };
  const { error } = await supabase.from("inspection_requests").insert(payload);
  return { ok: !error, saved: !error };
}

// Customer self-serve referral signup, called from the public "Refer & Earn" section.
export async function createCustomerReferral(payload: {
  name: string;
  phone: string;
  address: string;
  reward_value: number;
}) {
  if (!supabase) return { ok: false, code: null as string | null };
  const code = generateReferralCode(payload.name);
  const { error } = await supabase.from("referrers").insert({
    type: "customer",
    name: payload.name,
    phone: payload.phone,
    address: payload.address || null,
    code,
    reward_type: "fixed",
    reward_value: payload.reward_value,
  });
  return { ok: !error, code: error ? null : code };
}

export function generateReferralCode(name: string) {
  const base = name
    .trim()
    .split(/\s+/)[0]
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base || "REF"}${suffix}`;
}

// ---------- WRITE (used by /admin — requires an authenticated session) ----------
// RLS on every table requires auth.role() = 'authenticated' for writes,
// so these will silently fail (and the UI shows an error) unless the admin is logged in.

export async function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase isn't configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
    );
  }
  return supabase;
}

export const db = {
  plots: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("plots")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Plot[];
    },
    async upsert(plot: Partial<Plot>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("plots").upsert(plot);
      if (error) throw error;
    },
    async remove(id: string) {
      const sb = await requireSupabase();
      const { error } = await sb.from("plots").delete().eq("id", id);
      if (error) throw error;
    },
  },
  promos: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("promos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Promo[];
    },
    async upsert(promo: Partial<Promo>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("promos").upsert(promo);
      if (error) throw error;
    },
    async remove(id: string) {
      const sb = await requireSupabase();
      const { error } = await sb.from("promos").delete().eq("id", id);
      if (error) throw error;
    },
  },
  testimonials: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Testimonial[];
    },
    async upsert(t: Partial<Testimonial>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("testimonials").upsert(t);
      if (error) throw error;
    },
    async remove(id: string) {
      const sb = await requireSupabase();
      const { error } = await sb.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
  },
  gallery: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("gallery_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as GalleryImage[];
    },
    async upsert(g: Partial<GalleryImage>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("gallery_images").upsert(g);
      if (error) throw error;
    },
    async remove(id: string) {
      const sb = await requireSupabase();
      const { error } = await sb.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
  },
  faqs: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Faq[];
    },
    async upsert(f: Partial<Faq>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("faqs").upsert(f);
      if (error) throw error;
    },
    async remove(id: string) {
      const sb = await requireSupabase();
      const { error } = await sb.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
  },
  settings: {
    async get() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return (data as SiteSettings) ?? defaultSettings;
    },
    async update(settings: Partial<SiteSettings>) {
      const sb = await requireSupabase();
      const { error } = await sb
        .from("site_settings")
        .update(settings)
        .eq("id", 1);
      if (error) throw error;
    },
  },
  inspections: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("inspection_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InspectionRequest[];
    },
    async updateStatus(id: string, status: InspectionRequest["status"]) {
      const sb = await requireSupabase();
      const { error } = await sb
        .from("inspection_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
  },
  profiles: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Profile[];
    },
    async upsert(p: Partial<Profile>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("profiles").upsert(p);
      if (error) throw error;
    },
    async setActive(id: string, active: boolean) {
      const sb = await requireSupabase();
      const { error } = await sb.from("profiles").update({ active }).eq("id", id);
      if (error) throw error;
    },
  },
  referrers: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("referrers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Referrer[];
    },
    async upsert(r: Partial<Referrer>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("referrers").upsert(r);
      if (error) throw error;
    },
    async remove(id: string) {
      const sb = await requireSupabase();
      const { error } = await sb.from("referrers").delete().eq("id", id);
      if (error) throw error;
    },
  },
  rewards: {
    async list() {
      const sb = await requireSupabase();
      const { data, error } = await sb
        .from("referral_rewards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ReferralReward[];
    },
    async upsert(r: Partial<ReferralReward>) {
      const sb = await requireSupabase();
      const { error } = await sb.from("referral_rewards").upsert(r);
      if (error) throw error;
    },
    async remove(id: string) {
      const sb = await requireSupabase();
      const { error } = await sb.from("referral_rewards").delete().eq("id", id);
      if (error) throw error;
    },
  },
};

export { isSupabaseConfigured };
