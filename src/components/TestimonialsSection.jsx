import { useState, useEffect } from 'react';
import useReveal from '../hooks/useReveal';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const TESTIMONIALS = [
  {
    name: 'Priya Sharma', title: 'Marketing Head, Nexus Realty', initials: 'PS',
    text: 'AquaVia transformed our site visits. Handing branded water to potential buyers elevated our brand perception instantly. Orders arrived ahead of schedule — flawless execution.',
    rating: 5,
  },
  {
    name: 'Arjun Mehta', title: 'Director of Operations, Transcend Hotels', initials: 'AM',
    text: 'As a luxury hotel group, presentation is everything. AquaVia bottles sit on every dining table. Guests always comment on them. Exceptional quality, beautiful labels, reliable supply.',
    rating: 5,
  },
  {
    name: 'Kiran Rao', title: 'COO, Summit Ventures', initials: 'KR',
    text: 'We\'ve branded our annual summit for 3 consecutive years with AquaVia. 800 attendees, branded bottles at every seat. The design team\'s attention to detail is genuinely unmatched.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const headRef = useReveal();
  const cardsRef = useReveal();

  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ padding: '100px 5%', background: 'var(--navy-mid)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={headRef} className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionTag>Testimonials</SectionTag>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 52px)', color: 'var(--white)', lineHeight: 1.15,
          }}>
            Brands That Trust Us
          </h2>
        </div>

        <div ref={cardsRef} className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
          marginBottom: 36,
        }} className="testimonials-grid reveal">
          {TESTIMONIALS.map(({ name, title, initials, text, rating }, i) => (
            <div
              key={name}
              className="glass-card"
              onClick={() => setActive(i)}
              style={{
                padding: '32px 28px', cursor: 'pointer', transition: 'all 0.4s',
                border: active === i ? '1px solid rgba(62,207,191,0.35)' : '1px solid var(--glass-border)',
                boxShadow: active === i ? '0 16px 50px rgba(62,207,191,0.08)' : 'none',
                transform: active === i ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(62,207,191,0.3), rgba(62,207,191,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: 'var(--aqua)',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 15 }}>{name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{title}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {Array(rating).fill('★').map((s, j) => (
                  <span key={j} style={{ color: 'var(--gold)', fontSize: 14 }}>{s}</span>
                ))}
              </div>
              <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: 14, fontStyle: 'italic' }}>
                "{text}"
              </p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                height: 8, width: active === i ? 28 : 8,
                borderRadius: 50, border: 'none', cursor: 'pointer',
                background: active === i ? 'var(--aqua)' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
