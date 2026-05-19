import useReveal from '../hooks/useReveal';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const STEPS = [
  { num: '01', title: 'Share Your Logo', desc: 'Upload your logo, colors, and design preferences through our simple online portal.' },
  { num: '02', title: 'Select & Specify', desc: 'Choose bottle size (250ml / 500ml / 1L), quantity, and label material type.' },
  { num: '03', title: 'Approve Design', desc: 'Receive a digital proof within 24 hours. Unlimited revisions until you\'re 100% satisfied.' },
  { num: '04', title: 'Get Delivery', desc: 'Your branded bottles arrive at your doorstep, packaged and ready to impress.' },
];

export default function HowItWorksSection() {
  const headRef = useReveal();
  const gridRef = useReveal();

  return (
    <section style={{ padding: '100px 5%', background: 'var(--navy-mid)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={headRef} className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionTag>The Process</SectionTag>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 52px)', color: 'var(--white)', lineHeight: 1.15,
          }}>
            From Idea to Delivery in 4 Steps
          </h2>
        </div>

        <div ref={gridRef} className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          position: 'relative',
        }} id="steps-grid">
          {STEPS.map(({ num, title, desc }, i) => (
            <div key={num} className="glass-card step-card" style={{ padding: '36px 24px', textAlign: 'center', position: 'relative' }}>
              <div className="step-num" style={{
                width: 56, height: 56, borderRadius: '50%',
                border: '2px solid var(--aqua)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                fontFamily: "'Cormorant Garamond', serif", fontSize: 22,
                fontWeight: 700, color: 'var(--aqua)',
                transition: 'all 0.3s',
              }}>
                {num}
              </div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600,
                color: 'var(--white)', marginBottom: 12,
              }}>{title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>

              {/* Connector line */}
              {i < 3 && (
                <div style={{
                  position: 'absolute', top: 58, right: -12,
                  width: 24, height: 2,
                  background: 'linear-gradient(90deg, var(--aqua), transparent)',
                  zIndex: 2,
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
