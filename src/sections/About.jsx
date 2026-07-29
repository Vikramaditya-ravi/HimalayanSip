import { useReveal } from '../site/hooks'
import { MoonMountainIllustration } from '../site/ui.jsx'

// ─── About ────────────────────────────────────────────────────────────────────
export function AboutSection() {
  const leftRef = useReveal()
  const rightRef = useReveal()
  /**
   * "Himalayan-sourced purity" used to lead this list. It was removed rather
   * than reworded: the water is bottled in Delhi NCR by a partner plant, and
   * until someone confirms the actual source (CLAIMS.waterSource, still TODO)
   * a Himalayan origin is not something we can stand behind. The replacement
   * describes the process we CAN describe — see FILTRATION_STAGES, which is
   * published stage by stage on /process.
   */
  const FEATURES = [
    { icon:'🌊', label:'7-stage RO + ozonation' },
    { icon:'🎨', label:'250+ label designs' },
    { icon:'♻️', label:'Eco-friendly materials' },
    { icon:'⚡', label:'48-hour proofing' },
  ]
  return (
    <section id="about" className="sec" aria-labelledby="about-heading" style={{ background:'var(--navy-mid)', position:'relative' }}>
      <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', maxWidth:1200, margin:'0 auto' }}>
        <div ref={leftRef} className="reveal-left" style={{ minWidth:0 }}>
          <h2 id="about-heading" style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', lineHeight:1.1, color:'var(--white)', marginBottom:24 }}>
            Bottled for Purity,<br />Built for Your Brand
          </h2>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:20 }}>
            AquaVia was founded on one belief: that hydration is the most powerful touchpoint a brand can own. We work with a licensed bottling partner whose plant puts every litre through seven stages of filtration, then package it with your story — turning every sip into a brand impression.
          </p>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:36 }}>
            From intimate boardrooms to large-scale conferences, our bottles carry your logo, your colours and your message — delivered on time, every time, across Delhi NCR.
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

      {/* How the business actually works, said plainly.
          This block exists because the page above it was two paragraphs of
          positioning and nothing a buyer could check. Procurement teams and
          answer engines both reward a supplier that states its own structure —
          including the parts that are not flattering — over one that implies
          capabilities it does not own. Every sentence here is verifiable or is
          an admission that something is not yet verified. */}
      <div className="about-model" style={{ maxWidth:1200, margin:'56px auto 0' }}>
        <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(24px,2.6vw,34px)', color:'var(--white)', marginBottom:18 }}>
          How we work, plainly
        </h3>
        <div className="about-model-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:18 }}>
          {[
            { t:'We are the brand owner, not the bottler',
              d:'AquaVia designs and prints the label, manages the order and delivers it. The water is filled at a licensed partner plant. We say so on every page rather than implying we own a factory.' },
            { t:'The licences sit with the plant',
              d:'BIS certification under IS 14543 and the FSSAI licence belong to our bottling partner, not to AquaVia. We do not claim an ISI mark in our own name, and we will obtain the plant’s licence details for your procurement file on request.' },
            { t:'We publish numbers we can evidence',
              d:'Prices, minimum orders, case counts and lead times come from the rate card and appear on /specifications. Figures we have not been given — TDS, mineral analysis — are absent rather than estimated.' },
            { t:'Delhi NCR, and only Delhi NCR',
              d:'Delhi, Gurugram, Noida, Greater Noida, Faridabad and Ghaziabad. Anything further is quoted case by case rather than promised as pan-India coverage we do not currently have.' },
            { t:'No forms between you and a person',
              d:'WhatsApp, phone and email reach the people who price the order. There is no ticket queue and no enquiry form on the contact page — that was removed deliberately.' },
            { t:'Client quotes are labelled illustrative',
              d:'The testimonials on this site are representative, not attributed to named consenting clients, and are marked as such. No review or rating markup is published anywhere until that changes.' },
          ].map(item => (
            <div key={item.t} className="glass-card" style={{ padding:'20px 22px' }}>
              <div style={{ fontWeight:600, fontSize:15, color:'var(--white)', marginBottom:8 }}>{item.t}</div>
              <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
