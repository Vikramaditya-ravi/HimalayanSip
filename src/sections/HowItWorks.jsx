import { STEPS } from '../site/data'
import { useReveal } from '../site/hooks'

// ─── How It Works ─────────────────────────────────────────────────────────────
export function HowItWorksSection() {
  const titleRef = useReveal()
  return (
    <section id="how" className="sec" style={{ background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            From Logo to Doorstep in 4 Steps
          </h2>
        </div>
        <div className="how-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, position:'relative' }}>
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} delay={i * 0.12} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, delay, isLast }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="glass-card step-card reveal" style={{
      padding:'32px 24px', textAlign:'center', position:'relative', transitionDelay:`${delay}s`
    }}>
      {!isLast && (
        <div style={{
          position:'absolute', top:44, right:'-12%', width:'24%', height:2,
          background:'linear-gradient(90deg, var(--aqua), transparent)',
          zIndex:10, pointerEvents:'none'
        }} />
      )}
      <div className="step-num" style={{
        width:52, height:52, borderRadius:'50%', border:'2px solid var(--aqua)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:700,
        color:'var(--aqua)', margin:'0 auto 20px', transition:'all 0.3s'
      }}>{step.num}</div>
      <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, fontWeight:600, color:'var(--white)', marginBottom:10 }}>{step.title}</h3>
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:14 }}>{step.desc}</p>
    </div>
  )
}
