import { useRef, useState } from 'react'

import { track } from '../analytics/tracker'
import { PRODUCTS } from '../site/data'
import { useReveal } from '../site/hooks'
import { BottleSVG, SectionTag } from '../site/ui.jsx'

// ─── Customizer ───────────────────────────────────────────────────────────────
export function CustomizerSection() {
  const [logo, setLogo] = useState(null)
  const [color, setColor] = useState('#3ecfbf')
  const [size, setSize] = useState('500ml')
  const fileRef = useRef()
  const leftRef = useReveal()
  const rightRef = useReveal()

  const COLORS = [
    { hex: '#3ecfbf', name: 'Glacial Teal' },
    { hex: '#c8a44a', name: 'Durbar Gold' },
    { hex: '#5b8ff9', name: 'Himalayan Blue' },
    { hex: '#e85d75', name: 'Coral Rose' },
    { hex: '#7c4dff', name: 'Lavender' },
    { hex: '#ff7043', name: 'Amber' },
  ]
  // Derived, not a second hand-written list: this one silently kept offering
  // 100ml and 350ml after both were discontinued, and labelled the litre bottle
  // differently from the product cards. The chips ARE the SKUs.
  const SIZES = PRODUCTS.map(p => p.sku)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target.result)
    reader.readAsDataURL(file)
    // The logo itself is customer IP and the filename can identify a company —
    // record only that an upload happened, plus coarse non-identifying facts.
    track('customizer_logo_uploaded', {
      sectionId: 'customizer',
      props: { fileType: file.type, sizeBucket: file.size > 1e6 ? 'large' : 'small' },
    })
  }

  const chooseColor = (hex, name) => {
    setColor(hex)
    track('customizer_color_changed', { sectionId: 'customizer', props: { color: name } })
  }

  const chooseSize = (s) => {
    setSize(s)
    track('customizer_size_changed', { sectionId: 'customizer', productSku: s })
  }

  // The #customizer id lives on the lazy wrapper on the products page — see the
  // note there.
  return (
    <section className="sec" aria-labelledby="customizer-heading" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="sec-head">
          <SectionTag>Live Customizer</SectionTag>
          <h2 id="customizer-heading" style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Design Your Bottle, Live
          </h2>
        </div>

        <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
          {/* Controls */}
          <div ref={leftRef} className="reveal-left">
            {/* Upload zone */}
            <button type="button" onClick={() => fileRef.current?.click()} style={{
              width:'100%', border:'2px dashed rgba(62,207,191,0.3)', borderRadius:18, padding:'32px',
              textAlign:'center', cursor:'pointer', marginBottom:28, transition:'border-color 0.3s',
              background:'rgba(11,34,68,0.4)'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(62,207,191,0.6)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(62,207,191,0.3)'}
            >
              {logo ? (
                <div>
                  <img src={logo} alt="logo preview" style={{ maxHeight:80, maxWidth:160, objectFit:'contain', marginBottom:12 }} />
                  <div style={{ color:'var(--aqua)', fontSize:13, fontWeight:600 }}>Logo uploaded ✓</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:36, marginBottom:10 }}>☁️</div>
                  <div style={{ color:'var(--white)', fontWeight:600, marginBottom:6 }}>Upload Your Logo</div>
                  <div style={{ color:'var(--muted)', fontSize:13 }}>PNG, SVG or JPG · Max 5MB</div>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
            {logo && (
              <button onClick={() => setLogo(null)} style={{
                background:'transparent', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8,
                padding:'8px 16px', color:'var(--muted)', fontSize:13, cursor:'pointer',
                marginTop:-16, marginBottom:24, display:'block'
              }}>Remove logo</button>
            )}

            {/* Color picker */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--white)', marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>Label Color</div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    aria-label={`${c.name}${color === c.hex ? ' (selected)' : ''}`}
                    onClick={() => chooseColor(c.hex, c.name)}
                    style={{
                      width:32, height:32, borderRadius:'50%', background:c.hex, cursor:'pointer',
                      transition:'all 0.2s', border:'none', padding:0,
                      boxShadow: color === c.hex ? `0 0 0 3px white, 0 0 0 5px ${c.hex}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom:36 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--white)', marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>Bottle Size</div>
              <div style={{ display:'flex', gap:10 }}>
                {SIZES.map(s => (
                  <button key={s} onClick={() => chooseSize(s)} style={{
                    borderRadius:50, padding:'9px 22px', fontSize:14, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.25s',
                    background: size === s ? 'var(--aqua)' : 'rgba(11,34,68,0.8)',
                    color: size === s ? 'var(--navy)' : 'var(--muted)',
                    borderColor: size === s ? 'var(--aqua)' : 'var(--glass-border)'
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <a href="/contact" style={{
              display:'block', textDecoration:'none', textAlign:'center', boxSizing:'border-box',
              width:'100%', background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
              border:'none', borderRadius:14, padding:'16px', color:'var(--navy)',
              fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16, cursor:'pointer', transition:'all 0.3s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >Request This Design →</a>
          </div>

          {/* Live preview */}
          <div ref={rightRef} className="reveal-right">
            <div className="glass-card" style={{ padding:40, minHeight:380, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
              <BottleSVG logo={logo} color={color} label={size} size={280} animationClass="floatB 4s ease-in-out infinite" />
              <div style={{ color:'var(--muted)', fontSize:14, fontWeight:500 }}>Your brand. Live preview.</div>
              <div style={{ color:'var(--muted)', fontSize:12, opacity:0.7, textAlign:'center', maxWidth:260 }}>
                Final print may vary slightly based on label material
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
