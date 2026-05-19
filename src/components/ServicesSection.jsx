import useReveal from '../hooks/useReveal';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const SERVICES = [
  { icon: '🎨', title: 'Custom Label Design', desc: 'Professional designers craft labels matching your brand identity, colors, and messaging perfectly.' },
  { icon: '📦', title: 'Bulk Corporate Orders', desc: 'Volume pricing that scales with your business. MOQ suited for companies of all sizes.' },
  { icon: '🎪', title: 'Event & Conference Branding', desc: 'Make a lasting impression at every corporate event or product launch with branded hydration.' },
  { icon: '🏨', title: 'Hotel & Restaurant Supply', desc: 'Elevate the guest experience with premium water that carries your brand\'s story.' },
  { icon: '🏢', title: 'Office & Enterprise', desc: 'Reinforce company culture daily with beautifully branded water on every desk.' },
  { icon: '🚚', title: 'Express Delivery', desc: 'Reliable pan-India delivery. Rush orders welcomed. Real-time shipment tracking.' },
];

export default function ServicesSection() {
  const headRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="services" style={{ padding: '100px 5%', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={headRef} className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionTag>What We Offer</SectionTag>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 52px)', color: 'var(--white)', lineHeight: 1.15,
          }}>
            End-to-End Branding Solutions
          </h2>
        </div>

        <div ref={gridRef} className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24,
        }}>
          {SERVICES.map(({ icon, title, desc }) => (
            <div key={title} className="glass-card service-card" style={{ padding: '32px 28px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(62,207,191,0.2), rgba(62,207,191,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 20,
                border: '1px solid rgba(62,207,191,0.15)',
              }}>
                {icon}
              </div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600,
                color: 'var(--white)', marginBottom: 12,
              }}>{title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 15 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
