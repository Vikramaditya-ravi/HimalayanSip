import { CopyButton } from './CopyButton.jsx'
import { NAV_LINKS, SERVICES, currentPath } from './data'
import { useGeo } from './hooks'

const EMAIL = 'info@aquaviaworld.com'

// The footer's quick links are the site's routes. NAV_LINKS now leads with Home
// itself, so this is a straight alias — prepending Home here as well would list
// it twice.
const FOOTER_LINKS = NAV_LINKS

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  const { content } = useGeo()
  const here = currentPath()
  const phone = content?.phone || '+91 76248 03460'
  return (
    <footer style={{ background:'#03090f', padding:'60px 5% 30px' }}>
      <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40, maxWidth:1200, margin:'0 auto', marginBottom:40 }}>
        {/* Brand */}
        <div>
          <div style={{ marginBottom:14 }}>
            <img src="/aquavia-logo.svg" alt="AquaVia" style={{ height: 64, borderRadius: 8, display: 'block' }} />
          </div>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>Pure Himalayan hydration for brands that care.</p>
        </div>

        {/* Quick Links
            Real anchors, not buttons. Same reasoning as the navbar: a <button>
            that scrolls is invisible to a crawler, and these are now the site's
            actual routes. */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Quick Links</div>
          {FOOTER_LINKS.map(({ href, label }) => {
            const active = href === here
            const restColor = active ? 'var(--white)' : 'var(--muted)'
            return (
              <a key={href} href={href}
                aria-current={active ? 'page' : undefined}
                style={{ display:'block', background:'none', border:'none', color:restColor, fontSize:14, marginBottom:10, cursor:'pointer', transition:'color 0.2s', padding:0, fontFamily:'DM Sans, sans-serif', textDecoration:'none' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--aqua)'}
                onMouseLeave={e => e.currentTarget.style.color=restColor}
              >{label}</a>
            )
          })}
        </div>

        {/* Services */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Services</div>
          {SERVICES.slice(0,5).map(s => (
            <div key={s.title} style={{ color:'var(--muted)', fontSize:14, marginBottom:10 }}>{s.title}</div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Contact</div>
          <div className="footer-row">📍 Delhi, India</div>
          <div className="footer-row">
            📞 <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a>
            <CopyButton value={phone} label="phone number" placement="footer" className="footer-copy" />
          </div>
          <div className="footer-row">
            📧 <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <CopyButton value={EMAIL} label="email address" placement="footer" className="footer-copy" />
          </div>
          <div className="footer-row">🚚 {content?.deliveryNote || 'Serving Delhi NCR'}</div>
        </div>
      </div>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:24, maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <span style={{ color:'var(--muted)', fontSize:13 }}>© 2026 AquaVia. All rights reserved.</span>
        <span style={{ color:'var(--muted)', fontSize:13 }}>Made with 💧 in India</span>
      </div>
    </footer>
  )
}
