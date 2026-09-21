import type {
  Faq,
  GalleryImage,
  Plot,
  SiteSettings,
  Testimonial,
} from "./types";

export const defaultSettings: SiteSettings = {
  id: 1,
  hero_badge: "Dara Villa Luxury Estate · Uyo, Akwa Ibom",
  hero_title: "We Don't Just Sell Land. We Bring Your Dreams To Reality.",
  hero_subtitle: "Trust · Legality · Transparency",
  hero_description:
    "Premium plots now available at New Ring Road, Berger Junction off Idoro Road, Uyo. Registered survey, verified titles, and professional guidance from start to finish.",
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
    features: [
      "Registered Survey",
      "Certificate of Deposit",
      "Irrevocable Power of Attorney",
      "Accessible Road Network",
      "Dry Table Land",
    ],
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
    features: [
      "Registered Survey",
      "Certificate of Deposit",
      "Irrevocable Power of Attorney",
      "Accessible Road Network",
      "Dry Table Land",
    ],
    whatsapp_note: null,
    sort_order: 2,
    created_at: "",
  },
  {
    id: "default-custom",
    size_sqm: "Custom",
    unit_label: "Custom Size",
    price: 0,
    original_price: null,
    status: "available",
    featured: false,
    features: [
      "Tailored to your needs",
      "Multiple plots available",
      "Investor packages",
      "Land banking options",
      "Flexible terms",
    ],
    whatsapp_note: null,
    sort_order: 3,
    created_at: "",
  },
];

export const defaultTestimonials: Testimonial[] = [];
export const defaultGallery: GalleryImage[] = [];

export const defaultFaqs: Faq[] = [
  {
    id: "default-1",
    question: "Is the land at Dara Villa Estate genuine and free of disputes?",
    answer:
      "Yes. Every plot is verified and registered with the Akwa Ibom State government before it is offered for sale, and comes with a registered survey, certificate of deposit, and irrevocable power of attorney.",
    sort_order: 1,
    created_at: "",
  },
  {
    id: "default-2",
    question: "What documents do I get after buying a plot?",
    answer:
      "You receive a Registered Survey, a Certificate of Deposit, and an Irrevocable Power of Attorney — all legally binding documents proving your ownership.",
    sort_order: 2,
    created_at: "",
  },
  {
    id: "default-3",
    question: "Can I pay in instalments?",
    answer:
      "Yes. Flexible payment plans are available over 3 to 6 months in addition to outright purchase. Use the payment calculator on this page or contact your advisor for a custom plan.",
    sort_order: 3,
    created_at: "",
  },
];
