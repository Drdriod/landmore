import { useEffect } from "react";
import type { Faq, SiteSettings } from "@/lib/types";

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// Injects structured data understood by both search engines and AI answer
// engines (ChatGPT, Perplexity, Google AI Overviews) so questions about the
// estate can be answered directly, and updates meta tags from live settings.
export function SEO({ settings, faqs }: { settings: SiteSettings; faqs: Faq[] }) {
  useEffect(() => {
    const title = "Land & More Reality – Dara Villa Luxury Estate, Uyo";
    document.title = title;
    setMeta(
      "description",
      `${settings.hero_description} Call ${settings.phone} or WhatsApp us.`
    );
    setMeta("og:title", title, "property");
    setMeta("og:description", settings.hero_description, "property");
    setMeta("og:type", "website", "property");

    setJsonLd("ld-realestate", {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: "Land & More Reality Ltd.",
      description: settings.hero_description,
      telephone: settings.phone,
      email: settings.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address,
        addressLocality: "Uyo",
        addressRegion: "Akwa Ibom State",
        addressCountry: "NG",
      },
      ...(settings.google_rating
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: settings.google_rating,
              reviewCount: settings.google_review_count ?? 1,
            },
          }
        : {}),
    });

    if (faqs.length > 0) {
      setJsonLd("ld-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
  }, [settings, faqs]);

  return null;
}
