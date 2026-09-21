export type PlotStatus = "available" | "reserved" | "sold";

export interface Plot {
  id: string;
  size_sqm: string;
  unit_label: string;
  price: number;
  original_price: number | null;
  status: PlotStatus;
  featured: boolean;
  features: string[];
  whatsapp_note: string | null;
  sort_order: number;
  created_at: string;
}

export interface Promo {
  id: string;
  title: string;
  message: string;
  discount_percent: number | null;
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  rating: number;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  taken_on: string | null;
  sort_order: number;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export type InspectionStatus = "new" | "contacted" | "booked" | "closed";

export interface InspectionRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  plot_size: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: InspectionStatus;
  referral_code: string | null;
  created_at: string;
}

export type UserRole = "admin" | "staff";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  referral_code: string | null;
  commission_percent: number;
  active: boolean;
  created_at: string;
}

export type ReferrerType = "staff" | "customer";
export type RewardType = "fixed" | "percent";

export interface Referrer {
  id: string;
  type: ReferrerType;
  name: string;
  phone: string;
  address: string | null;
  code: string;
  reward_type: RewardType;
  reward_value: number;
  profile_id: string | null;
  created_at: string;
}

export type RewardStatus = "pending" | "approved" | "paid";

export interface ReferralReward {
  id: string;
  referrer_id: string;
  inspection_request_id: string | null;
  plot_id: string | null;
  amount: number;
  status: RewardStatus;
  note: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  advisor_name: string;
  rc_number: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  map_embed_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  customer_referral_reward: number;
  staff_referral_commission_percent: number;
}
