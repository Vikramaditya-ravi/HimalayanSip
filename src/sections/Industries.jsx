import { INDUSTRIES } from '../site/data'
import { useReveal } from '../site/hooks'

// ─── Industries ───────────────────────────────────────────────────────────────
export function IndustriesSection() {
  const titleRef = useReveal()
  return (
    <section id="industries" className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Trusted Across Every Sector
          </h2>
        </div>
        <div className="industries-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:16 }}>
          {INDUSTRIES.map((ind, i) => (
            <IndustryChip key={ind.name} ind={ind} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  )
}

function IndustryChip({ ind, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className="industry-chip reveal"
      data-evt="industry_clicked"
      data-industry={ind.name.toLowerCase().replace(/[^a-z]+/g, '-')}
      style={{
      background:'rgba(11,34,68,0.7)', border:'1px solid var(--glass-border)', borderRadius:14,
      padding:'18px 20px', display:'flex', alignItems:'center', gap:14,
      transition:'all 0.3s', cursor:'default', transitionDelay:`${delay}s`
    }}>
      <span style={{ fontSize:28, flexShrink:0 }} aria-hidden="true">{ind.icon}</span>
      <span style={{ fontWeight:500, fontSize:15, color:'var(--white)' }}>{ind.name}</span>
    </div>
  )
}
