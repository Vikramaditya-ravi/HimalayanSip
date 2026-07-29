import { SERVICES } from '../site/data'
import { useReveal } from '../site/hooks'

// ─── Services ─────────────────────────────────────────────────────────────────
export function ServicesSection() {
  const ref = useReveal()
  return (
    <section id="services" className="sec" aria-labelledby="services-heading" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ marginBottom:36 }} ref={ref} className="reveal">
          {/* The one-line treatment is a wide-viewport flourish only. Left as an
              unconditional inline `nowrap` it made this heading 404px wide inside a
              390px viewport — the single cause of horizontal overflow on the home
              page. .services-h2 releases it below 1100px. */}
          <h2 id="services-heading" className="services-h2" style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(26px,3.2vw,44px)', color:'var(--white)', lineHeight:1.1 }}>
            End-to-End Branded Water Solutions
          </h2>
        </div>
        <div className="services-numbered" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 80px' }}>
          {SERVICES.map((s, i) => (
            <ServiceItem key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceItem({ service, index }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="reveal service-item" style={{
      display:'grid', gridTemplateColumns:'56px 1fr', gap:24,
      padding:'20px 0', borderTop:'1px solid var(--glass-border)',
      transitionDelay:`${index * 0.08}s`
    }}>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:38, fontWeight:700, color:'var(--aqua)', opacity:0.35, lineHeight:1, paddingTop:4 }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div>
        <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:600, color:'var(--white)', marginBottom:10 }}>{service.title}</h3>
        <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:15 }}>{service.desc}</p>
      </div>
    </div>
  )
}
