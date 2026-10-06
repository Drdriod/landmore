import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import {
  createCustomerReferral,
  fetchActivePromo,
  fetchFaqs,
  fetchGallery,
  fetchPlots,
  fetchSettings,
  fetchTestimonials,
  submitInspectionRequest,
} from "@/lib/data";
import {
  defaultFaqs,
  defaultGallery,
  defaultPlots,
  defaultSettings,
  defaultTestimonials,
} from "@/lib/defaults";
import {
  formatNaira,
  formatNairaShort,
  formatPhone,
  initials,
  isNumericSize,
  sizeLabel,
} from "@/lib/format";
import type { Faq, GalleryImage, Plot, Promo, Testimonial } from "@/lib/types";
import { PaymentCalculator } from "@/components/PaymentCalculator";
import { SEO } from "@/components/SEO";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// ---------------------------------------------------------------------------
// Static content from the Figma design
// ---------------------------------------------------------------------------

// Regional stock imagery used in the Figma mockup. Swap these URLs (or import
// local files) once real drone photos of the estate are available, then set
// the three *_NOTE strings below to "" to remove the on-image labels.
const AERIAL_IMAGE =
  "https://images.unsplash.com/photo-1704230093402-c903d87735b4?auto=format&fit=crop&w=1800&q=88";
const ROAD_IMAGE =
  "https://images.unsplash.com/photo-1560118386-f35cf6a0791d?auto=format&fit=crop&w=1200&q=84";
const CITY_IMAGE =
  "https://images.unsplash.com/photo-1685266326473-5b99c3d08a7e?auto=format&fit=crop&w=1200&q=84";

const HERO_IMAGE_NOTE = "Regional imagery for mockup: replace with verified estate drone photo";
const LOCATION_IMAGE_NOTE = "Regional context imagery";
const DOCUMENT_PREVIEW_NOTE = "Preview placeholder: add a redacted verified document";

const MAPS_URL = "https://maps.google.com/?q=New+Ring+Road+Uyo+Akwa+Ibom";

const DOCUMENTS = [
  {
    code: "SURVEY",
    label: "Registered survey",
    detail: "Clearly defined coordinates and boundaries for your plot.",
  },
  {
    code: "RECEIPT",
    label: "Certificate of deposit",
    detail: "Official record of your purchase and ownership claim.",
  },
  {
    code: "LEGAL",
    label: "Power of attorney",
    detail: "Legally binding transfer of full rights over your plot.",
  },
];

const ROUTES = [
  { minutes: "03", place: "Grace Estate" },
  { minutes: "05", place: "Idoro Road" },
  { minutes: "07", place: "Godswill Akpabio Stadium" },
];

const ICON = { strokeWidth: 1.7, "aria-hidden": true } as const;

