import { useReveal } from '../site/hooks'
import { MoonMountainIllustration } from '../site/ui.jsx'

// ─── About ────────────────────────────────────────────────────────────────────
export function AboutSection() {
  const leftRef = useReveal()
  const rightRef = useReveal()
  const FEATURES = [
    { icon:'🌊', label:'Himalayan-sourced purity' },
    { icon:'🎨', label:'250+ label designs' },
    { icon:'♻️', label:'Eco-friendly materials' },
    { icon:'⚡', label:'48-hour proofing' },
  ]
  return (
    <section id="about" className="sec" style={{ background:'var(--navy-mid)', position:'relative' }}>
      <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', maxWidth:1200, margin:'0 auto' }}>
        <div ref={leftRef} className="reveal-left" style={{ minWidth:0 }}>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', lineHeight:1.1, color:'var(--white)', marginBottom:24 }}>
            Born in the Himalayas,<br />Built for Your Brand
          </h2>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:20 }}>
            AquaVia was founded on one belief: that hydration is the most powerful touchpoint a brand can own. We source pure water from Himalayan springs and package it with your story — transforming every sip into a brand impression.
          </p>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:36 }}>
            From intimate boardrooms to large-scale conferences, our bottles carry your logo, your colors, and your message — delivered on time, every time, across every corner of India.
          </p>
          <div className="about-features" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {FEATURES.map(f => (
              <div key={f.label} className="glass-card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:22 }}>{f.icon}</span>
                <span style={{ fontSize:14, fontWeight:500, color:'var(--white)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* minWidth:0 — a grid/flex item defaults to min-content width, so without
            this the illustration column refuses to shrink and pushes the whole
            section past the viewport on narrow screens. */}
        <div ref={rightRef} className="reveal-right" style={{ display:'flex', justifyContent:'center', position:'relative', minWidth:0 }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'min(300px, 90%)', aspectRatio:'1', borderRadius:'50%',
            background:'radial-gradient(circle, rgba(62,207,191,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div className="glass-card about-art" style={{ padding:24, position:'relative', zIndex:1, minWidth:0, maxWidth:'100%' }}>
            <MoonMountainIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}
