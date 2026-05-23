import useReveal from '../hooks/useReveal';
import MoonMountainIllustration from './svg/MoonMountainIllustration';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const chips = [
  { emoji: '🌊', label: 'Himalayan-sourced purity' },
  { emoji: '🎨', label: '250+ label designs' },
  { emoji: '♻️', label: 'Eco-friendly materials' },
  { emoji: '⚡', label: '48-hour proofing' },
];

export default function AboutSection() {
  const leftRef = useReveal();
  const rightRef = useReveal();

  return (
    <section id="about" style={{
      padding: '100px 5%', background: 'var(--navy-mid)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
        alignItems: 'center',
      }} className="about-grid">
        {/* Left */}
        <div ref={leftRef} className="reveal-left">
          <SectionTag>Our Story</SectionTag>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.15,
            color: 'var(--white)', marginBottom: 24,
          }}>
            Where Pure Water Meets<br />
            <span style={{ color: 'var(--aqua)' }}>Premium Branding</span>
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 20, fontSize: 16 }}>
            Born in the heart of India, AquaVia was founded with a singular vision:
            to transform the everyday act of hydration into a brand statement. We source
            pristine water from Himalayan springs and bottle it with your identity.
          </p>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 36, fontSize: 16 }}>
            From luxury hotels to bustling corporate campuses, our customized bottles have
            become the silent ambassadors of over 500 brands across India.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {chips.map(({ emoji, label }) => (
              <div key={label} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--white)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div ref={rightRef} className="reveal-right" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(62,207,191,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="glass-card" style={{ padding: 24, position: 'relative', zIndex: 1 }}>
            <MoonMountainIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
