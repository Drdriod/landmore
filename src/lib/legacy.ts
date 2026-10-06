import { defaultFaqs, defaultPlots, defaultSettings } from "./defaults";
import type { Faq, Plot, SiteSettings } from "./types";

// The first version of the site seeded the database with the copy below.
// If a row in the database still holds that untouched starter copy, the page
// shows the updated copy from defaults.ts instead. Anything the owner has
// edited in /admin is never replaced.

const LEGACY_HERO: Partial<Record<keyof SiteSettings, string>> = {
  hero_badge: "Dara Villa Luxury Estate · Uyo, Akwa Ibom",
  hero_title: "We Don't Just Sell Land. We Bring Your Dreams To Reality.",
  hero_description:
    "Premium plots now available at New Ring Road, Berger Junction off Idoro Road, Uyo. Registered survey, verified titles, and professional guidance from start to finish.",
};

export function upgradeLegacySettings(s: SiteSettings): SiteSettings {
  const next: SiteSettings = { ...s };
  (Object.keys(LEGACY_HERO) as (keyof SiteSettings)[]).forEach((key) => {
    if (s[key] === LEGACY_HERO[key]) {
      (next as unknown as Record<string, unknown>)[key] = defaultSettings[key];
    }
  });
  return next;
}

const LEGACY_DOC_FEATURES = [
  "Registered Survey",
  "Certificate of Deposit",
  "Irrevocable Power of Attorney",
  "Accessible Road Network",
  "Dry Table Land",
];

const LEGACY_CUSTOM_FEATURES = [
  "Tailored to your needs",
  "Multiple plots available",
  "Investor packages",
  "Land banking options",
  "Flexible terms",
];

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, i) => item === b[i]);

export function upgradeLegacyPlots(plots: Plot[]): Plot[] {
  const upgraded: Plot[] = [];
  for (const plot of plots) {
    const fresh = defaultPlots.find((d) => d.size_sqm === plot.size_sqm);

    // Old starter "Custom" card is replaced by a Custom option in the form.
    if (
      plot.size_sqm === "Custom" &&
      plot.price === 0 &&
      sameList(plot.features, LEGACY_CUSTOM_FEATURES)
    ) {
      continue;
    }

    if (fresh && sameList(plot.features, LEGACY_DOC_FEATURES)) {
      upgraded.push({ ...plot, features: fresh.features });
    } else {
      upgraded.push(plot);
    }
  }
  return upgraded.length > 0 ? upgraded : plots;
}

const LEGACY_FAQ_QUESTIONS = [
  "Is the land at Dara Villa Estate genuine and free of disputes?",
  "What documents do I get after buying a plot?",
  "Can I pay in instalments?",
];

export function upgradeLegacyFaqs(faqs: Faq[]): Faq[] {
  const untouched =
    faqs.length === LEGACY_FAQ_QUESTIONS.length &&
    LEGACY_FAQ_QUESTIONS.every((q) => faqs.some((f) => f.question === q));
  return untouched ? defaultFaqs : faqs;
}
