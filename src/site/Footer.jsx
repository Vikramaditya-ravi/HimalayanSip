import { CONTENT_GROUPS } from '../content/index.js'
import { CopyButton } from './CopyButton.jsx'
import { NAV_LINKS } from './data'
import { useCurrentPath, useGeo } from './hooks'

const EMAIL = 'info@aquaviaworld.com'

/**
 * The footer link columns, derived from the content index.
 *
 * Read from CONTENT_GROUPS rather than listed here, so a new guide appears in
 * the footer of every page on the site the moment it is added to the index —
 * which is the difference between publishing a page and publishing a page that
 * anything can reach.
 *
 * Sliced, because there are ten guides and a footer column is not a sitemap.
 * The reference pages carry the full lists.
 */
const group = (name) => CONTENT_GROUPS.find((g) => g.name === name)?.pages ?? []
const USE_CASE_PAGES = group('Who we supply')
const GUIDE_PAGES = [...group('Reference'), ...group('Guides').slice(0, 4)]
const LOCATION_PAGES = group('Where we deliver')

// The footer's quick links are the site's routes. NAV_LINKS now leads with Home
// itself, so this is a straight alias — prepending Home here as well would list
// it twice.
const FOOTER_LINKS = NAV_LINKS

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  const { content } = useGeo()
  const here = useCurrentPath()
  const phone = content?.phone || '+91 76248 03460'
  return (
    <footer style={{ background:'#03090f', padding:'60px var(--gutter) 30px' }}>
      <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:32, maxWidth:1200, margin:'0 auto', marginBottom:40 }}>
        {/* Brand */}
        <div>
          <div style={{ marginBottom:14 }}>
            <img src="/aquavia-logo.svg" alt="AquaVia" style={{ height: 64, borderRadius: 8, display: 'block' }} />
          </div>
          {/* Was "Pure Himalayan hydration". The water is bottled in Delhi NCR
              by a partner plant and CLAIMS.waterSource is still unverified, so
              the tagline now says what the business demonstrably does. */}
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>Custom branded bottled water for businesses across Delhi NCR.</p>
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
              <a key={href} href={href} className="footer-link"
                aria-current={active ? 'page' : undefined}
                style={{ display:'block', background:'none', border:'none', color:restColor, fontSize:14, marginBottom:10, cursor:'pointer', transition:'color 0.2s', padding:0, fontFamily:'DM Sans, sans-serif', textDecoration:'none' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--aqua)'}
                onMouseLeave={e => e.currentTarget.style.color=restColor}
              >{label}</a>
            )
          })}
        </div>

        {/* Who we supply
            This column used to be five <div>s of SERVICES titles — visible to a
            reader, invisible to a crawler, and leading nowhere. Every entry is
            now a real link to the page that covers it, which is what turns the
            twenty-three content pages into a site rather than a pile of
            orphans: the footer is the only element on every page, so it is the
            only place that can reach all of them. */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Who we supply</div>
          {USE_CASE_PAGES.map(p => (
            <a key={p.slug} href={`/${p.slug}`} className="footer-link"
              style={{ display:'block', color:'var(--muted)', fontSize:14, marginBottom:10, textDecoration:'none' }}
            >{p.breadcrumb}</a>
          ))}
        </div>

        {/* Guides */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Guides</div>
          {GUIDE_PAGES.map(p => (
            <a key={p.slug} href={`/${p.slug}`} className="footer-link"
              style={{ display:'block', color:'var(--muted)', fontSize:14, marginBottom:10, textDecoration:'none' }}
            >{p.breadcrumb}</a>
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
          {/* One link per city we deliver to. These are the pages a local
              search — or an assistant asked "who supplies branded water in
              Noida" — is most likely to land on. */}
          <div style={{ marginTop:14, display:'flex', flexWrap:'wrap', gap:'8px 14px' }}>
            {LOCATION_PAGES.map(p => (
              <a key={p.slug} href={`/${p.slug}`} className="footer-link"
                style={{ color:'var(--muted)', fontSize:13, textDecoration:'none' }}
              >{p.breadcrumb}</a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:24, maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <span style={{ color:'var(--muted)', fontSize:13 }}>© 2026 AquaVia. All rights reserved.</span>
        <span style={{ color:'var(--muted)', fontSize:13 }}>Made with 💧 in India</span>
      </div>
    </footer>
  )
}
