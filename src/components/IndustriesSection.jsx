import useReveal from '../hooks/useReveal';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const INDUSTRIES = [
  { icon: '🏨', name: 'Hotels & Resorts' },
  { icon: '🏥', name: 'Hospitals & Clinics' },
  { icon: '🏢', name: 'Corporate Offices' },
  { icon: '🎪', name: 'Events & Weddings' },
  { icon: '🏗️', name: 'Real Estate' },
  { icon: '💪', name: 'Gyms & Wellness' },
  { icon: '🍽️', name: 'Restaurants & Cafes' },
  { icon: '✈️', name: 'Airlines & Travel' },
];

export default function IndustriesSection() {
  const headRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="industries" style={{ padding: '100px 5%', background: 'var(--navy-mid)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={headRef} className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionTag>Who We Serve</SectionTag>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 52px)', color: 'var(--white)', lineHeight: 1.15,
          }}>
            Industries We Partner With
          </h2>
        </div>

        <div ref={gridRef} className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16,
        }}>
          {INDUSTRIES.map(({ icon, name }) => (
            <div key={name} className="industry-chip" style={{
              background: 'rgba(11,34,68,0.7)', border: '1px solid var(--glass-border)',
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'default', transition: 'all 0.25s',
            }}>
              <span style={{ fontSize: 28 }}>{icon}</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--white)', flex: 1 }}>{name}</span>
              <span style={{ color: 'var(--aqua)', fontSize: 18 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
