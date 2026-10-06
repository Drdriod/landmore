import type {
  Faq,
  GalleryImage,
  Plot,
  SiteSettings,
  Testimonial,
} from "./types";

export const defaultSettings: SiteSettings = {
  id: 1,
  hero_badge: "VERIFIED LAND · UYO, AKWA IBOM",
  hero_title: "Own the land.\nBuild your future.",
  hero_subtitle: "Trust · Legality · Transparency",
  hero_description:
    "Secure premium plots at Dara Villa on Uyo's fast-growing New Ring Road corridor, with verified titles and clear guidance from inspection to allocation.",
  address: "New Ring Road by Berger Junction, Off Idoro Road, Uyo, Akwa Ibom State",
  phone: "08061730950",
  whatsapp_number: "2348144236651",
  email: "landmorereality@gmail.com",
  advisor_name: "Mrs. Mabel Bassey",
  rc_number: "9035696",
  bank_account_name: "Land & More Reality Ltd.",
  bank_account_number: "1311106621",
  bank_name: "Zenith Bank",
  map_embed_url: null,
  google_rating: null,
  google_review_count: null,
  customer_referral_reward: 50000,
  staff_referral_commission_percent: 2,
};

export const defaultPlots: Plot[] = [
  {
    id: "default-300",
    size_sqm: "300",
    unit_label: "Square Metres",
    price: 4500000,
    original_price: null,
    status: "available",
    featured: false,
    features: ["Starter home", "Land banking", "Flexible payment"],
    whatsapp_note: null,
    sort_order: 1,
    created_at: "",
  },
  {
    id: "default-450",
    size_sqm: "450",
    unit_label: "Square Metres",
    price: 6500000,
    original_price: null,
    status: "available",
    featured: true,
    features: ["Family residence", "Generous outdoor space", "Higher resale potential"],
    whatsapp_note: null,
    sort_order: 2,
    created_at: "",
  },
];

export const defaultTestimonials: Testimonial[] = [];
export const defaultGallery: GalleryImage[] = [];

export const defaultFaqs: Faq[] = [
  {
    id: "default-1",
    question: "Is the land free from disputes?",
    answer:
      "All title documents are available for review before purchase. We recommend independent verification.",
    sort_order: 1,
    created_at: "",
  },
  {
    id: "default-2",
    question: "Can I pay in instalments?",
    answer:
      "Yes. Flexible payment terms are available and confirmed in writing before payment.",
    sort_order: 2,
    created_at: "",
  },
  {
    id: "default-3",
    question: "What happens during inspection?",
    answer:
      "An advisor meets you on site, walks the estate boundary, and answers your questions.",
    sort_order: 3,
    created_at: "",
  },
];
