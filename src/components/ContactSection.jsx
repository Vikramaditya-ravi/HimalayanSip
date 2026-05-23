import { useState } from 'react';
import useReveal from '../hooks/useReveal';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const SOCIAL_ICONS = [
  { label: 'Instagram', svg: '📸', href: 'https://www.instagram.com/aquavia.official?igsh=eHVmM3F3MnI2OTl0' },
  { label: 'LinkedIn', svg: '💼', href: null },
  { label: 'Twitter', svg: '🐦', href: null },
  { label: 'YouTube', svg: '▶️', href: null },
];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', quantity: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const leftRef = useReveal();
  const rightRef = useReveal();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (!form.name || !form.email) return;
    setSubmitted(true);
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12, fontSize: 15,
    fontFamily: "'DM Sans', sans-serif", outline: 'none',
    background: 'rgba(11,34,68,0.6)', border: '1px solid var(--glass-border)',
    color: 'var(--white)', transition: 'all 0.25s',
  };

  return (
    <section id="contact" style={{ padding: '100px 5%', background: '#04101f' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start',
        }} className="contact-grid">
          {/* Left info */}
          <div ref={leftRef} className="reveal-left">
            <SectionTag>Get in Touch</SectionTag>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
              fontSize: 'clamp(28px, 3.5vw, 46px)', color: 'var(--white)', lineHeight: 1.15,
              marginBottom: 20,
            }}>
              Let's Build Something<br />
              <span style={{ color: 'var(--aqua)' }}>Together</span>
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 36, fontSize: 16 }}>
              Ready to make your brand unforgettable? Reach out and our team will get back to you within 24 hours.
            </p>

            {[
              { icon: '📍', label: 'Bengaluru, India' },
              { icon: '📞', label: '+91 98765 43210' },
              { icon: '📧', label: 'hello@aquavia.com' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ color: 'var(--white)', fontSize: 15 }}>{label}</span>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
              {SOCIAL_ICONS.map(({ label, svg, href }) => {
                const el = (
                  <div
                    key={label}
                    className="glass-card"
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, cursor: 'pointer',
                    }}
                    title={label}
                  >
                    {svg}
                  </div>
                );
                return href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{el}</a> : el;
              })}
            </div>
          </div>

          {/* Right form */}
          <div ref={rightRef} className="reveal-right">
            <div className="glass-card" style={{ padding: '40px 36px' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif", fontSize: 28,
                    color: 'var(--white)', marginBottom: 12,
                  }}>Enquiry Sent!</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                    We'll be in touch within 24 hours!
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <input
                      className="form-input"
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="Your Name" style={inputStyle}
                    />
                    <input
                      className="form-input"
                      name="company" value={form.company} onChange={handleChange}
                      placeholder="Company Name" style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <input
                        className="form-input"
                        name="email" value={form.email} onChange={handleChange}
                        placeholder="Email Address" type="email" style={inputStyle}
                      />
                      <input
                        className="form-input"
                        name="phone" value={form.phone} onChange={handleChange}
                        placeholder="Phone Number" type="tel" style={inputStyle}
                      />
                    </div>
                    <select
                      className="form-input"
                      name="quantity" value={form.quantity} onChange={handleChange}
                      style={{ ...inputStyle, appearance: 'none' }}
                    >
                      <option value="">Order Quantity</option>
                      <option value="100-500">100 – 500 bottles</option>
                      <option value="500-2000">500 – 2,000 bottles</option>
                      <option value="2000-10000">2,000 – 10,000 bottles</option>
                      <option value="10000+">10,000+ bottles</option>
                    </select>
                    <textarea
                      className="form-input"
                      name="message" value={form.message} onChange={handleChange}
                      placeholder="Tell us about your brand and requirements..."
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div
                    onClick={handleSubmit}
                    style={{
                      marginTop: 20, background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
                      color: 'var(--navy)', fontWeight: 700, fontSize: 16,
                      padding: '16px', borderRadius: 50, cursor: 'pointer',
                      textAlign: 'center', fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.25s', userSelect: 'none',
                    }}
                    className="submit-btn"
                  >
                    Send Enquiry →
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
