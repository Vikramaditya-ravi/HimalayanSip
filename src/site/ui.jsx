import { BROCHURE_URL } from './data'

// ─── SVG Components ───────────────────────────────────────────────────────────
/**
 * The product bottle.
 *
 * SVG rather than a photographic render, because this same component draws the
 * live preview in the Customizer, where `logo` is the visitor's own uploaded
 * artwork composited onto the label. A raster mockup cannot do that.
 *
 * The hero does use a photographic render — it shows a fixed arrangement with
 * nothing to customise, so it has no such constraint. The two never appear on
 * the same screen. Callers here are Products and the Customizer only.
 *
 * The upgrade over the original flat drawing is all in how glass behaves: a
 * bright rim where the cylinder turns away from the viewer, a vertical
 * refraction band, a specular streak on the cap, and near-neutral water instead
 * of a wash of the label colour.
 */
export function BottleSVG({ logo, color = '#3ecfbf', label = '500ml', size = 200, animationClass = '' }) {
  const id = `grad-${color.replace('#', '')}-${size}`
  return (
    <svg
      viewBox="0 0 110 260"
      width={size * 0.42}
      height={size}
      style={{ filter: 'drop-shadow(0 20px 40px rgba(62,207,191,0.3))', animation: animationClass, overflow: 'visible' }}
    >
      <defs>
        {/* Translucent, not opaque. The original solid fill made the bottle read
            as moulded plastic — clear PET over a dark page has to let the page
            through, and the rim highlights below are what give it its shape.
            Every surface this renders on (hero, product cards, customizer) is
            dark, so there is no background this fails against. */}
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0f0f8" stopOpacity="0.15" />
          <stop offset="55%" stopColor="#bfe8f2" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#a8dce8" stopOpacity="0.17" />
        </linearGradient>
        {/* Water, not dye. This used to be a flat wash of the label colour at
            0.6–0.85, which on the gold bottle produced an olive drink and on
            the blue one an ink. The product is drinking water and has to look
            like it, so the fill is a near-neutral cyan with only a hint of the
            label colour pooling at the base. */}
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dff6fb" stopOpacity="0.46" />
          <stop offset="55%" stopColor="#cdeef7" stopOpacity="0.40" />
          <stop offset="100%" stopColor={color} stopOpacity="0.42" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        {/* Cross-section falloff. A cylinder reads as round only if its edges
            are brighter than its middle — this is that, applied as an overlay
            across the full width of the body. */}
        <linearGradient id={`rim-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.34" />
          <stop offset="11%" stopColor="white" stopOpacity="0.03" />
          <stop offset="52%" stopColor="white" stopOpacity="0" />
          <stop offset="88%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0.30" />
        </linearGradient>
        {/* The narrow bright streak where the light source is folded back
            through the front wall of the bottle. */}
        <linearGradient id={`refract-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`body-clip-${id}`}>
          <rect x="18" y="50" width="74" height="194" rx="10" />
        </clipPath>
      </defs>

      {/* Cap */}
      <rect x="36" y="6" width="38" height="22" rx="6" fill={`url(#cap-${id})`} />
      <rect x="38" y="8" width="20" height="6" rx="3" fill="white" fillOpacity="0.3" />
      {/* Specular streak — the cap is the glossiest thing on the bottle and was
          the flattest. */}
      <rect x="41" y="9" width="4" height="17" rx="2" fill="white" fillOpacity="0.5" />
      <rect x="66" y="10" width="2.5" height="15" rx="1.25" fill="white" fillOpacity="0.22" />

      {/* Neck */}
      <path d="M36 26 L28 50 L82 50 L74 26 Z" fill={color} fillOpacity="0.5" />
      <path d="M38 27 L32 49" stroke="white" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />

      {/* Body */}
      <rect x="18" y="50" width="74" height="194" rx="10" fill={`url(#body-${id})`} />

      {/* Water fill */}
      <g clipPath={`url(#body-clip-${id})`}>
        <rect x="18" y="145" width="74" height="99" fill={`url(#water-${id})`} />
        {/* Wave */}
        <path d="M18 148 Q37 138 55 148 Q73 158 92 148 L92 160 Q73 170 55 160 Q37 150 18 160 Z" fill={color} fillOpacity="0.4" />
        {/* Meniscus: the waterline catches the light along its whole length. */}
        <path d="M18 148 Q37 138 55 148 Q73 158 92 148" fill="none" stroke="white" strokeOpacity="0.45" strokeWidth="1.4" />
      </g>

      {/* Label area background */}
      <rect x="24" y="74" width="62" height="100" rx="6" fill="white" />

      {/* Label top strip */}
      <rect x="24" y="74" width="62" height="22" rx="6" fill={color} />
      <rect x="24" y="84" width="62" height="12" fill={color} />
      <text x="55" y="89" textAnchor="middle" fill="white" fontSize="8" fontFamily="serif" fontWeight="bold" letterSpacing="1">AQUAVIA</text>

      {/* Label center — logo or placeholder */}
      {logo ? (
        <image href={logo} x="30" y="98" width="50" height="50" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          <circle cx="55" cy="122" r="18" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="55" y="118" textAnchor="middle" fill={color} fontSize="7" fontFamily="DM Sans, sans-serif">YOUR</text>
          <text x="55" y="128" textAnchor="middle" fill={color} fontSize="7" fontFamily="DM Sans, sans-serif">LOGO</text>
        </>
      )}

      {/* Label bottom strip */}
      <rect x="24" y="162" width="62" height="12" rx="0" fill={color} />
      <rect x="24" y="168" width="62" height="6" rx="6" fill={color} />

      {/* ── Glass, drawn last so it sits over the label too ──────────────────
          Everything below is non-interactive overlay: it must not intercept
          pointer events aimed at the card underneath. */}
      <g clipPath={`url(#body-clip-${id})`} style={{ pointerEvents: 'none' }}>
        <rect x="18" y="50" width="74" height="194" fill={`url(#rim-${id})`} />
        <rect x="33" y="50" width="9" height="194" fill={`url(#refract-${id})`} />
      </g>
      {/* Original left-edge shine, kept — it is what gives the top corner its
          roundness where the rim gradient is still ramping up. */}
      <rect x="18" y="50" width="20" height="194" rx="10" fill={`url(#shine-${id})`} style={{ pointerEvents: 'none' }} />

    </svg>
  )
}

