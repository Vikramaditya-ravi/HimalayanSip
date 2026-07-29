import { useEffect } from 'react'

/**
 * Vertical space the floating navbar occupies: 14px inset + 64px pill, plus
 * 14px of breathing room.
 *
 * Exported because four separate places have to agree on it and they are not
 * all CSS — PageShell's top padding and its hash-scroll offset are computed in
 * JS, while `.sec { scroll-margin-top }` and the hero's own padding are style
 * rules. When these drifted apart under the old full-width bar the symptom was
 * a deep link landing with its heading tucked under the navbar, which is
 * invisible until someone actually follows one.
 */
export const NAV_CLEAR = 92

// ─── Global stylesheet ────────────────────────────────────────────────────────
/**
 * The whole stylesheet, as a string.
 *
 * Exported rather than kept inside the hook so scripts/prerender.mjs can write
 * it into every built page's <head> as a real <style> block. It used to exist
 * only inside a useEffect, which meant the served HTML carried no styles at all
 * until the JS bundle had parsed and mounted — the page was unstyled for the
 * whole of that window, and a crawler that never executes JS saw an unstyled
 * document forever.
 *
 * Inlining it also takes a render-blocking dependency off the critical path
 * entirely: there is no stylesheet request, and no reflow when one lands.
 */
