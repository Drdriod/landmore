import { useState } from "react";
import duplexHero from "@/assets/duplex-hero.png";

export default function LandingPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    plotSize: "",
    date: "",
    time: "",
  });

  const handleSubmit = () => {
    const { name, phone, email, plotSize, date, time } = form;
    if (!name || !phone || !email || !plotSize || !date || !time) {
      alert("Please fill all fields before submitting.");
      return;
    }
    const msg = encodeURIComponent(
      `Hello Mrs. Mabel! I'd like to book a site inspection at Dara Villa Estate.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nPlot Size: ${plotSize}\nPreferred Date: ${date}\nPreferred Time: ${time}\n\nLooking forward to hearing from you. Thank you!`
    );
    window.open(`https://wa.me/2348144236651?text=${msg}`, "_blank");
  };

  return (
    <div className="dv-root">
      {/* NAV */}
      <nav className="dv-nav">
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
          <span className="dv-hero-badge">
            Dara Villa Luxury Estate · Uyo, Akwa Ibom
          </span>
          <h1 className="dv-hero-title">
            We Don't Just<br />Sell Land. We Bring<br />Your{" "}
            <span className="dv-gold">Dreams</span>
            <br />To Reality.
          </h1>
          <p className="dv-hero-sub">Trust · Legality · Transparency</p>
          <p className="dv-hero-desc">
            Premium plots now available at New Ring Road, Berger Junction off
            Idoro Road, Uyo. Registered survey, verified titles, and professional
            guidance from start to finish.
          </p>
          <div className="dv-hero-btns">
            <a href="#inspect" className="dv-btn-primary">
              Book a Free Inspection
            </a>
            <a href="#plots" className="dv-btn-ghost">
              View Available Plots
            </a>
          </div>
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
              "RC: 9035696 — Fully Registered Company",
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
              <p>
                New Ring Road by Berger Junction
                <br />
                Off Idoro Road, Uyo, Akwa Ibom State
              </p>
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
            {[
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
            ))}
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
          Flexible payment options available — outright purchase or instalment
          plans over 3–6 months.
        </p>
        <div className="dv-plots-grid">
          <div className="dv-plot-card">
            <div className="dv-plot-size">300</div>
            <div className="dv-plot-unit">Square Metres</div>
            <div className="dv-plot-price">₦4,500,000</div>
            <ul className="dv-plot-features">
              <li>Registered Survey</li>
              <li>Certificate of Deposit</li>
              <li>Irrevocable Power of Attorney</li>
              <li>Accessible Road Network</li>
              <li>Dry Table Land</li>
            </ul>
            <a href="#inspect" className="dv-plot-btn">
              Book Inspection
            </a>
          </div>
          <div className="dv-plot-card dv-plot-featured">
            <span className="dv-plot-badge">Most Popular</span>
            <div className="dv-plot-size">450</div>
            <div className="dv-plot-unit">Square Metres</div>
            <div className="dv-plot-price">₦6,500,000</div>
            <ul className="dv-plot-features">
              <li>Registered Survey</li>
              <li>Certificate of Deposit</li>
              <li>Irrevocable Power of Attorney</li>
              <li>Accessible Road Network</li>
              <li>Dry Table Land</li>
            </ul>
            <a href="#inspect" className="dv-plot-btn">
              Book Inspection
            </a>
          </div>
          <div className="dv-plot-card">
            <div className="dv-plot-size">—</div>
            <div className="dv-plot-unit">Custom Size</div>
            <div className="dv-plot-price">Contact Us</div>
            <ul className="dv-plot-features">
              <li>Tailored to your needs</li>
              <li>Multiple plots available</li>
              <li>Investor packages</li>
              <li>Land banking options</li>
              <li>Flexible terms</li>
            </ul>
            <a
              href="https://wa.me/2348144236651"
              target="_blank"
              rel="noreferrer"
              className="dv-plot-btn"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* TITLES */}
      <section className="dv-titles" id="titles">
        <span className="dv-section-tag">Land Documentation</span>
        <h2 className="dv-section-title">
          Your <span className="dv-gold">Title</span> is Secured
        </h2>
        <p className="dv-section-desc">
          Every plot at Dara Villa comes with complete, legally backed
          documentation.
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

      {/* INSPECTION FORM */}
      <section className="dv-inspection" id="inspect">
        <span className="dv-section-tag dv-centered">Book a Site Visit</span>
        <h2 className="dv-section-title dv-centered">
          Schedule Your <span className="dv-gold">Free Inspection</span>
        </h2>
        <p className="dv-section-desc dv-centered">
          Come see the land for yourself. Our advisor Mrs. Mabel Bassey will walk
          you through the estate personally.
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
                <option>300 sqm — ₦4,500,000</option>
                <option>450 sqm — ₦6,500,000</option>
                <option>Custom / Investor Package</option>
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
              { icon: "📞", label: "Call Us", value: "08061730950", href: "tel:08061730950" },
              { icon: "✉️", label: "Email", value: "landmorereality@gmail.com", href: "mailto:landmorereality@gmail.com" },
              { icon: "📍", label: "Location", value: "Uyo, Akwa Ibom State, Nigeria", href: null },
              { icon: "👩‍💼", label: "Your Property Advisor", value: "Mrs. Mabel Bassey", href: null },
            ].map((c) => (
              <div className="dv-contact-item" key={c.label}>
                <div className="dv-contact-icon">{c.icon}</div>
                <div>
                  <h5>{c.label}</h5>
                  {c.href ? (
                    <a href={c.href}>{c.value}</a>
                  ) : (
                    <p>{c.value}</p>
                  )}
                </div>
              </div>
            ))}
            <a
              href="https://wa.me/2348144236651"
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
                { label: "Account Name", value: "Land & More Reality Ltd." },
                { label: "Account Number", value: "1311106621" },
                { label: "Bank", value: "Zenith Bank" },
                { label: "RC Number", value: "9035696" },
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
            RC: 9035696 · Uyo, Akwa Ibom State, Nigeria
          </div>
        </div>
        <div>© 2025 Land &amp; More Reality Ltd. All rights reserved.</div>
      </footer>
    </div>
  );
}