export function MoonMountainIllustration() {
  return (
    <svg viewBox="0 0 320 260" width="320" height="260">
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04101f" />
          <stop offset="100%" stopColor="#081b35" />
        </linearGradient>
        <linearGradient id="mtn-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a8a80" />
          <stop offset="100%" stopColor="#0b2244" />
        </linearGradient>
        <linearGradient id="mtn-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0b2244" />
        </linearGradient>
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="320" height="260" fill="url(#sky-grad)" rx="16" />
      {/* Stars */}
      {[[40,30],[80,20],[130,40],[170,15],[220,35],[270,25],[300,45],[60,55],[250,50],[160,60]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%3===0?1.5:1} fill="white" fillOpacity={0.6+i*0.04} />
      ))}
      {/* Moon */}
      <circle cx="260" cy="55" r="26" fill="#c8a44a" fillOpacity="0.9" />
      <circle cx="272" cy="48" r="22" fill="#081b35" />
      {/* Back mountain */}
      <path d="M60 200 L160 60 L260 200 Z" fill="url(#mtn-a)" />
      <path d="M140 95 L160 60 L180 95 Z" fill="white" fillOpacity="0.8" />
      {/* Front mountain */}
      <path d="M0 220 L120 80 L240 220 Z" fill="url(#mtn-b)" />
      <path d="M100 112 L120 80 L140 112 Z" fill="white" fillOpacity="0.9" />
      {/* River */}
      <path d="M0 240 Q80 220 160 235 Q240 250 320 230 L320 260 L0 260 Z" fill="url(#river)" />
      <path d="M20 242 Q80 228 140 238" stroke="#3ecfbf" strokeWidth="1.5" fill="none" strokeOpacity="0.5" />
    </svg>
  )
}

/* ── Line icons ───────────────────────────────────────────────────────────────
   One stroke weight (1.5) and one size default across the set, drawn on a 24
   grid, inheriting `currentColor` so the caller decides the colour. Kept as
   outlines rather than filled glyphs to sit alongside the teal-outline language
   the rest of the page already uses. */
const ICON = {
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': true, focusable: 'false',
}

