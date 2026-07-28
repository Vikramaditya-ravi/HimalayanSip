import { useMemo } from 'react'

import { TESTIMONIALS } from '../site/data'
import { useGeo, useReveal } from '../site/hooks'

// ─── Testimonials ─────────────────────────────────────────────────────────────
export function TestimonialsSection() {
  const { content } = useGeo()
  const allTestimonials = useMemo(() => {
    if (!content?.localTestimonial) return TESTIMONIALS
    return [{ ...content.localTestimonial, isLocal: true }, ...TESTIMONIALS]
  }, [content?.localTestimonial])

  const titleRef = useReveal()
  const doubled = [...allTestimonials, ...allTestimonials]

  // The #testimonials id lives on the lazy wrapper on the home page — see the
  // note there.
  return (
    <section className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Trusted by India's Leading Brands
          </h2>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-track" style={{ animation:'marquee 20s linear infinite' }}>
            {doubled.map((t, i) => (
              <div key={`${t.name}-${i}`} style={{
                background:'var(--navy-card)', border:'1px solid var(--glass-border)',
                borderRadius:20, padding:'28px 24px', position:'relative',
                flex:'0 0 380px', minWidth:380, marginRight:24,
              }}>
                {t.isLocal && (
                  <div style={{ position:'absolute', top:14, right:14, fontSize:11, fontWeight:700, color:'var(--aqua)', background:'rgba(62,207,191,0.1)', border:'1px solid rgba(62,207,191,0.3)', borderRadius:50, padding:'2px 10px', letterSpacing:'0.08em' }}>
                    📍 Delhi NCR
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(62,207,191,0.15)',
                    border:'1px solid rgba(62,207,191,0.3)', display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16, color:'var(--aqua)', flexShrink:0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15, color:'var(--white)' }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>{t.title}</div>
                  </div>
                </div>
                <div style={{ color:'var(--gold)', fontSize:14, marginBottom:12, letterSpacing:2 }}>{'★'.repeat(t.rating)}</div>
                <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.75, fontStyle:'italic' }}>&ldquo;{t.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
