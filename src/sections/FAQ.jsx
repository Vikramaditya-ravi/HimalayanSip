import { useState } from 'react'

import { track } from '../analytics/tracker'
import { FAQS } from '../site/data'
import { useReveal } from '../site/hooks'

// ─── FAQSection ───────────────────────────────────────────────────────────────
export function FAQSection() {
  const [open, setOpen] = useState(null)
  const ref = useReveal()
  return (
    <section id="faq" className="sec" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div ref={ref} className="reveal sec-head">
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {FAQS.map((item, i) => (
            <div key={i} className="glass-card" style={{ overflow:'hidden' }}>
              <button
                onClick={() => {
                  const opening = open !== i
                  setOpen(opening ? i : null)
                  // Only on open. A collapse is not a question being asked.
                  if (opening) track('faq_opened', { sectionId: 'faq', props: { question: item.q } })
                }}
                aria-expanded={open === i}
                style={{
                  width:'100%', background:'none', border:'none', cursor:'pointer',
                  display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px',
                  textAlign:'left'
                }}
              >
                <span style={{ fontWeight:600, fontSize:16, color:'var(--white)', paddingRight:16 }}>{item.q}</span>
                <span style={{ fontSize:22, color:'var(--aqua)', flexShrink:0, transition:'transform 0.3s', transform: open===i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              <div style={{ display:'grid', gridTemplateRows: open===i ? '1fr' : '0fr', transition:'grid-template-rows 0.4s ease', overflow:'hidden' }}>
                <div style={{ overflow:'hidden' }}>
                  <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:15, padding:'0 24px 20px', maxWidth:'68ch' }}>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:40 }}>
          <a href="/contact" style={{
            display:'inline-block', textDecoration:'none',
            background:'transparent', border:'1px solid rgba(62,207,191,0.4)', borderRadius:50,
            padding:'12px 28px', color:'var(--aqua)', fontFamily:'DM Sans, sans-serif',
            fontSize:15, fontWeight:500, cursor:'pointer',
          }}>Have more questions? Contact us →</a>
        </div>
      </div>
    </section>
  )
}