export function BottleIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON}>
      <path d="M10 2h4v3l1.6 2.4A5 5 0 0 1 16.5 10v9a3 3 0 0 1-3 3h-3a3 3 0 0 1-3-3v-9a5 5 0 0 1 .9-2.6L10 5V2Z" />
      <path d="M7.5 13.5h9" />
      <path d="M7.5 17h9" />
    </svg>
  )
}

export function SparkleIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...ICON}>
      <path d="M12 3.2 13.7 9 19.5 10.7 13.7 12.4 12 18.2 10.3 12.4 4.5 10.7 10.3 9 12 3.2Z" />
      <path d="M18.6 16.2 19.4 18.6 21.8 19.4 19.4 20.2 18.6 22.6 17.8 20.2 15.4 19.4 17.8 18.6 18.6 16.2Z" />
    </svg>
  )
}

// ─── Reusable UI ─────────────────────────────────────────────────────────────
export function SectionTag({ children }) {
  return (
    <div style={{
      display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
      borderRadius: 50, padding: '5px 16px', marginBottom: 12
    }}>{children}</div>
  )
}

/**
 * Download glyph: an arrow falling into an open tray.
 *
 * Drawn as two groups (.dl-arrow / .dl-tray) so the hover animation defined in
 * useGlobalStyles can move them independently. `currentColor` keeps it in
 * step with whatever the surrounding pill sets as its text colour.
 */
export function DownloadIcon({ size = 16 }) {
  return (
    <svg className="dl-icon" width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      <g className="dl-arrow">
        <path d="M10 2.5v9" />
        <path d="M6 8.5l4 4 4-4" />
      </g>
      <path className="dl-tray" d="M3 14.5v1.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
    </svg>
  )
}

/**
 * The brochure link, defined once.
 *
 * Two variants because it appears in two competitive contexts: `solid` for the
 * pricing section, where it is the only call to action and should carry the
 * weight, and `ghost` for the contact block, where the enquiry form is the
 * primary and this must not out-shout it.
 *
 * `data-evt` is all the instrumentation this needs — the delegated listener in
 * analytics/delegate.ts resolves it on any click, and an explicit data-evt beats
 * its href sniffing, so this doesn't get miscounted as a generic outbound click.
 */
export function BrochureLink({ style, variant = 'ghost' }) {
  const solid = variant === 'solid'
  const rest = solid
    ? '0 8px 24px rgba(62,207,191,0.20)'
    : '0 4px 16px rgba(4,26,43,0.25)'
  const lift = solid
    ? '0 16px 38px rgba(62,207,191,0.34)'
    : '0 10px 26px rgba(62,207,191,0.16)'
  return (
    <a
      className={`dl-btn dl-btn-${variant}`}
      href={BROCHURE_URL}
      download
      target="_blank"
      rel="noopener"
      data-evt="pricing_brochure_downloaded"
      style={{
        display:'inline-flex', alignItems:'center', gap:14,
        padding: solid ? '12px 26px 12px 14px' : '11px 24px 11px 13px',
        borderRadius:50, textDecoration:'none', whiteSpace:'nowrap',
        fontFamily:'DM Sans, sans-serif',
        background: solid ? 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))' : 'transparent',
        border: solid ? '1px solid transparent' : '1px solid rgba(62,207,191,0.45)',
        color: solid ? 'var(--navy)' : 'var(--aqua)',
        boxShadow: rest,
        transition:'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
        ...style
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = lift
        if (!solid) e.currentTarget.style.borderColor = 'var(--aqua)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = rest
        if (!solid) e.currentTarget.style.borderColor = 'rgba(62,207,191,0.45)'
      }}
    >
      <span className="dl-chip"><DownloadIcon size={17} /></span>
      {/* Two lines: the action, then what actually lands in the downloads
          folder. The format and size are the questions a PDF link raises. */}
      <span style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:1, lineHeight:1.25 }}>
        <span style={{ fontWeight:700, fontSize:15, letterSpacing:'-0.01em' }}>
          Download pricing brochure
        </span>
        <span style={{
          fontSize:11.5, fontWeight:500, letterSpacing:'0.06em', textTransform:'uppercase',
          opacity: solid ? 0.62 : 0.7,
        }}>
          PDF · Corporate rate card
        </span>
      </span>
    </a>
  )
}
