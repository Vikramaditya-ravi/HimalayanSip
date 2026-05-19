import BottleSVG from './svg/BottleSVG';
import MountainBg from './svg/MountainBg';

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

export default function HeroSection() {
  return (
    <section style={{
      minHeight: '100vh', paddingTop: 72, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #04101f 0%, #071428 40%, #061020 100%)',
      display: 'flex', alignItems: 'center',
    }}>
      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: 500, height: 500,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,191,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '5%', width: 400, height: 400,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,143,249,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <MountainBg />

      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '60px 5% 120px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
        alignItems: 'center', width: '100%', position: 'relative', zIndex: 1,
      }} className="hero-grid">
        {/* Left column */}
        <div>
          <SectionTag>B2B Premium Water Branding</SectionTag>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 1.1,
            color: 'var(--white)', marginBottom: 24,
          }}>
            Pure Water.<br />
            <span style={{
              background: 'linear-gradient(270deg, #3ecfbf, #f5faff, #c8a44a, #3ecfbf)',
              backgroundSize: '300%', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'shimText 5s ease infinite',
            }}>Your Brand.</span>
          </h1>
          <p style={{
            fontSize: 18, color: 'var(--muted)', lineHeight: 1.75,
            marginBottom: 36, maxWidth: 480,
          }}>
            Premium customized bottled water for hotels, corporates, events, and real estate.
            Elevate every touchpoint with water that carries your story.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
            <button
              onClick={() => scrollTo('customizer')}
              className="hero-btn-primary"
              style={{
                background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
                border: 'none', color: 'var(--navy)', fontWeight: 600,
                fontSize: 16, padding: '14px 32px', borderRadius: 50,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.25s',
              }}
            >
              Customize Your Bottle
            </button>
            <button
              onClick={() => scrollTo('contact')}
              style={{
                background: 'transparent', border: '1px solid rgba(62,207,191,0.4)',
                color: 'var(--white)', fontWeight: 500, fontSize: 16,
                padding: '14px 32px', borderRadius: 50, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.25s',
              }}
            >
              Get a Quote →
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[['500+', 'Brands Served'], ['2Cr+', 'Bottles Delivered'], ['48hr', 'Proof Turnaround']].map(([num, label]) => (
              <div key={label}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 32,
                  fontWeight: 700, color: 'var(--aqua)',
                }}>{num}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — bottle trio */}
        <div className="bottle-trio" style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ marginBottom: 40 }}>
            <BottleSVG color="#c8a44a" label="250ml" size={180} animationClass="floatA" />
          </div>
          <div style={{ marginBottom: 0 }}>
            <BottleSVG color="#3ecfbf" label="500ml" size={220} animationClass="floatB" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <BottleSVG color="#5b8ff9" label="1 Litre" size={190} animationClass="floatC" />
          </div>
        </div>
      </div>
    </section>
  );
}
