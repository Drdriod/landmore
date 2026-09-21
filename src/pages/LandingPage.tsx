import { useEffect, useState } from "react";
import duplexHero from "@/assets/duplex-hero.png";
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
import type {
  Faq,
  GalleryImage,
  Plot,
  Promo,
  Testimonial,
} from "@/lib/types";
import { PaymentCalculator } from "@/components/PaymentCalculator";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MessageCircle, Phone, Star, X } from "lucide-react";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function LandingPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [plots, setPlots] = useState<Plot[]>(defaultPlots);
  const [promo, setPromo] = useState<Promo | null>(null);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [gallery, setGallery] = useState<GalleryImage[]>(defaultGallery);
  const [faqs, setFaqs] = useState<Faq[]>(defaultFaqs);
  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referForm, setReferForm] = useState({ name: "", phone: "", address: "" });
  const [referResult, setReferResult] = useState<string | null>(null);
  const [referSubmitting, setReferSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettings);
    fetchPlots().then(setPlots);
    fetchActivePromo().then(setPromo);
    fetchTestimonials().then(setTestimonials);
    fetchGallery().then(setGallery);
    fetchFaqs().then(setFaqs);

    // Capture ?ref=CODE from a referral link and remember it for this visit,
    // so it's attached automatically when they book an inspection.
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      sessionStorage.setItem("dv_referral_code", ref.toUpperCase());
    }
    setReferralCode(sessionStorage.getItem("dv_referral_code"));
  }, []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    plotSize: "",
    date: "",
    time: "",
  });

  const whatsappNumber = settings.whatsapp_number;

  const handleSubmit = async () => {
    const { name, phone, email, plotSize, date, time } = form;
    if (!name || !phone || !email || !plotSize || !date || !time) {
      alert("Please fill all fields before submitting.");
      return;
    }
    await submitInspectionRequest({
      name,
      phone,
      email,
      plot_size: plotSize,
      preferred_date: date,
      preferred_time: time,
      referral_code: referralCode,
    });
    const msg = encodeURIComponent(
      `Hello ${settings.advisor_name}! I'd like to book a site inspection at Dara Villa Estate.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nPlot Size: ${plotSize}\nPreferred Date: ${date}\nPreferred Time: ${time}\n\nLooking forward to hearing from you. Thank you!`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
  };

  const availableCount = plots.filter((p) => p.status === "available").length;

  const referralLink = (code: string) => `${window.location.origin}${window.location.pathname}?ref=${code}`;

  const handleReferralSignup = async () => {
    if (!referForm.name || !referForm.phone || !referForm.address) {
      alert("Please enter your name, phone number, and address.");
      return;
    }
    setReferSubmitting(true);
    const res = await createCustomerReferral({
      name: referForm.name,
      phone: referForm.phone,
      address: referForm.address,
      reward_value: settings.customer_referral_reward,
    });
    setReferSubmitting(false);
    if (res.ok && res.code) {
      setReferResult(res.code);
    } else {
      alert("Something went wrong generating your referral code. Please try again or contact us on WhatsApp.");
    }
  };

  const openPlotWhatsApp = (plot: Plot) => {
    const note =
      plot.whatsapp_note ||
      `Hi! I'm interested in the ${plot.size_sqm} ${plot.unit_label} plot at Dara Villa Estate${
        plot.price > 0 ? ` (${formatNaira(plot.price)})` : ""
      }.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(note)}`, "_blank");
  };

  return (
    <div className="dv-root">
      <SEO settings={settings} faqs={faqs} />

      {/* PROMO BANNER */}
      {promo && !promoDismissed && (
        <div className="dv-promo-banner">
          <span>
            <strong>{promo.title}:</strong> {promo.message}
            {promo.discount_percent ? ` (${promo.discount_percent}% off)` : ""}
          </span>
          <button aria-label="Dismiss" onClick={() => setPromoDismissed(true)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* NAV */}
      <nav className="dv-nav" style={{ top: promo && !promoDismissed ? "2.4rem" : 0 }}>
        <a href="#home" className="dv-nav-logo">
          Land &amp; More <span>Reality</span>
        </a>
        <a href="#inspect" className="dv-nav-cta">
          Book Inspection
        </a>
      </nav>

      {/* HERO */}
      <section
        className="dv-hero"
        id="home"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(26,21,16,0.88) 0%, rgba(26,21,16,0.55) 50%, rgba(201,168,76,0.12) 100%), url(${duplexHero})` }}
      >
        <div>
          <span className="dv-hero-badge">{settings.hero_badge}</span>
          <h1 className="dv-hero-title">
            {settings.hero_title.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="dv-hero-sub">{settings.hero_subtitle}</p>
          <p className="dv-hero-desc">{settings.hero_description}</p>
          <div className="dv-hero-btns">
            <a href="#inspect" className="dv-btn-primary">
              Book a Free Inspection
            </a>
            <a href="#plots" className="dv-btn-ghost">
              View Available Plots
            </a>
          </div>
          {settings.google_rating && (
            <div className="dv-google-rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(settings.google_rating!) ? "dv-star-filled" : "dv-star-empty"}
                />
              ))}
              <span>
                {settings.google_rating.toFixed(1)} on Google
                {settings.google_review_count ? ` (${settings.google_review_count} reviews)` : ""}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* STATS BAR */}
      <div className="dv-stats-bar">
        {[
          { num: "100%", label: "Genuine Properties" },
          { num: "0", label: "Hidden Charges" },
          { num: "3", label: "Title Documents" },
          { num: "24/7", label: "After Sales Support" },
        ].map((s) => (
          <div className="dv-stat" key={s.label}>
            <span className="dv-stat-num">{s.num}</span>
            <span className="dv-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* WHY CHOOSE */}
      <section className="dv-why" id="about">
        <span className="dv-section-tag">Why Choose Us</span>
        <h2 className="dv-section-title">
          Built on <span className="dv-gold">Trust.</span>
          <br />Guided by Expertise.
        </h2>
        <div className="dv-why-grid">
          <div className="dv-why-items">
            {[
              {
                icon: "✦",
                title: "100% Genuine Properties",
                desc: "Every plot is verified, documented, and free from encumbrances before it's offered to you.",
              },
              {
                icon: "◈",
                title: "No Hidden Charges",
                desc: "What you see is what you pay. Full transparency from offer to title transfer.",
              },
              {
                icon: "❖",
                title: "Professional Realtors & Advisors",
                desc: "Our team guides you through every stage — we don't rush you, we guide you.",
              },
              {
                icon: "◇",
                title: "After Sales Support",
                desc: "Our relationship doesn't end at payment. We support you through development and beyond.",
              },
            ].map((item) => (
              <div className="dv-why-item" key={item.title}>
                <div className="dv-why-icon">{item.icon}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="dv-why-visual">
            <div className="dv-why-visual-title">Our Commitment to You</div>
            {[
              "Strong Investor Community",
              "Flexible Payment Plans Available",
              "Registered Survey Included",
              "Certificate of Deposit Provided",
              "Irrevocable Power of Attorney",
              `RC: ${settings.rc_number} — Fully Registered Company`,
              "Physical Office in Uyo, Akwa Ibom",
            ].map((item) => (
              <div className="dv-trust-item" key={item}>
                <span className="dv-trust-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="dv-location" id="location">
        <span className="dv-section-tag">Strategic Location</span>
        <h2 className="dv-section-title">
          Prime Position in <span className="dv-gold">Uyo's</span>
          <br />Fastest Growing Corridor
        </h2>
        <div className="dv-location-grid">
          <div>
            <div className="dv-location-address">
              <h4>Estate Address</h4>
              <p>{settings.address}</p>
            </div>
            <div className="dv-landmarks">
              {[
                { name: "Grace Estate", dist: "3 min walk" },
                { name: "Ikot Ekpene Road", dist: "3 min drive" },
                { name: "Dakada Skill Acquisition Center", dist: "5 min drive" },
                { name: "Idoro Road", dist: "5 min drive" },
                { name: "God'swill Akpabio Int'l Stadium", dist: "7 min drive" },
              ].map((lm) => (
                <div className="dv-landmark" key={lm.name}>
                  <span>{lm.name}</span>
                  <span className="dv-landmark-dist">{lm.dist}</span>
                </div>
              ))}
            </div>
            <div className="dv-insight-box">
              <p>
                "Areas connected to Ring Road experience rapid value appreciation
                — making this one of Uyo's most strategic investment addresses."
              </p>
            </div>
          </div>
          <div className="dv-location-features">
            {settings.map_embed_url ? (
              <iframe
                src={settings.map_embed_url}
                className="dv-map-embed"
                loading="lazy"
                title="Estate Location Map"
              />
            ) : (
              [
                {
                  title: "Direct Access to Major Roads",
                  desc: "Seamless connectivity to Uyo's key arterial routes and commercial zones.",
                },
                {
                  title: "Fast Growing Development Corridor",
                  desc: "Surrounded by active development driving consistent land value increase.",
                },
                {
                  title: "Close to Key Parts of Uyo Metropolis",
                  desc: "Minutes from major landmarks, markets, and government institutions.",
                },
                {
                  title: "Dry Table Land",
                  desc: "No flooding risk. Serene, accessible, and ready for immediate development.",
                },
                {
                  title: "Ideal for Residential & Investment Purposes",
                  desc: "Perfect for home builders, land banking, and future resale profit.",
                },
              ].map((f) => (
                <div className="dv-loc-feature" key={f.title}>
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* PLOTS */}
      <section className="dv-plots" id="plots">
        <span className="dv-section-tag">Available Plots</span>
        <h2 className="dv-section-title">
          Choose Your <span className="dv-gold">Plot Size</span>
        </h2>
        <p className="dv-section-desc">
          Flexible payment options available — outright purchase or instalment plans over 3–12 months.
          {availableCount > 0 && (
            <span className="dv-urgency"> Only {availableCount} plot type{availableCount > 1 ? "s" : ""} currently available.</span>
          )}
        </p>
        <div className="dv-plots-grid">
          {plots.map((plot) => {
            const discounted = plot.original_price && plot.original_price > plot.price;
            const sold = plot.status === "sold";
            const reserved = plot.status === "reserved";
            return (
              <div
                key={plot.id}
                className={`dv-plot-card ${plot.featured ? "dv-plot-featured" : ""} ${sold ? "dv-plot-sold" : ""}`}
              >
                {plot.featured && !sold && <span className="dv-plot-badge">Most Popular</span>}
                {sold && <span className="dv-plot-badge dv-plot-badge-sold">Sold Out</span>}
                {reserved && <span className="dv-plot-badge dv-plot-badge-reserved">Reserved</span>}
                <div className="dv-plot-size">{plot.size_sqm}</div>
                <div className="dv-plot-unit">{plot.unit_label}</div>
                {plot.price > 0 ? (
                  <div className="dv-plot-price">
                    {discounted && (
                      <span className="dv-plot-price-was">{formatNaira(plot.original_price!)}</span>
                    )}
                    {formatNaira(plot.price)}
                  </div>
                ) : (
                  <div className="dv-plot-price">Contact Us</div>
                )}
                <ul className="dv-plot-features">
                  {plot.features.slice(0, 5).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button className="dv-plot-btn" disabled={sold} onClick={() => setActivePlot(plot)}>
                  {sold ? "Sold Out" : "View Details"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="dv-calc-wrap">
          <h3 className="dv-calc-title">Payment Plan Calculator</h3>
          <PaymentCalculator plots={plots} />
        </div>
      </section>

      {/* TITLES */}
      <section className="dv-titles" id="titles">
        <span className="dv-section-tag">Land Documentation</span>
        <h2 className="dv-section-title">
          Your <span className="dv-gold">Title</span> is Secured
        </h2>
        <p className="dv-section-desc">
          Every plot at Dara Villa comes with complete, legally backed documentation.
        </p>
        <div className="dv-titles-grid">
          {[
            {
              icon: "📋",
              title: "Registered Survey",
              desc: "Officially surveyed and registered with the Akwa Ibom State government. Your plot boundaries are legally defined and protected.",
            },
            {
              icon: "🏛️",
              title: "Certificate of Deposit",
              desc: "Official proof of your purchase and ownership claim, issued by Land & More Reality Ltd upon payment confirmation.",
            },
            {
              icon: "⚖️",
              title: "Irrevocable Power of Attorney",
              desc: "A legally binding document granting you full rights over your plot — irrevocable, unconditional, and enforceable.",
            },
          ].map((t) => (
            <div className="dv-title-card" key={t.title}>
              <div className="dv-title-icon">{t.icon}</div>
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="dv-testimonials" id="testimonials">
          <span className="dv-section-tag dv-centered">What Our Clients Say</span>
          <h2 className="dv-section-title dv-centered">
            Trusted by <span className="dv-gold">Real Buyers</span>
          </h2>
          <div className="dv-testimonials-grid">
            {testimonials.map((t) => (
              <div className="dv-testimonial-card" key={t.id}>
                <div className="dv-testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="dv-star-filled" />
                  ))}
                </div>
                <p className="dv-testimonial-quote">"{t.quote}"</p>
                <div className="dv-testimonial-author">
                  {t.photo_url && <img src={t.photo_url} alt={t.name} />}
                  <div>
                    <strong>{t.name}</strong>
                    {t.role && <span>{t.role}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROGRESS GALLERY CAROUSEL */}
      {gallery.length > 0 && (
        <section className="dv-gallery" id="gallery">
          <span className="dv-section-tag dv-centered">Estate Development</span>
          <h2 className="dv-section-title dv-centered">
            See the <span className="dv-gold">Progress</span> for Yourself
          </h2>
          <div className="dv-gallery-carousel-wrap">
            <Carousel opts={{ loop: gallery.length > 1 }} className="dv-gallery-carousel">
              <CarouselContent>
                {gallery.map((g) => (
                  <CarouselItem key={g.id} className="md:basis-1/2 lg:basis-1/3">
                    <button className="dv-gallery-item" onClick={() => setLightboxImage(g)}>
                      <img src={g.image_url} alt={g.caption ?? "Estate development photo"} loading="lazy" />
                      {g.caption && <span>{g.caption}</span>}
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {gallery.length > 1 && (
                <>
                  <CarouselPrevious className="dv-carousel-btn dv-carousel-btn-prev" />
                  <CarouselNext className="dv-carousel-btn dv-carousel-btn-next" />
                </>
              )}
            </Carousel>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="dv-faq" id="faq">
          <span className="dv-section-tag dv-centered">Frequently Asked Questions</span>
          <h2 className="dv-section-title dv-centered">
            Answers <span className="dv-gold">Before You Ask</span>
          </h2>
          <div className="dv-faq-wrap">
            <Accordion type="single" collapsible>
              {faqs.map((f) => (
                <AccordionItem key={f.id} value={f.id} className="dv-faq-item">
                  <AccordionTrigger className="dv-faq-question">{f.question}</AccordionTrigger>
                  <AccordionContent className="dv-faq-answer">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* REFER & EARN */}
      <section className="dv-refer" id="refer">
        <span className="dv-section-tag dv-centered">Refer &amp; Earn</span>
        <h2 className="dv-section-title dv-centered">
          Know Someone Buying Land?
          <br />
          <span className="dv-gold">Earn {formatNaira(settings.customer_referral_reward)}</span>
        </h2>
        <p className="dv-section-desc dv-centered">
          Get your own referral link. When a friend you refer buys a plot, you receive{" "}
          {formatNaira(settings.customer_referral_reward)} — no limit on how many friends you refer.
        </p>
        <div className="dv-refer-box">
          {referResult ? (
            <div className="dv-refer-success">
              <p>Your referral number is ready:</p>
              <div className="dv-refer-code">{referResult}</div>
              <p className="dv-refer-link">{referralLink(referResult)}</p>
              <div className="dv-refer-actions">
                <button
                  className="dv-btn-ghost"
                  onClick={() => navigator.clipboard?.writeText(referralLink(referResult!))}
                >
                  Copy Link
                </button>
                <a
                  className="dv-btn-primary"
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out Dara Villa Luxury Estate in Uyo — verified land with flexible payment plans! ${referralLink(
                      referResult
                    )}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Share on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="dv-refer-form">
              <input
                type="text"
                placeholder="Your full name"
                value={referForm.name}
                onChange={(e) => setReferForm({ ...referForm, name: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Your phone number"
                value={referForm.phone}
                onChange={(e) => setReferForm({ ...referForm, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="Your address"
                value={referForm.address}
                onChange={(e) => setReferForm({ ...referForm, address: e.target.value })}
              />
              <button className="dv-form-submit" onClick={handleReferralSignup} disabled={referSubmitting}>
                {referSubmitting ? "Generating..." : "Get My Referral Number"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* INSPECTION FORM */}
      <section className="dv-inspection" id="inspect">
        <span className="dv-section-tag dv-centered">Book a Site Visit</span>
        <h2 className="dv-section-title dv-centered">
          Schedule Your <span className="dv-gold">Free Inspection</span>
        </h2>
        <p className="dv-section-desc dv-centered">
          Come see the land for yourself. Our advisor {settings.advisor_name} will walk you through the estate personally.
        </p>
        <div className="dv-form-wrap">
          <div className="dv-form-title">Inspection Request</div>
          <div className="dv-form-subtitle">
            Fill the form below and we'll confirm your slot within 24 hours
          </div>
          <div className="dv-form-grid">
            <div className="dv-form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="dv-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+234 xxx xxxx xxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="dv-form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="dv-form-group">
              <label>Preferred Plot Size</label>
              <select
                value={form.plotSize}
                onChange={(e) => setForm({ ...form, plotSize: e.target.value })}
              >
                <option value="">Select plot size</option>
                {plots.map((p) => (
                  <option key={p.id} value={`${p.size_sqm} ${p.unit_label}`}>
                    {p.size_sqm} {p.unit_label}
                    {p.price > 0 ? ` — ${formatNaira(p.price)}` : ""}
                    {p.status !== "available" ? ` (${p.status})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="dv-form-group">
              <label>Preferred Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="dv-form-group">
              <label>Preferred Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>
          <button className="dv-form-submit" onClick={handleSubmit}>
            Confirm Inspection Request →
          </button>
          <p className="dv-form-note">
            No commitment required. Inspection is 100% free.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="dv-contact" id="contact">
        <span className="dv-section-tag">Get in Touch</span>
        <h2 className="dv-section-title">
          Ready to Own
          <br />
          Your <span className="dv-gold">Piece of Uyo?</span>
        </h2>
        <div className="dv-contact-grid">
          <div>
            {[
              { icon: "📞", label: "Call Us", value: settings.phone, href: `tel:${settings.phone}` },
              { icon: "✉️", label: "Email", value: settings.email, href: `mailto:${settings.email}` },
              { icon: "📍", label: "Location", value: settings.address, href: null },
              { icon: "👩‍💼", label: "Your Property Advisor", value: settings.advisor_name, href: null },
            ].map((c) => (
              <div className="dv-contact-item" key={c.label}>
                <div className="dv-contact-icon">{c.icon}</div>
                <div>
                  <h5>{c.label}</h5>
                  {c.href ? <a href={c.href}>{c.value}</a> : <p>{c.value}</p>}
                </div>
              </div>
            ))}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="dv-whatsapp-btn"
            >
              <span>💬</span> Chat on WhatsApp
            </a>
          </div>
          <div>
            <div className="dv-bank-box">
              <h4>Payment Details</h4>
              {[
                { label: "Account Name", value: settings.bank_account_name },
                { label: "Account Number", value: settings.bank_account_number },
                { label: "Bank", value: settings.bank_name },
                { label: "RC Number", value: settings.rc_number },
              ].map((row) => (
                <div className="dv-bank-row" key={row.label}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="dv-payment-note">
              <p>
                Payments are non-refundable. Always confirm account details with
                your advisor before making any transfer. Land &amp; More Reality Ltd.
                will never request payment to a personal account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="dv-footer">
        <div>
          <div className="dv-footer-logo">
            Land &amp; More <span>Reality Ltd.</span>
          </div>
          <div className="dv-rc">
            RC: {settings.rc_number} · Uyo, Akwa Ibom State, Nigeria
          </div>
        </div>
        <div>© {new Date().getFullYear()} Land &amp; More Reality Ltd. All rights reserved.</div>
      </footer>

      {/* FLOATING ACTION BUTTONS */}
      <div className="dv-floating-btns">
        <a href={`tel:${settings.phone}`} className="dv-fab dv-fab-call" aria-label="Call us">
          <Phone size={20} />
        </a>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="dv-fab dv-fab-whatsapp"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={22} />
        </a>
      </div>

      {/* PLOT DETAIL MODAL */}
      {activePlot && (
        <div className="dv-modal-overlay" onClick={() => setActivePlot(null)}>
          <div className="dv-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dv-modal-close" onClick={() => setActivePlot(null)}>
              <X size={18} />
            </button>
            <div className="dv-plot-size">{activePlot.size_sqm}</div>
            <div className="dv-plot-unit">{activePlot.unit_label}</div>
            {activePlot.price > 0 ? (
              <div className="dv-plot-price">
                {activePlot.original_price && activePlot.original_price > activePlot.price && (
                  <span className="dv-plot-price-was">{formatNaira(activePlot.original_price)}</span>
                )}
                {formatNaira(activePlot.price)}
              </div>
            ) : (
              <div className="dv-plot-price">Contact Us for Pricing</div>
            )}
            <ul className="dv-plot-features">
              {activePlot.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button className="dv-plot-btn" onClick={() => openPlotWhatsApp(activePlot)}>
              WhatsApp Us About This Plot
            </button>
          </div>
        </div>
      )}

      {/* GALLERY LIGHTBOX */}
      {lightboxImage && (
        <div className="dv-modal-overlay" onClick={() => setLightboxImage(null)}>
          <div className="dv-lightbox" onClick={(e) => e.stopPropagation()}>
            <button className="dv-modal-close" onClick={() => setLightboxImage(null)}>
              <X size={18} />
            </button>
            <img src={lightboxImage.image_url} alt={lightboxImage.caption ?? ""} />
            {lightboxImage.caption && <p>{lightboxImage.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