function plotTagline(plot: Plot) {
  if (!isNumericSize(plot.size_sqm)) return "Built around you";
  const size = Number(plot.size_sqm);
  if (size <= 300) return "A smart start";
  if (size <= 450) return "More room to grow";
  return "Space for bigger plans";
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Brand() {
  return (
    <a className="brand" href="#home" aria-label="Land and More Reality, home">
      <span className="brand-mark">L</span>
      <span className="brand-name">
        Land <i>&amp;</i> More
        <small>REALITY LTD.</small>
      </span>
    </a>
  );
}

function AppButton({
  children,
  className = "",
  disabled = false,
  href,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const classes = `button ${className}`.trim();
  if (href && !disabled) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? "eyebrow-light" : ""}`.trim()}>{children}</p>;
}

function Stars({ count, total = 5, size = 15 }: { count: number; total?: number; size?: number }) {
  return (
    <>
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill="currentColor"
          strokeWidth={0}
          aria-hidden
          className={i < count ? "" : "star-empty"}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [plots, setPlots] = useState<Plot[]>(defaultPlots);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [gallery, setGallery] = useState<GalleryImage[]>(defaultGallery);
  const [faqs, setFaqs] = useState<Faq[]>(defaultFaqs);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referForm, setReferForm] = useState({ name: "", phone: "", address: "" });
  const [referResult, setReferResult] = useState<string | null>(null);
  const [referSubmitting, setReferSubmitting] = useState(false);
  const [referError, setReferError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    plotSize: "",
    date: "",
    time: "Morning",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { saved: boolean; whatsappUrl: string }>(null);

  useEffect(() => {
    fetchSettings().then(setSettings);
    fetchPlots().then(setPlots);
    fetchActivePromo().then(setPromo);
    fetchTestimonials().then(setTestimonials);
    fetchGallery().then(setGallery);
    fetchFaqs().then(setFaqs);

    // Capture ?ref=CODE from a referral link and remember it for this visit,
    // so it is attached automatically when they book an inspection.
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) sessionStorage.setItem("dv_referral_code", ref.toUpperCase());
      setReferralCode(sessionStorage.getItem("dv_referral_code"));
    } catch {
      setReferralCode(null);
    }
  }, []);

  const whatsappNumber = settings.whatsapp_number;
  const whatsappHref = `https://wa.me/${whatsappNumber}`;
  const phoneHref = `tel:${settings.phone}`;

  // Hero figures are derived from the live plot list.
  const pricedPlots = plots.filter((p) => p.price > 0);
  const startingFrom = pricedPlots.length > 0 ? Math.min(...pricedPlots.map((p) => p.price)) : null;
  const sizes = plots.map((p) => Number(p.size_sqm)).filter((n) => Number.isFinite(n) && n > 0);
  const sizeRange =
    sizes.length === 0
      ? "Flexible sizes"
      : Math.min(...sizes) === Math.max(...sizes)
        ? `${Math.min(...sizes)} m²`
        : `${Math.min(...sizes)}–${Math.max(...sizes)} m²`;

  const titleLines = settings.hero_title.split("\n").filter((line) => line.trim() !== "");
  const addressParts = settings.address.split(/,\s*/);
  const addressLines =
    addressParts.length > 1
      ? [addressParts[0], addressParts.slice(1, 3).join(", ")]
      : [addressParts[0]];

  const planOptions = plots.filter((p) => p.status !== "sold").map((p) => sizeLabel(p));
  if (!plots.some((p) => p.size_sqm.toLowerCase() === "custom")) planOptions.push("Custom");

  const closeMenu = () => setMenuOpen(false);

  const handleInspectionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const { name, phone, plotSize, date, time } = form;
    let saved = false;
    try {
      const result = await submitInspectionRequest({
        name,
        phone,
        // The database column is required but the Figma form no longer asks for it.
        email: "",
        plot_size: plotSize,
        preferred_date: date,
        preferred_time: time,
        referral_code: referralCode,
      });
      saved = result.ok && result.saved;
    } catch {
      saved = false;
    }

    const message = encodeURIComponent(
      `Hello ${settings.advisor_name}! I'd like to book a site inspection at Dara Villa Estate.\n\nName: ${name}\nPhone: ${phone}\nPlot Size: ${plotSize}\nPreferred Date: ${date}\nPreferred Time: ${time}\n\nLooking forward to hearing from you. Thank you!`,
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    setSubmitting(false);
    setSubmitted({ saved, whatsappUrl });
    window.open(whatsappUrl, "_blank", "noopener");
  };

  const referralLink = (code: string) =>
    `${window.location.origin}${window.location.pathname}?ref=${code}`;

  const handleReferralSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (referSubmitting) return;
    setReferSubmitting(true);
    setReferError(null);
    try {
      const res = await createCustomerReferral({
        name: referForm.name,
        phone: referForm.phone,
        address: referForm.address,
        reward_value: settings.customer_referral_reward,
      });
      if (res.ok && res.code) {
        setReferResult(res.code);
      } else {
        setReferError(
          "Something went wrong generating your referral code. Please try again or contact us on WhatsApp.",
        );
      }
    } catch {
      setReferError(
        "Something went wrong generating your referral code. Please try again or contact us on WhatsApp.",
      );
    }
    setReferSubmitting(false);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="lm-site">
      <div className="site-shell">
        <SEO settings={settings} faqs={faqs} />

        {promo && !promoDismissed && (
          <div className="promo-banner" role="status">
            <span>
              <strong>{promo.title}:</strong> {promo.message}
              {promo.discount_percent ? ` (${promo.discount_percent}% off)` : ""}
            </span>
            <button aria-label="Dismiss promotion" onClick={() => setPromoDismissed(true)} type="button">
              <X size={16} {...ICON} />
            </button>
          </div>
        )}

        <header className="site-header">
          <div className="header-inner">
            <Brand />
            <nav className={`main-nav ${menuOpen ? "main-nav-open" : ""}`} aria-label="Main navigation">
              <a href="#location" onClick={closeMenu}>
                Location
              </a>
              <a href="#plots" onClick={closeMenu}>
                Plot sizes
              </a>
              <a href="#documents" onClick={closeMenu}>
                Documents
              </a>
              <a href="#faq" onClick={closeMenu}>
                FAQs
              </a>
            </nav>
            <AppButton className="button-small header-cta" href="#inspection">
              Book inspection <ArrowRight size={17} {...ICON} />
            </AppButton>
            <button
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
            >
              {menuOpen ? <X size={24} {...ICON} /> : <Menu size={24} {...ICON} />}
            </button>
          </div>
        </header>

        <main>
          {/* HERO */}
          <section className="hero" id="home">
            <div className="hero-copy">
              <Eyebrow>{settings.hero_badge}</Eyebrow>
              <h1>
                {titleLines.length > 1 ? (
                  <>
                    {titleLines.slice(0, -1).map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                    <em>{titleLines[titleLines.length - 1]}</em>
                  </>
                ) : (
                  titleLines[0]
                )}
              </h1>
              <p className="hero-lede">{settings.hero_description}</p>
              <div className="hero-actions">
                <AppButton href="#inspection">
                  Book a free inspection <ArrowRight size={18} {...ICON} />
                </AppButton>
                <AppButton className="button-text" href="#documents">
                  See title documents
                </AppButton>
              </div>
              <div className="hero-pricing">
                <div>
                  <span>Starting from</span>
                  <strong>{startingFrom ? formatNairaShort(startingFrom) : "Ask us"}</strong>
                </div>
                <div>
                  <span>Plot sizes</span>
                  <strong>{sizeRange}</strong>
                </div>
                <div>
                  <span>Inspection</span>
                  <strong>100% free</strong>
                </div>
              </div>
              {settings.google_rating ? (
                <div className="rating-line">
                  <Stars count={Math.round(settings.google_rating)} size={14} />
                  <span>
                    {settings.google_rating.toFixed(1)} on Google
                    {settings.google_review_count ? ` (${settings.google_review_count} reviews)` : ""}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="hero-visual">
              <img alt="Aerial view of a green road corridor in Nigeria" src={AERIAL_IMAGE} />
              <div className="hero-image-shade" />
              <div className="location-chip">
                <MapPin size={19} {...ICON} />
                <span>
                  New Ring Road
                  <small>Off Idoro Road, Uyo</small>
                </span>
              </div>
              {HERO_IMAGE_NOTE && <p className="image-note">{HERO_IMAGE_NOTE}</p>}
            </div>
          </section>

          {/* TRUST BAR */}
          <section className="trust-bar" aria-label="Key property assurances">
            <p>Land ownership should feel clear, not complicated.</p>
            <div className="trust-items">
              <span>
                <ShieldCheck size={20} {...ICON} /> Verified titles
              </span>
              <span>
                <FileText size={20} {...ICON} /> 3 ownership documents
              </span>
              <span>
                <Check size={20} {...ICON} /> No hidden charges
              </span>
            </div>
          </section>

          {/* DOCUMENTS */}
          <section className="story-section section-pad" id="documents">
            <div className="section-heading">
              <div>
                <Eyebrow>PROOF BEFORE PROMISES</Eyebrow>
                <h2>
                  See exactly what
                  <br />
                  <em>you&apos;re buying.</em>
                </h2>
              </div>
              <p>
                Every claim should come with evidence. Review the ownership documents with our
                advisor before you make a commitment.
              </p>
            </div>

            <div className="document-layout">
              <div className="document-preview">
                <div className="paper paper-back" />
                <div className="paper paper-front">
                  <div className="paper-header">
                    <span>LAND &amp; MORE REALITY LTD.</span>
                    <ShieldCheck size={24} {...ICON} />
                  </div>
                  <p>REGISTERED SURVEY</p>
                  <div className="survey-shape">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                    <span>D</span>
                  </div>
                  <div className="paper-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                  {DOCUMENT_PREVIEW_NOTE && <small>{DOCUMENT_PREVIEW_NOTE}</small>}
                </div>
              </div>
              <div className="document-list">
                {DOCUMENTS.map((doc, index) => (
                  <article key={doc.label}>
                    <div className="document-number">0{index + 1}</div>
                    <div>
                      <span className="document-code">{doc.code}</span>
                      <h3>{doc.label}</h3>
                      <p>{doc.detail}</p>
                    </div>
                    <Check size={20} {...ICON} />
                  </article>
                ))}
                <AppButton className="button-outline" href="#inspection">
                  Request document review <ArrowRight size={18} {...ICON} />
                </AppButton>
              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className="location-section section-pad" id="location">
            <div className="location-images">
              <img alt="Green roadside landscape in Nigeria" src={ROAD_IMAGE} loading="lazy" />
              <img alt="Aerial view of a green Nigerian city" src={CITY_IMAGE} loading="lazy" />
              {LOCATION_IMAGE_NOTE && <span className="photo-caption">{LOCATION_IMAGE_NOTE}</span>}
            </div>
            <div className="location-copy">
              <Eyebrow light>STRATEGIC LOCATION</Eyebrow>
              <h2>
                Connected today.
                <br />
                <em>Valuable tomorrow.</em>
              </h2>
              <p>
                Dara Villa sits along New Ring Road by Berger Junction, an accessible development
                corridor connecting homes, commerce, and key parts of Uyo.
              </p>
              <div className="route-list">
                {ROUTES.map((route) => (
                  <div key={route.place}>
                    <span>{route.minutes}</span>
                    <p>
                      <strong>minutes</strong>
                      {route.place}
                    </p>
                  </div>
                ))}
              </div>
              <a className="location-link" href={MAPS_URL} rel="noreferrer" target="_blank">
                <MapPin size={18} {...ICON} /> Open location in Google Maps
                <ArrowRight size={17} {...ICON} />
              </a>
              {settings.map_embed_url && (
                <iframe
                  className="map-embed"
                  loading="lazy"
                  src={settings.map_embed_url}
                  title="Estate location map"
                />
              )}
            </div>
          </section>

          {/* PLOTS */}
          <section className="plots-section section-pad" id="plots">
            <div className="plots-heading">
              <div>
                <Eyebrow>CHOOSE YOUR PLOT</Eyebrow>
                <h2>
                  Room for the life
                  <br />
                  <em>you&apos;re planning.</em>
                </h2>
              </div>
              <p>Clear pricing. Flexible terms. No surprise charges.</p>
            </div>
            <div className={`plot-grid ${plots.length === 2 ? "" : "plot-grid-wide"}`.trim()}>
              {plots.map((plot) => {
                const sold = plot.status === "sold";
                const reserved = plot.status === "reserved";
                const priced = plot.price > 0;
                const discounted = plot.original_price !== null && plot.original_price > plot.price;
                const numeric = isNumericSize(plot.size_sqm);
                return (
                  <article
                    className={`plot-card ${plot.featured && !sold ? "plot-featured" : ""} ${sold ? "plot-sold" : ""}`.trim()}
                    key={plot.id}
                  >
                    {sold ? (
                      <span className="popular-tag popular-tag-sold">SOLD OUT</span>
                    ) : reserved ? (
                      <span className="popular-tag popular-tag-reserved">RESERVED</span>
                    ) : plot.featured ? (
                      <span className="popular-tag">MOST POPULAR</span>
                    ) : null}
                    <p>{plotTagline(plot)}</p>
                    <div className="plot-size">
                      <strong className={numeric ? "" : "plot-size-text"}>{plot.size_sqm}</strong>
                      {numeric && (
                        <span>
                          square
                          <br />
                          metres
                        </span>
                      )}
                    </div>
                    <div className="plot-price">
                      <span>Outright price</span>
                      {priced ? (
                        <div className="price-row">
                          {discounted && <s className="plot-was">{formatNairaShort(plot.original_price!)}</s>}
                          <strong>{formatNairaShort(plot.price)}</strong>
                        </div>
                      ) : (
                        <strong>Contact us</strong>
                      )}
                    </div>
                    <ul>
                      {plot.features.slice(0, 4).map((feature) => (
                        <li key={feature}>
                          <Check size={16} {...ICON} /> {feature}
                        </li>
                      ))}
                    </ul>
                    <AppButton
                      className={plot.featured ? "" : "button-outline"}
                      disabled={sold}
                      href="#inspection"
                      onClick={() => setForm((f) => ({ ...f, plotSize: sizeLabel(plot) }))}
                    >
                      {sold ? (
                        "Sold out"
                      ) : (
                        <>
                          {numeric ? `Select ${sizeLabel(plot)}` : "Enquire now"}{" "}
                          <ArrowRight size={17} {...ICON} />
                        </>
                      )}
                    </AppButton>
                  </article>
                );
              })}

              <PaymentCalculator plots={plots} />
            </div>
          </section>

          {/* TESTIMONIALS (only when added in /admin) */}
          {testimonials.length > 0 && (
            <section className="testimonial-section section-pad" id="testimonials">
              <Eyebrow>WHAT OUR CLIENTS SAY</Eyebrow>
              <h2>
                Trusted by
                <br />
                <em>real buyers.</em>
              </h2>
              <div className="testimonial-grid">
                {testimonials.map((t) => (
                  <figure className="testimonial-card" key={t.id} style={{ margin: 0 }}>
                    <div className="testimonial-stars">
                      <Stars count={t.rating} total={t.rating} />
                    </div>
                    <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="testimonial-author">
                      {t.photo_url && <img src={t.photo_url} alt={t.name} loading="lazy" />}
                      <div>
                        <strong>{t.name}</strong>
                        {t.role && <span>{t.role}</span>}
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* PROGRESS GALLERY (only when added in /admin) */}
          {gallery.length > 0 && (
            <section className="gallery-section section-pad" id="gallery">
              <Eyebrow>ESTATE DEVELOPMENT</Eyebrow>
              <h2>
                See the progress
                <br />
                <em>for yourself.</em>
              </h2>
              <div className="gallery-wrap">
                <Carousel opts={{ loop: gallery.length > 1 }}>
                  <CarouselContent>
                    {gallery.map((g) => (
                      <CarouselItem key={g.id} className="md:basis-1/2 lg:basis-1/3">
                        <button className="gallery-item" onClick={() => setLightboxImage(g)} type="button">
                          <img src={g.image_url} alt={g.caption ?? "Estate development photo"} loading="lazy" />
                          {g.caption && <span>{g.caption}</span>}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {gallery.length > 1 && (
                    <>
                      <CarouselPrevious className="carousel-btn carousel-btn-prev" />
                      <CarouselNext className="carousel-btn carousel-btn-next" />
                    </>
                  )}
                </Carousel>
              </div>
            </section>
          )}

          {/* INSPECTION */}
          <section className="inspection-section section-pad" id="inspection">
            <div className="inspection-copy">
              <Eyebrow light>COME AND SEE FOR YOURSELF</Eyebrow>
              <h2>
                Your next step is
                <br />
                <em>a free inspection.</em>
              </h2>
              <p>
                Walk the estate, verify the location, and ask every question before you decide.
                There&apos;s no commitment and no inspection fee.
              </p>
              <div className="advisor">
                <div className="advisor-monogram">{initials(settings.advisor_name)}</div>
                <p>
                  <strong>{settings.advisor_name}</strong>
                  Property advisor · Uyo
                </p>
              </div>
              <a className="whatsapp-link" href={whatsappHref} rel="noreferrer" target="_blank">
                <MessageCircle size={20} {...ICON} /> Prefer WhatsApp? Chat with an advisor
              </a>
            </div>

            <form className="inspection-form" onSubmit={handleInspectionSubmit}>
              {submitted ? (
                <div className="form-success" role="status">
                  <ShieldCheck size={34} {...ICON} />
                  <h3>{submitted.saved ? "Request received." : "One last step."}</h3>
                  <p>
                    {submitted.saved
                      ? "We'll confirm your slot within 24 hours. You can also send your details straight to your advisor on WhatsApp."
                      : "Send your details to your advisor on WhatsApp so we can confirm your slot within 24 hours."}
                  </p>
                  <a className="button" href={submitted.whatsappUrl} rel="noreferrer" target="_blank">
                    Continue on WhatsApp <ArrowRight size={18} {...ICON} />
                  </a>
                  <AppButton className="button-text" onClick={() => setSubmitted(null)}>
                    Book another visit
                  </AppButton>
                </div>
              ) : (
                <>
                  <div className="form-heading">
                    <span>BOOK A SITE VISIT</span>
                    <strong>We&apos;ll confirm your slot within 24 hours.</strong>
                  </div>
                  <label>
                    Full name
                    <input
                      autoComplete="name"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      required
                      type="text"
                      value={form.name}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Phone number
                      <input
                        autoComplete="tel"
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+234"
                        required
                        type="tel"
                        value={form.phone}
                      />
                    </label>
                    <label>
                      Plot interest
                      <select
                        onChange={(e) => setForm({ ...form, plotSize: e.target.value })}
                        required
                        value={form.plotSize}
                      >
                        <option disabled value="">
                          Select size
                        </option>
                        {planOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="form-row">
                    <label>
                      Preferred date
                      <input
                        min={today}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                        type="date"
                        value={form.date}
                      />
                    </label>
                    <label>
                      Preferred time
                      <select onChange={(e) => setForm({ ...form, time: e.target.value })} value={form.time}>
                        <option>Morning</option>
                        <option>Afternoon</option>
                      </select>
                    </label>
                  </div>
                  <label className="consent">
                    <input
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      required
                      type="checkbox"
                    />
                    <span>I agree to be contacted about this inspection request.</span>
                  </label>
                  <AppButton disabled={submitting} type="submit">
                    {submitting ? "Sending..." : "Confirm inspection request"}{" "}
                    {!submitting && <ArrowRight size={18} {...ICON} />}
                  </AppButton>
                </>
              )}
            </form>
          </section>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section className="faq-section section-pad" id="faq">
              <div>
                <Eyebrow>COMMON QUESTIONS</Eyebrow>
                <h2>
                  Clear answers,
                  <br />
                  <em>before you commit.</em>
                </h2>
              </div>
              <div className="faq-list">
                {faqs.map((faq) => (
                  <details key={faq.id}>
                    <summary>
                      {faq.question}
                      <span>
                        <ChevronRight size={20} {...ICON} />
                      </span>
                    </summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* REFER & EARN */}
          <section className="refer-section section-pad" id="refer">
            <div className="refer-copy">
              <Eyebrow>REFER &amp; EARN</Eyebrow>
              <h2>
                Know someone
                <br />
                <em>buying land?</em>
              </h2>
              <p>
                Get your own referral link. When a friend you refer buys a plot, you receive{" "}
                {formatNaira(settings.customer_referral_reward)}, with no limit on how many friends
                you refer.
              </p>
            </div>
            <div className="refer-card">
              {referResult ? (
                <div>
                  <p className="refer-small">Your referral number is ready:</p>
                  <div className="refer-code">{referResult}</div>
                  <p className="refer-link">{referralLink(referResult)}</p>
                  <div className="refer-actions">
                    <AppButton
                      className="button-outline"
                      onClick={() => navigator.clipboard?.writeText(referralLink(referResult))}
                    >
                      Copy link
                    </AppButton>
                    <a
                      className="button"
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Check out Dara Villa Luxury Estate in Uyo, verified land with flexible payment plans! ${referralLink(referResult)}`,
                      )}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Share on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReferralSignup}>
                  {referError && <p className="form-error">{referError}</p>}
                  <label>
                    Full name
                    <input
                      autoComplete="name"
                      onChange={(e) => setReferForm({ ...referForm, name: e.target.value })}
                      placeholder="Your full name"
                      required
                      type="text"
                      value={referForm.name}
                    />
                  </label>
                  <label>
                    Phone number
                    <input
                      autoComplete="tel"
                      onChange={(e) => setReferForm({ ...referForm, phone: e.target.value })}
                      placeholder="+234"
                      required
                      type="tel"
                      value={referForm.phone}
                    />
                  </label>
                  <label>
                    Address
                    <input
                      autoComplete="street-address"
                      onChange={(e) => setReferForm({ ...referForm, address: e.target.value })}
                      placeholder="Your address"
                      required
                      type="text"
                      value={referForm.address}
                    />
                  </label>
                  <AppButton disabled={referSubmitting} type="submit">
                    {referSubmitting ? "Generating..." : "Get my referral number"}{" "}
                    {!referSubmitting && <ArrowRight size={18} {...ICON} />}
                  </AppButton>
                </form>
              )}
            </div>
          </section>
        </main>

        <footer>
          <div className="footer-main">
            <div>
              <Brand />
              <p>Verified land. Clear guidance. A more confident path to ownership in Uyo.</p>
            </div>
            <div>
              <span>VISIT</span>
              <p>
                {addressLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
            <div>
              <span>CONTACT</span>
              <a href={phoneHref}>{formatPhone(settings.phone)}</a>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <a className="footer-call" href={phoneHref} aria-label="Call Land and More">
              <Phone size={20} {...ICON} />
            </a>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Land &amp; More Reality Ltd. · RC {settings.rc_number}
            </span>
            <span>Uyo, Akwa Ibom State, Nigeria</span>
          </div>
        </footer>

        <div className="mobile-actions">
          <a href={phoneHref}>
            <Phone size={20} {...ICON} /> Call
          </a>
          <a href={whatsappHref} rel="noreferrer" target="_blank">
            <MessageCircle size={20} {...ICON} /> WhatsApp
          </a>
        </div>

        {lightboxImage && (
          <div className="lightbox-overlay" onClick={() => setLightboxImage(null)} role="dialog" aria-modal="true">
            <div className="lightbox" onClick={(e) => e.stopPropagation()}>
              <button
                aria-label="Close photo"
                className="lightbox-close"
                onClick={() => setLightboxImage(null)}
                type="button"
              >
                <X size={18} {...ICON} />
              </button>
              <img src={lightboxImage.image_url} alt={lightboxImage.caption ?? ""} />
              {lightboxImage.caption && <p>{lightboxImage.caption}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
