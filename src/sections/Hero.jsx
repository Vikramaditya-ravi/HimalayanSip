import { useGeo } from '../site/hooks'
import { BottleSVG, MountainBg } from '../site/ui.jsx'

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function HeroSection() {
  const { geo, content } = useGeo()
  return (
    <section id="hero" style={{
      minHeight: '100vh', paddingTop: 72, paddingBottom: 80, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, #04101f 0%, #071428 40%, #061020 100%)',
      display: 'flex', alignItems: 'center'
    }}>
      {/* Ambient orbs */}
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(62,207,191,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'-5%', width:400, height:400, borderRadius:'50%',
        background:'radial-gradient(circle, rgba(91,143,249,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
      <MountainBg />

      <div className="hero-grid" style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, padding:'0 5%',
        width:'100%', alignItems:'center', position:'relative', zIndex:1
      }}>
        {/* Left */}
        <div style={{ animation:'fadeUp 0.9s ease forwards' }}>
          {content?.badge && !geo?.loading && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(62,207,191,0.1)', border:'1px solid rgba(62,207,191,0.3)', borderRadius:50, padding:'6px 16px', marginBottom:12, animation:'fadeUp 0.6s ease both' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#3ecfbf', display:'inline-block', boxShadow:'0 0 6px rgba(62,207,191,0.45)' }} />
              <span style={{ fontSize:13, color:'var(--aqua)', fontWeight:500 }}>{content.badge}</span>
            </div>
          )}
          <h1 className="hero-h1" id="main-heading" style={{
            fontFamily:'Cormorant Garamond, serif', fontWeight:700,
            fontSize:'clamp(44px, 5.5vw, 76px)', lineHeight:1.1, color:'var(--white)',
            marginBottom:24
          }}>
            Pure Water.<br />
            <span style={{ color:'var(--aqua)' }}>Your Brand.</span>
          </h1>
          {/* minHeight reserves two lines at this measure. The ipapi.co lookup
              lands ~1.7s after first paint and swaps this copy for the regional
              variant, which is a different length — without the reservation the
              whole hero below it jumps, and this sits directly under the LCP
              element. Three lines' worth (~95px) covers both variants at the
              narrowest desktop width. */}
          <p style={{ color:'var(--muted)', fontSize:18, lineHeight:1.75, maxWidth:480, marginBottom:36, minHeight:95 }}>
            {content?.heroSubheading || 'Premium Himalayan water, bottled with your logo. Trusted by 500+ brands for corporate events, hotels, offices, and more.'}
          </p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:48 }}>
            <a href="/products#customizer" style={{
              display:'inline-block', textDecoration:'none',
              background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))', border:'none',
              borderRadius:50, padding:'14px 32px', color:'var(--navy)', fontFamily:'DM Sans, sans-serif',
              fontWeight:600, fontSize:15, cursor:'pointer', transition:'all 0.3s',
              boxShadow:'0 8px 30px rgba(62,207,191,0.3)'
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >Design Your Bottle →</a>
            <a href="/products" style={{
              display:'inline-block', textDecoration:'none',
              background:'transparent', border:'1px solid rgba(62,207,191,0.4)',
              borderRadius:50, padding:'14px 32px', color:'var(--aqua)', fontFamily:'DM Sans, sans-serif',
              fontWeight:500, fontSize:15, cursor:'pointer', transition:'all 0.3s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(62,207,191,0.08)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateY(0)' }}
            >View Products</a>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:36, flexWrap:'wrap' }}>
            {[['500+','Brands Served'],['2Cr+','Bottles Delivered'],['48hr','Design Turnaround']].map(([num,label]) => (
              <div key={label}>
                <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:32, fontWeight:700, color:'var(--aqua)' }}>{num}</div>
                <div style={{ fontSize:13, color:'var(--muted)', fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — bottle trio */}
        <div className="hero-bottles" style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:16, paddingBottom:40 }}>
          <div style={{ marginBottom: 40 }}>
            <BottleSVG color="#3ecfbf" label="500ml" size={240} animationClass="floatA 3.5s ease-in-out infinite" />
          </div>
          <div style={{ marginBottom: 0 }}>
            <BottleSVG color="#c8a44a" label="250ml" size={280} animationClass="floatB 4s ease-in-out infinite" />
          </div>
          <div style={{ marginBottom: 60 }}>
            <BottleSVG color="#5b8ff9" label="1L" size={220} animationClass="floatC 3.8s ease-in-out infinite" />
          </div>
        </div>

        {/* Mobile single bottle */}
        <div className="hero-bottle-single" style={{ display:'none', justifyContent:'center' }}>
          <BottleSVG color="#3ecfbf" label="500ml" size={260} animationClass="floatB 4s ease-in-out infinite" />
        </div>
      </div>

      {/* Sample request bar */}
      <SampleRequestBar />
    </section>
  )
}

function SampleRequestBar() {
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      background:'linear-gradient(90deg, rgba(200,164,74,0.12), rgba(200,164,74,0.05))',
      borderTop:'1px solid rgba(200,164,74,0.25)', borderBottom:'1px solid rgba(200,164,74,0.25)',
      padding:'14px 5%', display:'flex', alignItems:'center', gap:16, zIndex:2, flexWrap:'wrap'
    }}>
      <span style={{ color:'var(--gold)', fontSize:14 }}>✦ Try before you commit —</span>
      <a href="/contact" style={{
        display:'inline-block', textDecoration:'none',
        background:'transparent', border:'1px solid rgba(200,164,74,0.5)', borderRadius:50,
        padding:'7px 20px', color:'var(--gold)', fontFamily:'DM Sans, sans-serif',
        fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.3s'
      }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(200,164,74,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >Request a Sample Bottle →</a>
    </div>
  )
}