export const GLOBAL_CSS = `
      /* The Google Fonts @import that used to head this block now lives as a
         static <link> in each route's HTML. Nested inside JS-injected CSS it was
         not discovered until the bundle mounted (~1.67s), which delayed the
         webfont swap on the H1 — the largest text on the page. */

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        /* Deepened from #04101f to the concept's near-black navy. Every other
           surface token is layered on top of this, so it sets how much contrast
           the glass has to work with — at #04101f a 5% white fill barely
           separated from the page. */
        --navy: #080D16;
        --navy-grad-end: #0B1A23;
        --navy-mid: #081b35;
        --navy-card: #0b2244;
        --aqua: #3ecfbf;
        --aqua-dim: #1a8a80;
        --aqua-glow: rgba(62,207,191,0.15);
        --gold: #c8a44a;
        --white: #f5faff;
        --muted: #7a9bb5;
        --glass: rgba(255,255,255,0.05);
        --glass-border: rgba(255,255,255,0.10);
        --blur: 12px;
        --radius-glass: 16px;
        --nav-clear: ${NAV_CLEAR}px;
      }

      html { scroll-behavior: smooth; }
      body { font-family: 'DM Sans', sans-serif; background: var(--navy); color: var(--white); overflow-x: hidden; }

      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: var(--navy); }
      ::-webkit-scrollbar-thumb { background: var(--aqua); border-radius: 3px; }

      /* Only floatB survives: the Customizer's preview bottle uses it. floatA,
         floatC and floatD went with the hero's vector bottle trio. */
      @keyframes floatB { 0%,100%{transform:translateY(-10px) rotate(4deg)} 50%{transform:translateY(12px) rotate(4deg)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
      @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }

      /* ── Floating WhatsApp button ──────────────────────────────────────────
         --wa-size and --wa-inset so the mobile rules below only have to restate
         two numbers. The ripple ring scales to 2.4×, which is why the button
         reads as much larger than its 58px and why it was landing on top of
         card text on a phone. */
      :root { --wa-size: 58px; --wa-inset: 26px; }
      .wa-fab {
        position: fixed; z-index: 9999;
        right: var(--wa-inset);
        bottom: calc(var(--wa-inset) + env(safe-area-inset-bottom, 0px));
      }
      .wa-fab-inner { position: relative; width: var(--wa-size); height: var(--wa-size); }
      .wa-fab-btn { width: var(--wa-size); height: var(--wa-size); }
      @keyframes waBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes shimmerSweep { 0%{left:-80%} 100%{left:130%} }
      @keyframes badgePulse { 0%,100%{transform:translateX(-50%) scale(1);box-shadow:0 4px 20px rgba(200,164,74,0.4)} 50%{transform:translateX(-50%) scale(1.06);box-shadow:0 6px 28px rgba(200,164,74,0.7)} }
      @keyframes borderGlow { 0%,100%{border-color:rgba(62,207,191,0.4)} 50%{border-color:rgba(62,207,191,0.9)} }
      @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes sonarPulse { 0%{transform:scale(0.1);opacity:0.8} 100%{transform:scale(1.8);opacity:0} }
      @keyframes dropRise { 0%{transform:translateY(0);opacity:0} 20%{opacity:0.9} 80%{opacity:0.9} 100%{transform:translateY(-80px);opacity:0} }
      @keyframes filterLight { 0%,100%{opacity:0.15} 50%{opacity:0.95} }
      @keyframes orbitSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes fillBottle { 0%,100%{transform:translateY(85px)} 45%,75%{transform:translateY(0)} }
      @keyframes burstLine { 0%{stroke-dashoffset:68;opacity:1} 60%{stroke-dashoffset:0;opacity:0.6} 100%{stroke-dashoffset:0;opacity:0} }
      @keyframes twinkle { 0%,100%{opacity:0.1;transform:scale(0.5)} 50%{opacity:1;transform:scale(1.3)} }
      @keyframes truckWobble { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      @keyframes snowFloat { from{transform:translate(0,0);opacity:0.5} to{transform:translate(8px,-12px);opacity:0.08} }
      @keyframes speedLine { from{opacity:0.35;transform:scaleX(1)} to{opacity:0;transform:scaleX(0.1)} }
      @keyframes stageIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
      @keyframes flowRight { 0%{transform:translateX(0);opacity:0} 8%{opacity:1} 90%{opacity:1} 100%{transform:translateX(640px);opacity:0} }
      @keyframes dashFlow { to{stroke-dashoffset:-36} }
      @keyframes stageHalo { 0%,100%{opacity:0.22;transform:scale(0.94)} 50%{opacity:0.6;transform:scale(1.06)} }
      @keyframes gritFall { 0%{transform:translateY(-6px);opacity:0} 25%{opacity:0.75} 100%{transform:translateY(30px);opacity:0} }

      .svg-anim { transform-box: fill-box; transform-origin: center center; }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }


      .marquee-wrapper { overflow:hidden; -webkit-mask-image:linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%); mask-image:linear-gradient(to right,transparent 0%,black 8%,black 92%,transparent 100%); }
      .marquee-track { display:flex; width:max-content; }
      .marquee-track:hover { animation-play-state:paused !important; }

      /* ── Scroll reveals ────────────────────────────────────────────────────
         Every rule here is scoped to html.js-on, which an inline <head> script
         sets before first paint. Unscoped, opacity:0 is a promise that
         JavaScript will come along and add .visible — and on a prerendered page
         that promise is broken twice over: a crawler that does not execute JS
         would receive a full document and render all of it invisible, and a
         real visitor would see the content paint, vanish the instant the
         stylesheet applied, then fade back in.

         Scoped this way the content is visible by default and only becomes
         animatable once we know something is running to animate it. */
      html.js-on .reveal { opacity:0; transform:translateY(28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      html.js-on .reveal.visible { opacity:1; transform:translateY(0); }
      html.js-on .reveal-left { opacity:0; transform:translateX(-28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      html.js-on .reveal-left.visible { opacity:1; transform:translateX(0); }
      html.js-on .reveal-right { opacity:0; transform:translateX(28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      html.js-on .reveal-right.visible { opacity:1; transform:translateX(0); }

      /* ── Glass ─────────────────────────────────────────────────────────────
         Both surfaces state an opaque background FIRST, then upgrade to the
         translucent one only where backdrop-filter actually works. Written the
         other way round — translucent by default, blur bolted on — anything
         without backdrop-filter support (Safari < 9, Firefox with
         layout.css.backdrop-filter disabled) renders a 5%-white pane over raw
         page content, and the navbar's links land on top of the hero headline
         with no separation at all. The fallback is the same navy the blur
         resolves to over this background, so the degrade is a loss of depth,
         never a loss of contrast. */
      .glass, .glass-card {
        background: rgba(11,26,35,0.86);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-glass);
      }
      @supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
        .glass, .glass-card {
          background: var(--glass);
          -webkit-backdrop-filter: blur(var(--blur));
          backdrop-filter: blur(var(--blur));
        }
      }

      .glass-card {
        border-radius: 20px;
        transition: transform 0.35s, border-color 0.35s, box-shadow 0.35s;
      }
      .glass-card:hover {
        transform: translateY(-6px);
        border-color: rgba(62,207,191,0.3);
        box-shadow: 0 24px 60px rgba(62,207,191,0.1);
      }

      /* ── Navbar ────────────────────────────────────────────────────────────
         A detached pill inset from all three edges rather than a full-bleed
         bar. Consequence worth knowing: the bar no longer spans the viewport,
         so it cannot "cover" content the way a full-width bar does — every
         scroll-margin and top-padding below is measured against 14 + 64 = 78px
         of occupied space, rounded up to 92 for breathing room. */
      .nav-bar {
        position: fixed; top: 14px; left: 5%; right: 5%; z-index: 1000;
        display: flex; align-items: center; justify-content: space-between;
        gap: 20px; height: 64px; padding: 0 10px 0 18px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.35);
        transition: background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease,
                    top 0.35s cubic-bezier(0.22,1,0.36,1), left 0.35s cubic-bezier(0.22,1,0.36,1),
                    right 0.35s cubic-bezier(0.22,1,0.36,1), border-radius 0.35s ease,
                    padding 0.35s cubic-bezier(0.22,1,0.36,1);
      }
      .brand-ripple { transition: opacity 0.3s ease; }
      /* Scrolled: the pill docks. It goes full-bleed to all three edges, drops
         its radius and its side borders, and — the point of the exercise —
         turns fully opaque. The resting state's translucency is a flourish that
         only works over the hero; once the page is moving, section content
         sliding visibly *through* the bar reads as a bug, not as depth. So the
         blur upgrade is cancelled here too (backdrop-filter over an opaque
         background is pure cost for no visible effect), and the transition is
         on the geometry as well as the colour so the dock is a movement rather
         than a jump. */
      .nav-scrolled {
        top: 0; left: 0; right: 0;
        border-radius: 0;
        border-color: transparent;
        border-bottom-color: rgba(62,207,191,0.22);
        background: var(--navy);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        box-shadow: 0 10px 34px rgba(0,0,0,0.55);
        padding-left: 5%; padding-right: 5%;
      }
      @supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
        .nav-scrolled { background: var(--navy); }
      }
      /* The reflection hangs 26px below the pill. Detached that is a nice
         touch; docked it is three arcs floating over the page content the bar
         is now sitting flush against. */
      .nav-scrolled .brand-ripple { opacity: 0; }

      /* Resting/hover/active colour moved out of the inline onMouseEnter and
         onMouseLeave handlers this used to carry. Those had to recompute the
         resting colour per link so hovering the active one did not demote it —
         an attribute selector states the same rule once and cannot get it
         wrong. */
      .nav-link {
        position: relative; color: var(--muted); font-size: 14px; font-weight: 500;
        font-family: 'DM Sans', sans-serif; text-decoration: none; padding: 4px 0;
        white-space: nowrap; transition: color 0.2s;
      }
      .nav-link:hover, .nav-link[aria-current="page"] { color: var(--white); }
      .nav-link:focus-visible { outline: 2px solid var(--aqua); outline-offset: 4px; border-radius: 3px; }
      /* The active marker. This is an MPA — the active link cannot change
         without a full document load — so the dot is static by design; there is
         no transition for it to play and nothing for Framer to animate. */
      .nav-link-dot {
        position: absolute; left: 50%; bottom: -9px;
        width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%;
        background: var(--aqua); box-shadow: 0 0 8px rgba(62,207,191,0.9);
      }

      /* ── Site search ───────────────────────────────────────────────────────
         Presentation only. The debounce, the search_zero_results reporting and
         the onNavigate contract in SiteSearch.jsx are untouched. */
      .site-search-input {
        background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);
        border-radius: 50px; padding: 9px 34px 9px 16px; color: var(--white);
        font-family: 'DM Sans', sans-serif; font-size: 14px; width: 176px; outline: none;
        transition: border-color 0.25s, background-color 0.25s, width 0.3s cubic-bezier(0.22,1,0.36,1);
      }
      .site-search-input::placeholder { color: var(--muted); }
      .site-search-input:focus { border-color: rgba(62,207,191,0.55); background: rgba(255,255,255,0.08); width: 210px; }
      /* The native clear affordance renders as a light-on-light X against this
         fill and cannot be recoloured; Escape and selecting a result both
         already clear the field. */
      .site-search-input::-webkit-search-cancel-button { display: none; }
      .site-search-icon {
        position: absolute; right: 13px; top: 50%; margin-top: -7px;
        color: var(--muted); pointer-events: none; transition: color 0.25s;
      }
      .site-search-input:focus ~ .site-search-icon { color: var(--aqua); }
      /* In the drawer it is the full width of the panel, not a bar affordance. */
      .nav-drawer .site-search-input { width: 100%; }
      .nav-drawer .site-search-input:focus { width: 100%; }

      /* ── Emblem ────────────────────────────────────────────────────────────
         Light points around the ring, on the existing twinkle keyframe at
         staggered delays. Pure CSS — the concept's particle field without a
         particle library. They are SVG circles inside the mark rather than
         positioned spans beside it, so they scale with it. */
      .brand-ray { animation: twinkle 3.2s ease-in-out infinite; }
      .brand-ring { transition: stroke-opacity 0.35s; }
      .brand-lockup:hover .brand-ring { stroke-opacity: 1; }
      .brand-drop { filter: drop-shadow(0 0 7px rgba(62,207,191,0.30)); }

      /* The emblem's reflection below the pill. Absolutely positioned and
         allowed to overflow the bar — .nav-bar leaves overflow visible, which
         is what lets this sit outside it. Masked at both ends so the arcs fade
         out rather than terminating. */
      .brand-ripple {
        position: absolute; left: 50%; bottom: -26px;
        width: 128%; height: 30px; margin-left: -64%;
        pointer-events: none; overflow: visible;
        -webkit-mask-image: radial-gradient(ellipse 55% 100% at 50% 0%, #000 30%, transparent 78%);
        mask-image: radial-gradient(ellipse 55% 100% at 50% 0%, #000 30%, transparent 78%);
      }

      /* ── Mobile drawer ─────────────────────────────────────────────────────
         Net-new. Until now .nav-links was simply display:none below 768px,
         which left every nav destination unreachable on a phone except through
         the footer. */
      /* No display:none plus a media query here. useCompact() in Navbar.jsx
         already decides whether this button exists at all, and stating the
         breakpoint a second time in CSS means two sources of truth for one
         decision — when they disagree the bar renders neither the inline links
         nor the burger, and the site has no navigation. React owns it; this
         just styles whatever React chose to render. */
      /* ── Bar fit ───────────────────────────────────────────────────────────
         The three groups in .nav-bar are flex items, and a flex item's default
         min-width is its min-content width — so between 900px (where the burger
         replaces the links) and ~1200px the links, the search field and the
         full-label brochure pill simply refused to shrink and ran 77px past the
         right edge of a 1024px viewport. min-width:0 lets the two flexible
         groups give way; the burger and the pill keep their size. */
      .nav-bar > * { min-width: 0; }
      .nav-links { display: flex; align-items: center; gap: 30px; min-width: 0; }
      .nav-actions { flex: none; }

      .nav-burger {
        display: inline-flex; width: 42px; height: 42px; flex: none;
        align-items: center; justify-content: center;
        background: rgba(62,207,191,0.08); border: 1px solid var(--glass-border);
        border-radius: 12px; color: var(--white); cursor: pointer; padding: 0;
      }
      .nav-burger:hover { background: rgba(62,207,191,0.16); }
      .nav-burger:focus-visible { outline: 2px solid var(--aqua); outline-offset: 3px; }

      .nav-drawer {
        position: fixed; top: 86px; left: 5%; right: 5%; z-index: 999;
        overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.55);
      }
      /* Follows the bar down when it docks: flush under a full-bleed bar, and
         opaque for the same reason the bar is. */
      .nav-drawer.nav-drawer-docked {
        top: 64px; left: 0; right: 0;
        border-radius: 0; border-color: transparent;
        border-bottom-color: rgba(62,207,191,0.22);
        background: var(--navy);
        -webkit-backdrop-filter: none; backdrop-filter: none;
      }
      .nav-drawer-inner { padding: 14px; display: flex; flex-direction: column; gap: 2px; }
      .nav-drawer a {
        display: block; padding: 13px 14px; border-radius: 10px;
        color: var(--muted); text-decoration: none; font-size: 15px; font-weight: 500;
        transition: background-color 0.2s, color 0.2s;
      }
      .nav-drawer a:hover, .nav-drawer a[aria-current="page"] { background: rgba(62,207,191,0.09); color: var(--white); }
      .nav-drawer a:focus-visible { outline: 2px solid var(--aqua); outline-offset: -2px; }

      /* ── Brand lockup ──────────────────────────────────────────────────────
         The droplet is the page's scroll gauge: --fill runs 0.35 -> 1 and the
         water slab slides to match. See BrandLockup in Navbar.jsx for why the
         mark is inline SVG rather than the <img> it used to be. */
      .brand-lockup {
        display: flex; align-items: center; gap: 11px; text-decoration: none;
        flex: none; transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .brand-lockup:hover { transform: translateY(-1px); }
      .brand-lockup:focus-visible { outline: 2px solid var(--aqua); outline-offset: 6px; border-radius: 4px; }

      /* Holds the droplet plus its sparkle field, which is absolutely
         positioned and allowed to overflow the mark's own box. */
      .brand-mark { position: relative; display: flex; flex: none; }
      .brand-text { display: flex; flex-direction: column; gap: 3px; }

      /* 54px, up from 40. The viewBox grew from 131 to 184 units to make room
         for the ring and its light points, which would otherwise have shrunk
         the droplet inside it from ~36px to ~26px. At 54 the droplet lands back
         at ~35px and the whole emblem still clears the 64px pill. */
      .brand-drop { height: 54px; width: auto; display: block; overflow: visible; transition: filter 0.3s; }
      /* Flat at rest, per the depth system — the glow is hover feedback, not
         decoration baked into the mark. */
      .brand-lockup:hover .brand-drop { filter: drop-shadow(0 4px 14px rgba(62,207,191,0.45)); }

      /* The waterline is positioned by the SVG transform attribute, set from the
         scroll handler — not by a CSS transform. A CSS transform on this path is
         silently dropped (it computes to the identity matrix even when set
         inline and left to settle), and the attribute has no such problem.
         Tracking scroll 1:1 also suits a gauge better than easing toward the
         target would: no lag between the scrollbar and the level. */

      .brand-word {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 21px; font-weight: 600; letter-spacing: 0.22em;
        color: var(--white); line-height: 1; white-space: nowrap;
      }
      /* The descriptor line. Small and muted on purpose: it explains the brand
         to a first-time visitor without competing with the wordmark above it. */
      .brand-sub {
        font-size: 10.5px; font-weight: 500; letter-spacing: 0.055em;
        color: var(--muted); line-height: 1; white-space: nowrap;
      }

      /* Below this the bar is carrying the burger and the brochure CTA too; the
         droplet alone still identifies the site. */
      @media (max-width: 600px) {
        .brand-word, .brand-sub { display: none; }
        .brand-drop { height: 46px; }
        .brand-ripple { display: none; }
      }

      /* One vertical rhythm for every heading-plus-content section.
         The ceiling is 64px, not the 100px this page used to carry, because a
         section is only doing its job if its heading and the thing it
         introduces land in the same view: on a 1080p laptop that is roughly
         850px, and a pricing heading block plus a full tier card has to clear
         it. Below ~1160px viewport width the clamp tightens further on its
         own, which is where the grids start stacking anyway. */
      :root { --sec-pad: clamp(44px, 5.5vw, 64px); --head-gap: 32px; }
      /* One horizontal gutter for every full-width band — sections, the hero
         copy and the footer. These were three separate 5% values resolved
         against three different containing blocks, which on a phone put
         their left edges at visibly
         different x. 5% of 390px is also only 19px; the floor keeps
         a readable margin on the narrowest phones. Deliberately max() and not
         clamp(): above ~400px this resolves to exactly the 5% these bands
         already used, so nothing on desktop moves. */
      :root { --gutter: max(20px, 5%); }
      .sec { padding: var(--sec-pad) var(--gutter); }
      /* Sections are cross-route deep-link targets (/pricing#faq) and the navbar
         floats above them — without this the anchor lands underneath it. */
      .sec { scroll-margin-top: var(--nav-clear); }
      .sec-head { text-align: center; margin-bottom: var(--head-gap); }

      /* ── Page head: breadcrumbs + the route's h1 ───────────────────────────
         Every route except home renders one of these above its sections. Five
         of the six pages previously had no h1 in the DOM at all — their top
         heading was a section h2 — so this band is the fix for that, not
         decoration. It is set left-aligned against the same gutter every other
         band uses, and sits tighter above the first section than a .sec would,
         so the heading reads as the page's title rather than as a section. */
      .page-head { padding: clamp(28px, 4vw, 44px) var(--gutter) 0; max-width: 1200px; margin: 0 auto; }
      .page-h1 {
        font-family: 'Cormorant Garamond', serif; font-weight: 700;
        font-size: clamp(32px, 4.6vw, 58px); line-height: 1.08;
        color: var(--white); margin: 14px 0 0; max-width: 20ch;
      }
      .page-lede { color: var(--muted); font-size: 16.5px; line-height: 1.75; margin: 18px 0 0; max-width: 72ch; }
      .crumbs ol { list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 0; margin: 0; }
      .crumbs li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
      .crumbs a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
      .crumbs a:hover { color: var(--aqua); }
      .crumbs [aria-current='page'] { color: var(--white); }
      .crumb-sep { color: rgba(122,155,181,0.5); }
      /* The h1 band already introduces the page, so the first section under it
         does not need its own full top padding as well. */
      .page-head + .sec, .page-head + div > .sec:first-child { padding-top: clamp(28px, 3.5vw, 40px); }

      /* ── Generated content pages ───────────────────────────────────────────
         One set of rules for all ~23 pages under src/content, which all render
         through src/content/render.jsx. Measure is capped at 72ch: these are
         1,200–1,800 word documents and a full-width line of body text at
         desktop widths is genuinely hard to read. */
      .content-body { max-width: 860px; margin: 0 auto; padding: 8px var(--gutter) 72px; }
      .content-body p { color: var(--muted); line-height: 1.8; font-size: 16.5px; margin: 0 0 18px; max-width: 72ch; }
      .content-body a { color: var(--aqua); text-decoration: underline; text-underline-offset: 3px; }
      .content-section { margin-top: 44px; scroll-margin-top: var(--nav-clear); }
      .content-section h2, .key-facts h2, .quote-box h2 {
        font-family: 'Cormorant Garamond', serif; font-weight: 700;
        font-size: clamp(24px, 3vw, 36px); color: var(--white); line-height: 1.15; margin: 0 0 16px;
      }
      .content-section h3 { font-size: 17px; font-weight: 600; color: var(--white); margin: 26px 0 8px; }
      .content-list { margin: 0 0 18px; padding-left: 22px; color: var(--muted); line-height: 1.8; font-size: 16.5px; max-width: 72ch; }
      .content-list li { margin-bottom: 12px; }
      .content-list strong { color: var(--white); font-weight: 600; }
      .faq-item { border-top: 1px solid var(--glass-border); padding-top: 18px; margin-top: 18px; }
      .faq-item h3 { margin-top: 0; }
      .content-brochure { margin-top: 40px; }

      /* Key facts. A <dl> laid out as a two-column grid so the term and its
         value stay visually paired at any width — the pairing is the whole
         reason this block exists. */
      .key-facts { margin-top: 44px; }
      .key-facts dl { margin: 0; border-top: 1px solid var(--glass-border); }
      .fact-row {
        display: grid; grid-template-columns: minmax(150px, 34%) 1fr; gap: 16px;
        padding: 13px 0; border-bottom: 1px solid var(--glass-border);
      }
      .fact-row dt { color: var(--white); font-weight: 600; font-size: 14.5px; }
      .fact-row dd { color: var(--muted); font-size: 14.5px; line-height: 1.65; margin: 0; }

      /* Tables scroll inside their own container. The page body must never
         scroll sideways, and a five-column rate card on a phone will not fit. */
      .table-wrap { overflow-x: auto; margin: 0 0 22px; -webkit-overflow-scrolling: touch; }
      .data-table { border-collapse: collapse; width: 100%; min-width: 520px; font-size: 14.5px; }
      .data-table caption { text-align: left; color: var(--muted); font-size: 13px; padding-bottom: 10px; }
      .data-table th, .data-table td { padding: 11px 14px; text-align: left; border-bottom: 1px solid var(--glass-border); vertical-align: top; }
      .data-table thead th { color: var(--white); font-weight: 600; border-bottom-color: rgba(62,207,191,0.35); white-space: nowrap; }
      .data-table tbody th { color: var(--white); font-weight: 600; }
      .data-table td { color: var(--muted); line-height: 1.6; }
      .data-table tbody tr:hover { background: rgba(255,255,255,0.02); }

      /* Quote form. The only form on the site — see the note in render.jsx. */
      .quote-box { margin-top: 52px; padding: 28px; background: var(--navy-card); border: 1px solid var(--glass-border); border-radius: 20px; }
      .quote-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
      .quote-form label { display: flex; flex-direction: column; gap: 6px; font-size: 13.5px; color: var(--white); font-weight: 500; }
      .quote-form label em { color: var(--muted); font-style: normal; font-weight: 400; }
      .quote-form input, .quote-form textarea {
        background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 10px;
        padding: 11px 13px; color: var(--white); font-family: 'DM Sans', sans-serif; font-size: 15px;
      }
      .quote-form input:focus, .quote-form textarea:focus { outline: 2px solid var(--aqua); outline-offset: 1px; border-color: transparent; }
      .quote-wide { grid-column: 1 / -1; }
      .quote-submit {
        background: var(--aqua); color: #04101f; border: none; border-radius: 10px;
        padding: 13px 26px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer;
      }
      .quote-submit:disabled { opacity: 0.6; cursor: progress; }
      .quote-error { color: #ff8f8f; font-size: 14px; margin-top: 10px; }
      @media (max-width: 700px) {
        .quote-form { grid-template-columns: 1fr; }
        .fact-row { grid-template-columns: 1fr; gap: 4px; }
      }

      /* Direct-lines panel. One opaque Navy Card surface holding three rows
         divided by hairlines — deliberately not three separate cards, which
         would flatten WhatsApp, phone, and email into equal weight when they
         are not equal. The primary row carries a teal wash; the other two are
         bare. Rows are real <a> elements so the delegated click listener in
         analytics/delegate.ts instruments them from their href alone. */
      .ch-panel {
        background: var(--navy-card);
        border: 1px solid var(--glass-border);
        border-radius: 24px;
        overflow: hidden;
      }
      .ch-row {
        display: grid;
        grid-template-columns: 46px 1fr 20px;
        align-items: center;
        gap: 18px;
        padding: 22px 26px;
        text-decoration: none;
        border-top: 1px solid var(--glass-border);
        transition: background-color 0.3s cubic-bezier(0.22,1,0.36,1);
      }
      .ch-row:first-child { border-top: none; }
      .ch-row:hover { background: rgba(62,207,191,0.05); }
      .ch-row:focus-visible { outline: 2px solid var(--aqua); outline-offset: -3px; }
      /* The primary row is taller and pre-tinted: WhatsApp is where these
         buyers actually start, so it should not have to be found. */
      .ch-row-primary { padding: 28px 26px; background: rgba(62,207,191,0.07); }
      .ch-row-primary:hover { background: rgba(62,207,191,0.11); }

      .ch-disc {
        width: 46px; height: 46px; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        background: rgba(62,207,191,0.1);
        border: 1px solid rgba(62,207,191,0.22);
        color: var(--aqua);
        transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), background-color 0.3s;
      }
      .ch-row:hover .ch-disc { transform: scale(1.07); background: rgba(62,207,191,0.18); }
      .ch-row-primary .ch-disc { background: rgba(62,207,191,0.16); border-color: rgba(62,207,191,0.4); }

      .ch-title { display: block; color: var(--white); font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
      .ch-row-primary .ch-title { font-size: 17px; font-weight: 700; }
      .ch-note { display: block; color: var(--muted); font-size: 13px; line-height: 1.5; margin-top: 3px; }
      .ch-value { display: block; color: var(--aqua); font-size: 13.5px; font-weight: 500; margin-top: 7px; letter-spacing: 0.01em; }

      .ch-arrow {
        color: var(--muted); font-size: 17px; line-height: 1;
        transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), color 0.3s;
      }
      .ch-row:hover .ch-arrow { transform: translateX(4px); color: var(--aqua); }

      /* Copy control. Overlaid on the row rather than placed in its grid,
         because the row is an <a> and a button cannot live inside one — see
         ChannelRow. Sitting above the anchor means a click on it never also
         fires the tel:/mailto: handoff underneath. */
      .ch-row-wrap { position: relative; }
      .ch-copy {
        position: absolute; right: 54px; top: 50%; transform: translateY(-50%);
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 12px; border-radius: 8px;
        background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
        color: var(--muted); font-family: 'DM Sans', sans-serif;
        font-size: 12px; font-weight: 500; line-height: 1;
        cursor: pointer;
        transition: background-color 0.25s, color 0.25s, border-color 0.25s;
      }
      .ch-copy:hover { background: rgba(62,207,191,0.14); color: var(--aqua); border-color: rgba(62,207,191,0.4); }
      .ch-copy:focus-visible { outline: 2px solid var(--aqua); outline-offset: 2px; }
      .ch-copy[data-state="copied"] { color: var(--aqua); border-color: rgba(62,207,191,0.45); }
      .ch-copy[data-state="failed"] { color: var(--gold); border-color: rgba(200,164,74,0.45); }
      @media (max-width: 600px) {
        .ch-copy { right: 44px; padding: 6px 9px; font-size: 11px; }
      }

      /* Footer variant. The footer contact rows are ordinary flex lines, not
         an overlaid anchor, so the absolute positioning above is undone and the
         control is sized down to sit on a 13px text row. */
      .footer-copy {
        position: static; transform: none;
        padding: 4px 8px; font-size: 11px; border-radius: 6px;
      }
      .footer-row {
        display: flex; align-items: center; gap: 8px;
        color: var(--muted); font-size: 13px; margin-bottom: 10px; line-height: 1.5;
      }
      .footer-row a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
      .footer-row a:hover { color: var(--aqua); }

      /* The panel foot is the low-commitment exit: a buyer who is not ready to
         talk to anyone still leaves with the rate card. */
      .ch-foot {
        border-top: 1px solid var(--glass-border);
        background: rgba(4,16,31,0.35);
        padding: 20px 26px;
        display: flex; flex-wrap: wrap; align-items: center; gap: 14px;
      }
      @media (max-width: 600px) {
        .ch-row { padding: 20px; gap: 14px; grid-template-columns: 42px 1fr 16px; }
        .ch-row-primary { padding: 24px 20px; }
        .ch-disc { width: 42px; height: 42px; }
        .ch-foot { padding: 18px 20px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .ch-row:hover .ch-disc, .ch-row:hover .ch-arrow { transform: none; }
      }

      .step-card:hover .step-num { background: var(--aqua); color: var(--navy); }
      .industry-chip:hover { border-color:var(--aqua) !important; background:rgba(62,207,191,0.08) !important; transform:translateX(4px); }
      .bottle-card {
        transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease, border-color 0.3s ease !important;
        position: relative !important;
      }
      .bottle-card::after {
        content:''; position:absolute; top:0; left:-80%; width:50%; height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
        transform:skewX(-18deg); pointer-events:none; z-index:2;
      }
      .bottle-card:hover {
        transform: translateY(-12px) scale(1.02) !important;
        box-shadow: 0 32px 64px rgba(0,0,0,0.45), 0 0 50px rgba(62,207,191,0.12) !important;
      }
      .bottle-card:hover::after { animation: shimmerSweep 0.65s ease forwards; }
      .bottle-card svg { transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.3s ease; }
      .bottle-card:hover svg { transform: scale(1.06) !important; filter: drop-shadow(0 24px 48px rgba(62,207,191,0.45)) !important; }
      /* The stage cards enter in flow order, 01 → 07, so the reveal reads as water
         moving down the filtration train rather than seven boxes appearing at once.
         fill-mode is 'backwards' on purpose: 'both' would pin transform after the
         animation and silently kill the .glass-card:hover lift. */
      .stage-card-in { animation: stageIn 0.5s cubic-bezier(0.22,1,0.36,1) backwards; }
      .stage-btn {
        text-align: left; background: var(--navy-card); cursor: pointer;
        border: 1px solid var(--glass-border); border-radius: 16px; padding: 16px 18px;
        font-family: 'DM Sans', sans-serif; width: 100%;
        /* A button centres its content vertically; the grid stretches these to a
           common height, so without this the seven headings sit at seven
           different heights across the row. */
        display: flex; flex-direction: column; align-items: flex-start;
        transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, opacity 0.3s ease, box-shadow 0.4s ease;
      }
      .stage-btn:focus-visible { outline: 2px solid var(--aqua); outline-offset: 3px; }
      .filtration-rail { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
      @media (max-width: 1080px) { .filtration-rail { grid-template-columns: repeat(4, 1fr); } }
      @media (max-width: 768px)  { .filtration-rail { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 460px)  { .filtration-rail { grid-template-columns: 1fr; } }
      .stage-toggle { transition: opacity 0.25s cubic-bezier(0.22,1,0.36,1); }
      .stage-toggle:hover { opacity: 0.78; }
      .stage-toggle:focus-visible { outline: 2px solid var(--aqua); outline-offset: 4px; border-radius: 4px; }
      .stage-toggle-icon { transition: transform 0.4s cubic-bezier(0.22,1,0.36,1); }

      .featured-badge { animation: badgePulse 2.4s ease-in-out infinite; }
      .featured-card { animation: borderGlow 2.5s ease-in-out infinite; }

      /* Download icon: the tray stays put, the arrow drops into it on hover.
         Two separate transforms so the arrow can also fade at the bottom of the
         travel and reappear at the top, which reads as a repeating download. */
      .dl-icon { flex: none; overflow: visible; }
      .dl-icon .dl-arrow { transform-origin: 50% 50%; }
      /* Sheen sweep. Lives on ::after so it needs its own stacking context,
         otherwise the clip would also catch the button's outer glow. */
      .dl-btn { position: relative; overflow: hidden; isolation: isolate; }
      .dl-btn::after {
        content: ''; position: absolute; inset: 0; pointer-events: none;
        transform: translateX(-130%);
        background: linear-gradient(100deg, transparent 25%, rgba(255,255,255,0.38) 50%, transparent 75%);
      }
      .dl-btn-ghost::after {
        background: linear-gradient(100deg, transparent 25%, rgba(62,207,191,0.22) 50%, transparent 75%);
      }
      .dl-btn:hover::after { animation: dl-sheen 0.9s ease-out; }
      @keyframes dl-sheen { to { transform: translateX(130%); } }
      /* The icon sits in a tinted disc so the glyph reads as a badge, not a bullet. */
      .dl-chip {
        display: inline-flex; align-items: center; justify-content: center; flex: none;
        width: 34px; height: 34px; border-radius: 50%;
        background: rgba(4,26,43,0.14); transition: background 0.3s, transform 0.3s;
      }
      .dl-btn-ghost .dl-chip { background: rgba(62,207,191,0.14); }
      .dl-btn:hover .dl-chip { background: rgba(4,26,43,0.22); transform: scale(1.06); }
      .dl-btn-ghost:hover .dl-chip { background: rgba(62,207,191,0.24); }
      .dl-btn:hover .dl-icon .dl-arrow { animation: dl-drop 0.9s ease-in-out infinite; }
      .dl-btn:hover .dl-icon .dl-tray { animation: dl-pulse 0.9s ease-in-out infinite; }
      @keyframes dl-drop {
        0%   { transform: translateY(-1px); opacity: 1; }
        55%  { transform: translateY(3px);  opacity: 1; }
        70%  { transform: translateY(4px);  opacity: 0; }
        71%  { transform: translateY(-4px); opacity: 0; }
        100% { transform: translateY(-1px); opacity: 1; }
      }
      @keyframes dl-pulse {
        0%, 45%, 100% { transform: translateY(0); }
        62%           { transform: translateY(1px); }
      }
      @media (prefers-reduced-motion: reduce) {
        .dl-btn:hover .dl-icon .dl-arrow,
        .dl-btn:hover .dl-icon .dl-tray,
        .dl-btn:hover::after { animation: none; }
        .dl-btn:hover .dl-chip { transform: none; }
      }

      /* ── Hero: copy entrance ───────────────────────────────────────────────
         Note what is NOT in this list: .hero-h1. The headline is the LCP
         element, so it paints at full opacity on the first frame and is never
         animated by anything — no fade, no JS gate, nothing that can leave the
         largest text on the page invisible if a frame loop stalls. The blocks
         beneath it are free to arrive.

         fill-mode is 'both' so the end state survives the animation, and the
         blanket prefers-reduced-motion rule above collapses the duration to
         nothing without needing a second declaration here. */
      .hero-enter { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both; }
      .hero-enter-1 { animation-delay: 0.05s; }
      .hero-enter-2 { animation-delay: 0.15s; }
      .hero-enter-3 { animation-delay: 0.25s; }
      .hero-enter-4 { animation-delay: 0.35s; }

      /* Space held for the subheading so the geo copy swap cannot move anything
         below it. Sized to the LONGER of the two variants at each measure: three
         lines across the desktop range this paragraph gets (405–470px), four
         once the layout stacks and a phone hands it ~350px. The teal rule is a
         border on this wrapper rather than on the <p>, so it spans the reserved
         height instead of only the text currently in it. */
      .hero-sub {
        border-left: 2px solid rgba(62,207,191,0.55);
        padding-left: 20px; margin-bottom: 22px; min-height: 95px;
      }
      @media (max-width: 900px) { .hero-sub { min-height: 130px; } }
      @media (max-width: 420px) { .hero-sub { min-height: 158px; } }

      /* ── Hero: shell ───────────────────────────────────────────────────────
         The background is deliberately close to black. It used to carry a teal
         mountain silhouette and two glow orbs; against those the artwork had
         nothing to be brighter than and the whole hero read flat. The vignette
         is centred on the bottles so the only light in the section appears to
         come off the water. */
      /* A column, not a centred row, and the sample card is a real flex child at
         the end of it rather than something absolutely pinned to the bottom.
         Pinned, the card was positioned against the hero's own height — so when
         the content pushed the hero past 100vh the card went with it, off the
         bottom of the screen. In flow it is simply the last thing in the
         column and cannot be orphaned. The copy centres itself in whatever
         space is left over via auto margins. */
      .hero {
        position: relative; overflow: hidden;
        min-height: 100vh; padding-bottom: 28px;
        display: flex; flex-direction: column;
        background: #05090f;
      }
      .hero-vignette {
        position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 62% 68% at 66% 54%, #0e2430 0%, #0a1520 42%, #05090f 78%);
      }

      .hero-copy {
        position: relative; z-index: 2; width: 100%; max-width: 690px;
        padding: 0 0 0 5%;
        /* auto margins centre it in whatever space is left over. flex: none
           because a shrinkable item in a column whose min-height is 100vh gets
           squeezed below its own content once the content is taller than that —
           which is the normal case on a short laptop, and would put the stats
           row inside the sample card. */
        flex: none; margin: auto 0;
      }
      /* 76px, not 82. Two lines of display serif is the single biggest block in
         the column, and the six px buys back twelve — which is most of what the
         sample card needed to stay above the fold on a laptop. */
      .hero-h1 {
        font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700;
        font-size: clamp(46px, 5.2vw, 76px); line-height: 1.04;
        letter-spacing: -0.015em; color: var(--white); margin-bottom: 18px;
      }

      /* ── Hero: artwork ─────────────────────────────────────────────────────
         Absolutely positioned rather than sitting in a grid column, because the
         composition depends on overlap: the ripple has to spread left behind
         the stats row and the glow has to bleed past the section's right edge.
         A grid cell cannot do either.

         The file carries its own alpha (see scripts/make-hero-bottles.mjs), so
         there is no blend mode here and nothing to feature-detect.

         z-index 1 puts it above the vignette and below .hero-copy, so the
         bottles pass behind the stats row the way they do in the concept. */
      /* Pulled in from the right edge rather than hugging it: the floating
         WhatsApp button lives at the bottom-right corner, and at 4% the water
         ran straight under it. Inset far enough that the two never share
         space and the art has room around it. */
      .hero-art {
        position: absolute; z-index: 1; right: 9%; bottom: 150px;
        /* Sized by HEIGHT, not width. The art has to clear the navbar above it
           and the sample card below it, and both of those are fixed pixel
           offsets — so the constraint is vertical. Sizing by width let the
           bottles grow until the gold cap collided with the navbar on any short
           viewport. Width follows from the aspect ratio. */
        height: min(66vh, 600px); width: auto;
        pointer-events: none; user-select: none;
      }
      /* Short viewports have to satisfy both clearances at once — the navbar
         above and the sample card below — out of a much smaller budget. Raising
         the art alone pushes the gold cap under the navbar; lowering it alone
         runs it into the card. So the art also gets smaller here, which is what
         buys room for both. The card occupies 131px of the bottom (28 padding +
         79 card + 24 gap), hence 132. */
      @media (max-height: 800px) {
        .hero-art { height: min(60vh, 510px); bottom: 132px; }
      }

      /* ── Hero: sample-bottle card ──────────────────────────────────────────
         Was a full-bleed gold band pinned across the bottom. Now a frosted card
         sized to the copy column, not the viewport — at full bleed it ran under
         the artwork and sliced the water in half. */
      /* Inside .hero-copy now, between the subheading and the CTAs — so it takes
         the column's width and needs no positioning of its own. */
      .sample-card {
        width: 100%; margin-bottom: 26px;
        display: grid; grid-template-columns: 1fr 1fr; align-items: center;
        border-color: rgba(62,207,191,0.26);
      }
      .sample-cell { display: flex; align-items: center; gap: 14px; padding: 18px 26px; }
      .sample-cell + .sample-cell { border-left: 1px solid var(--glass-border); }
      .sample-icon { color: var(--aqua); flex: none; display: flex; }
      .sample-title { display: inline-block; color: var(--aqua); font-size: 15px; font-weight: 600; text-decoration: none; }
      a.sample-title:hover { text-decoration: underline; text-underline-offset: 3px; }
      a.sample-title:focus-visible { outline: 2px solid var(--aqua); outline-offset: 3px; border-radius: 3px; }
      .sample-note { display: block; color: var(--muted); font-size: 13px; margin-top: 3px; }
      @media (max-width: 640px) {
        .sample-card { grid-template-columns: 1fr; }
        .sample-cell + .sample-cell { border-left: none; border-top: 1px solid var(--glass-border); }
      }

      .products-grid { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
      .products-grid::-webkit-scrollbar { height: 4px; }
      .products-grid::-webkit-scrollbar-track { background: transparent; }
      .products-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

      /* ── Hero: narrow layouts ──────────────────────────────────────────────
         Two steps rather than one. Between 900 and 1100 the copy and the art
         are both still viable side by side, just tighter. Below 900 they cannot
         share a row, so the art leaves the absolute layer entirely and becomes
         a normal block under the copy — which is why the <img> sits after
         .hero-copy in the DOM. The sample card comes out of the absolute layer
         with it, otherwise it would overlap the artwork it is now beneath. */
      @media (max-width: 1100px) {
        .hero-art { height: min(60vh, 540px); bottom: 118px; right: 7%; }
        .hero-copy { max-width: 50%; }
      }
      @media (max-width: 900px) {
        .hero {
          flex-direction: column; justify-content: center;
          padding-bottom: 40px; min-height: 0;
        }
        .hero-copy { max-width: 100%; padding: 0 5%; order: 1; }
        .hero-art {
          position: static; order: 2;
          height: auto; width: min(88%, 520px); margin: 26px auto 0;
          transform: none !important;
        }
        /* No .sample-card rule needed here any more — it is a child of
           .hero-copy, so it stacks and reflows with it. */
        .hero-vignette { background: radial-gradient(ellipse 90% 46% at 50% 72%, #0e2430 0%, #0a1520 46%, #05090f 80%); }
      }

      /* ── Bar fit, 1200px ───────────────────────────────────────────────────
         Not 768px. useCompact() swaps the links for the burger at 900px, but
         between 900 and ~1200 the bar is still carrying six inline links, the
         search field AND the full-label brochure pill, and measured 77px past
         the right edge of a 1024px viewport. The label is what costs the width,
         so it goes first — well before the layout changes shape. */
      @media (max-width: 1200px) {
        .nav-links { gap: 18px; }
        .nav-brochure { padding: 11px !important; }
        .nav-brochure-label { display: none !important; }
        .site-search-input { max-width: 180px; }
      }

      /* The one-line treatment for the Services heading is a wide-viewport
         flourish. Below this the string cannot fit on one line at any font size
         the design allows, and forcing it was pushing the page 14px wider than
         the viewport on every phone. */
      @media (max-width: 1100px) {
        .services-h2 { white-space: normal; }
      }
      @media (min-width: 1101px) {
        .services-h2 { white-space: nowrap; }
      }

      @media (max-width: 768px) {
        :root { --sec-pad: 40px; --head-gap: 26px; }
        .about-grid { grid-template-columns: 1fr !important; }
        .products-grid { grid-template-columns: 1fr !important; }
        .pricing-grid { grid-template-columns: 1fr !important; }
        .contact-grid { grid-template-columns: 1fr !important; }
        .how-grid { grid-template-columns: 1fr 1fr !important; }
        .industries-grid { grid-template-columns: 1fr !important; }
        .footer-grid { grid-template-columns: 1fr !important; text-align: center; }
        /* .nav-links is no longer hidden here. The bar now renders EITHER the
           inline links or the burger, decided in JS by the same 900px query, so
           SiteSearch exists exactly once in the document — rendering it in both
           places and hiding one would put two id="site-search" inputs on the
           page and break the <label for> association for whichever won. */
        /* The brochure pill drops to icon-only — the label is what costs the
           width, and the burger now needs room beside it. */
        .nav-brochure { padding: 11px !important; }
        .nav-brochure-label { display: none !important; }
        .hero-h1 { font-size: clamp(36px,8vw,52px); }
        .services-numbered { grid-template-columns: 1fr !important; }
        .testimonials-grid { grid-template-columns: 1fr !important; }
        .journey-row-grid { grid-template-columns: 1fr !important; }
        /* The connector between step cards is drawn at right:-12% on the
           assumption of a 4-across row. Once the grid stacks it points off the
           side of the card into nothing. */
        .step-link { display: none !important; }
      }

      /* ── Touch targets ─────────────────────────────────────────────────────
         Measured at 390px: footer links were 18px tall, the copy buttons 23px,
         the stage toggle 17px — all well under the 44px minimum.

         Gated on width, not (pointer: coarse), even though coarse is the more
         literal expression of the concern. Every other breakpoint in this file
         is width-based, and a pointer query is invisible to width-based
         responsive testing — the rules would silently not apply in devtools and
         read as unfixed. 900px matches where the bar goes compact.

         Padding and min-height only — deliberately no font-size changes, so
         nothing reflows and the type scale stays exactly as designed. */
      @media (max-width: 900px) {
        .footer-link, .footer-row a, .sample-title, .stage-toggle, .ch-foot-link {
          min-height: 44px;
          display: inline-flex; align-items: center;
        }
        /* The links are the footer column's only content, so the tap area can
           come out of the gap that was already between them rather than making
           the column taller. */
        .footer-grid .footer-link { display: flex; margin-bottom: 0 !important; }
        .footer-grid { row-gap: 28px; }
        .stage-toggle { padding: 6px 0; }
        /* Not listed here: .product-cta, the "Order Now" button on the product
           cards. It measures 41px — 3px short — but the cards live in a
           fixed-252px marquee, so it is 41px at 1440 too. That makes it a
           standing sizing choice rather than anything responsive, and growing
           it would change the desktop card. Left alone deliberately. */
        .ch-copy { min-height: 44px; min-width: 44px; padding: 10px 12px !important; }
        .nav-burger { width: 44px; height: 44px; }
        /* 14, not 13: the glyph inside is 16px, so this is what makes the disc
           exactly 44. */
        .nav-brochure { padding: 14px !important; }
        /* The FAB is fixed, so the one place it is guaranteed to sit on top of
           something is the very end of the page. Give the last line room to
           clear it. */
        footer { padding-bottom: 92px; }
      }

      /* ── Narrow phones ─────────────────────────────────────────────────────
         Net-new tier. Until now the smallest general breakpoint was 768px, so a
         390px phone inherited the tablet layout wholesale — anything still too
         wide at 767px was equally broken at 390px. */
      @media (max-width: 460px) {
        :root { --sec-pad: 34px; --head-gap: 20px; }
        /* Two columns of icon-plus-label chips leave ~150px per cell here,
           which wraps every label onto three lines. */
        .about-features { grid-template-columns: 1fr !important; }
        /* Same reasoning as .step-link above: 2-up step cards are ~155px wide
           at this size, narrower than their own 52px numeral plus padding
           wants. */
        .how-grid { grid-template-columns: 1fr !important; }
        .service-item { grid-template-columns: 44px 1fr !important; gap: 16px !important; }
        /* The ripple ring spreads to 2.4× the disc, so at 58px/26px this was
           sweeping ~70px into the content column on every scroll. */
        :root { --wa-size: 50px; --wa-inset: 14px; }
        .wa-fab-glyph { width: 24px; height: 24px; }
      }
`

/**
 * Injects GLOBAL_CSS at runtime — but only when it is not already there.
 *
 * Prerendered pages are served with the same CSS inlined in <head> under
 * id="aq-global", so this becomes a no-op for every real visitor. It still runs
 * in `vite dev`, where nothing prerenders and the styles have to come from
 * somewhere.
 *
 * The `js-on` class is what re-enables the reveal animations: the .reveal rules
 * are scoped to html.js-on so that prerendered content is fully visible to
 * crawlers and to anyone without JS, instead of sitting at opacity:0 forever
 * waiting for an IntersectionObserver that will never run. In a browser the
 * class is set by an inline <head> script before first paint (see
 * scripts/prerender.mjs); this is the dev-server fallback for the same thing.
 */
export function useGlobalStyles() {
  useEffect(() => {
    document.documentElement.classList.add('js-on')
    if (document.getElementById('aq-global')) return
    const style = document.createElement('style')
    style.id = 'aq-global'
    style.textContent = GLOBAL_CSS
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
}
