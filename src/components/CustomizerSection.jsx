import { useState, useRef } from 'react';
import useReveal from '../hooks/useReveal';
import BottleSVG from './svg/BottleSVG';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const COLORS = ['#3ecfbf', '#c8a44a', '#5b8ff9', '#e85d75', '#7c4dff', '#ff7043'];
const SIZES = ['250ml', '500ml', '1L'];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function CustomizerSection() {
  const [logo, setLogo] = useState(null);
  const [color, setColor] = useState('#3ecfbf');
  const [size, setSize] = useState('500ml');
  const fileRef = useRef(null);
  const leftRef = useReveal();
  const rightRef = useReveal();

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <section id="customizer" style={{ padding: '100px 5%', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionTag>Try It Now</SectionTag>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 52px)', color: 'var(--white)', lineHeight: 1.15,
          }}>
            Design Your Bottle Live
          </h2>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
        }} className="customizer-grid">
          {/* Controls */}
          <div ref={leftRef} className="reveal-left">
            {/* Upload zone */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(62,207,191,0.3)', borderRadius: 18,
                padding: '36px 24px', textAlign: 'center', cursor: 'pointer',
                marginBottom: 28, transition: 'all 0.25s', background: 'rgba(62,207,191,0.02)',
              }}
              className="upload-zone"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              {logo ? (
                <>
                  <img src={logo} alt="Logo preview" style={{ maxHeight: 80, maxWidth: 160, objectFit: 'contain', marginBottom: 12 }} />
                  <div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setLogo(null); }}
                      style={{
                        background: 'none', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'var(--muted)', fontSize: 13, padding: '6px 16px',
                        borderRadius: 50, cursor: 'pointer',
                      }}
                    >
                      Remove logo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📁</div>
                  <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 6 }}>Upload Your Logo</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>PNG, SVG or JPG · Max 5MB</div>
                </>
              )}
            </div>

            {/* Color picker */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Label Color
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: c, border: 'none', cursor: 'pointer',
                      boxShadow: color === c
                        ? `0 0 0 3px white, 0 0 0 5px ${c}`
                        : '0 0 0 2px rgba(255,255,255,0.1)',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Bottle Size
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      padding: '8px 20px', borderRadius: 50, fontSize: 14,
                      fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                      fontFamily: "'DM Sans', sans-serif",
                      background: size === s ? 'var(--aqua)' : 'transparent',
                      color: size === s ? 'var(--navy)' : 'var(--muted)',
                      border: size === s ? '1px solid var(--aqua)' : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => scrollTo('contact')}
              style={{
                background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
                border: 'none', color: 'var(--navy)', fontWeight: 600,
                fontSize: 16, padding: '14px 32px', borderRadius: 50,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.25s', width: '100%',
              }}
            >
              Request This Design
            </button>
          </div>

          {/* Live preview */}
          <div ref={rightRef} className="reveal-right">
            <div className="glass-card" style={{
              minHeight: 380, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 260, height: 260, borderRadius: '50%',
                background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />
              <BottleSVG logo={logo} color={color} label={size} size={240} />
              <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 16 }}>Your brand. Live preview.</div>
              <div style={{ color: 'rgba(122,155,181,0.6)', fontSize: 12, marginTop: 6 }}>
                Final print may vary slightly based on label material
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
