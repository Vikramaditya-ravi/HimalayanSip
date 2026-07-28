import { PACK_SIZES, PRICING_FOOTNOTE, PRICING_INCLUDES, PRICING_TIERS, perBottle } from '../site/data'
import { useReveal } from '../site/hooks'
import { BrochureLink, SectionTag } from '../site/ui.jsx'

// ─── Pricing ──────────────────────────────────────────────────────────────────
export function PricingSection() {
  const titleRef = useReveal()
  const footRef = useReveal()
  return (
    <section id="pricing" className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <SectionTag>Corporate Programme</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Pricing, <span style={{ color:'var(--aqua)' }}>refined.</span>
          </h2>
          <p style={{ color:'var(--muted)', maxWidth:560, margin:'10px auto 0', lineHeight:1.6 }}>
            Three tiers of partnership, each engineered around volume, presentation, and the standard your guests expect.
          </p>
        </div>

        {/* auto-fit rather than a fixed 3 columns: each card carries its own
            three-column price table, which turns unreadable if the cards are
            squeezed at tablet widths. They drop to two, then one, on their own. */}
        <div className="pricing-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:28, alignItems:'stretch' }}>
          {PRICING_TIERS.map((tier, i) => (
            <TierCard key={tier.name} tier={tier} delay={i * 0.12} />
          ))}
        </div>

        <div ref={footRef} className="reveal" style={{ marginTop:28 }}>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'12px 28px', paddingTop:22, borderTop:'1px solid var(--glass-border)' }}>
            {PRICING_INCLUDES.map(item => (
              <span key={item} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--white)', fontSize:14 }}>
                <span style={{ color:'var(--aqua)' }} aria-hidden="true">✓</span>{item}
              </span>
            ))}
          </div>
          <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13, marginTop:14 }}>{PRICING_FOOTNOTE}</p>

          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:16, marginTop:22 }}>
            <BrochureLink variant="solid" />
          </div>
        </div>
      </div>
    </section>
  )
}

function TierCard({ tier, delay }) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`bottle-card reveal${tier.featured ? ' featured-card' : ''}`}
      style={{
        background:'var(--navy-card)',
        border:`1px solid ${tier.featured ? 'rgba(62,207,191,0.4)' : 'var(--glass-border)'}`,
        borderRadius:24, padding:'26px 24px', position:'relative', transitionDelay:`${delay}s`,
        display:'flex', flexDirection:'column'
      }}
    >
      {tier.featured && (
        <div className="featured-badge" style={{
          position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))', borderRadius:50,
          padding:'4px 18px', fontSize:11, fontWeight:700, letterSpacing:'0.1em',
          color:'var(--navy)', textTransform:'uppercase', zIndex:10, whiteSpace:'nowrap'
        }}>Most Chosen</div>
      )}

      <div style={{
        width:34, height:34, borderRadius:'50%', border:'1px solid rgba(62,207,191,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'var(--aqua)', fontSize:11, letterSpacing:'0.06em', marginBottom:10
      }}>{tier.num}</div>

      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:28, fontWeight:700, color:'var(--white)', lineHeight:1.1 }}>{tier.name}</div>
      <div style={{ color:'var(--gold)', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:6 }}>{tier.segment}</div>
      <div style={{ color:'var(--muted)', fontSize:13, marginTop:8, marginBottom:18 }}>{tier.dispatches}</div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginTop:'auto' }}>
        {PACK_SIZES.map(size => (
          <div key={size}>
            <div style={{ color:'var(--muted)', fontSize:11, letterSpacing:'0.1em', marginBottom:4 }}>{size}</div>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:26, fontWeight:700, color:'var(--white)', lineHeight:1 }}>
              <span style={{ fontSize:14, color:'var(--aqua)', verticalAlign:'super' }}>₹</span>{tier.prices[size]}
            </div>
            <div style={{ color:'var(--muted)', fontSize:12, marginTop:4 }}>per case</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>
              {`₹${perBottle(tier.prices[size], size)} / bottle`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
