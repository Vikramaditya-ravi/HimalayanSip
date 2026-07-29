import { CONTENT_GROUPS, RESOURCES_PATH } from '../content/index.js'
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
const group = (name) => CONTENT_GROUPS.find((g) => g.name === name) ?? { pages: [], id: '' }
const USE_CASES = group('Who we supply')
const GUIDES = group('Guides')
const REFERENCE = group('Reference')
const LOCATIONS = group('Where we deliver')
const GUIDE_PAGES = [...REFERENCE.pages, ...GUIDES.pages.slice(0, 4)]

// How many pages the footer is NOT showing. The columns were silently truncated
// — six of the ten guides simply were not there — with nothing to say so and
// nowhere to go for the rest. Now the count is stated and links to the hub.
const TOTAL_PAGES = CONTENT_GROUPS.reduce((n, g) => n + g.pages.length, 0)

/**
 * A footer column heading that is also a link into the hub.
 *
 * These were plain <div>s, which meant the categories the footer organises the
 * library by existed only as styling — a reader who wanted "all the guides"
 * could see the word Guides and could not click it.
 */
function ColumnHead({ children, href }) {
  const style = { fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }
  if (!href) return <div style={style}>{children}</div>
  return (
    <a href={href} className="footer-col-head" style={{ ...style, display:'block', textDecoration:'none' }}>
      {children}
    </a>
  )
}

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
          <ColumnHead>Quick Links</ColumnHead>
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
          <ColumnHead href={`${RESOURCES_PATH}#${USE_CASES.id}`}>Who we supply</ColumnHead>
          {USE_CASES.pages.map(p => (
            <a key={p.slug} href={`/${p.slug}`} className="footer-link"
              style={{ display:'block', color:'var(--muted)', fontSize:14, marginBottom:10, textDecoration:'none' }}
            >{p.breadcrumb}</a>
          ))}
        </div>

        {/* Guides */}
        <div>
          <ColumnHead href={`${RESOURCES_PATH}#${GUIDES.id}`}>Guides</ColumnHead>
          {GUIDE_PAGES.map(p => (
            <a key={p.slug} href={`/${p.slug}`} className="footer-link"
              style={{ display:'block', color:'var(--muted)', fontSize:14, marginBottom:10, textDecoration:'none' }}
            >{p.breadcrumb}</a>
          ))}
          {/* The way out of a truncated column. Without it the footer shows
              four of ten guides and implies that is all of them. */}
          <a href={RESOURCES_PATH} className="footer-link footer-all"
            style={{ display:'block', color:'var(--aqua)', fontSize:14, marginTop:4, textDecoration:'none' }}
          >All {TOTAL_PAGES} resources →</a>
        </div>

        {/* Contact */}
        <div>
          <ColumnHead>Contact</ColumnHead>
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
            {LOCATIONS.pages.map(p => (
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
