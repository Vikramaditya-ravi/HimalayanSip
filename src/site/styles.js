import { useEffect } from 'react'

// ─── Global Style Injection ───────────────────────────────────────────────────
export function useGlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* The Google Fonts @import that used to head this block now lives as a
         static <link> in each route's HTML. Nested inside JS-injected CSS it was
         not discovered until the bundle mounted (~1.67s), which delayed the
         webfont swap on the H1 — the largest text on the page. */

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --navy: #04101f;
        --navy-mid: #081b35;
        --navy-card: #0b2244;
        --aqua: #3ecfbf;
        --aqua-dim: #1a8a80;
        --aqua-glow: rgba(62,207,191,0.15);
        --gold: #c8a44a;
        --white: #f5faff;
        --muted: #7a9bb5;
        --glass: rgba(255,255,255,0.04);
        --glass-border: rgba(255,255,255,0.09);
      }

      html { scroll-behavior: smooth; }
      body { font-family: 'DM Sans', sans-serif; background: var(--navy); color: var(--white); overflow-x: hidden; }

      ::-webkit-scrollbar { width: 5px; }
      ::-webkit-scrollbar-track { background: var(--navy); }
      ::-webkit-scrollbar-thumb { background: var(--aqua); border-radius: 3px; }

      @keyframes floatA { 0%,100%{transform:translateY(0) rotate(-6deg)} 50%{transform:translateY(-22px) rotate(-6deg)} }
      @keyframes floatB { 0%,100%{transform:translateY(-10px) rotate(4deg)} 50%{transform:translateY(12px) rotate(4deg)} }
      @keyframes floatC { 0%,100%{transform:translateY(4px) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(-2deg)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
      @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
      @keyframes waBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes floatD { 0%,100%{transform:translateY(0px) rotate(5deg)} 50%{transform:translateY(-20px) rotate(5deg)} }
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

      .reveal { opacity:0; transform:translateY(28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      .reveal.visible { opacity:1; transform:translateY(0); }
      .reveal-left { opacity:0; transform:translateX(-28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      .reveal-left.visible { opacity:1; transform:translateX(0); }
      .reveal-right { opacity:0; transform:translateX(28px); transition:opacity 0.75s ease,transform 0.75s ease; }
      .reveal-right.visible { opacity:1; transform:translateX(0); }

      .glass-card {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(16px);
        border-radius: 20px;
        transition: all 0.35s;
      }
      .glass-card:hover {
        transform: translateY(-6px);
        border-color: rgba(62,207,191,0.3);
        box-shadow: 0 24px 60px rgba(62,207,191,0.1);
      }

      .nav-scrolled {
        background: rgba(4,16,31,0.92) !important;
        backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid var(--glass-border) !important;
      }

      /* ── Brand lockup ──────────────────────────────────────────────────────
         The droplet is the page's scroll gauge: --fill runs 0.35 -> 1 and the
         water slab slides to match. See BrandLockup in Navbar.jsx for why the
         mark is inline SVG rather than the <img> it used to be. */
      .brand-lockup {
        display: flex; align-items: center; gap: 11px; text-decoration: none;
        transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .brand-lockup:hover { transform: translateY(-1px); }
      .brand-lockup:focus-visible { outline: 2px solid var(--aqua); outline-offset: 6px; border-radius: 4px; }

      .brand-drop { height: 40px; width: auto; display: block; overflow: visible; transition: filter 0.3s; }
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

      /* Below this the bar is carrying search and the brochure CTA too; the
         droplet alone still identifies the site. */
      @media (max-width: 600px) {
        .brand-word { display: none; }
        .brand-drop { height: 36px; }
      }

      /* One vertical rhythm for every heading-plus-content section.
         The ceiling is 64px, not the 100px this page used to carry, because a
         section is only doing its job if its heading and the thing it
         introduces land in the same view: on a 1080p laptop that is roughly
         850px, and a pricing heading block plus a full tier card has to clear
         it. Below ~1160px viewport width the clamp tightens further on its
         own, which is where the grids start stacking anyway. */
      :root { --sec-pad: clamp(44px, 5.5vw, 64px); --head-gap: 32px; }
      .sec { padding: var(--sec-pad) 5%; }
      /* Sections are now cross-route deep-link targets (/pricing#faq), and the
         navbar is fixed at 72px — without this the anchor lands underneath it.
         Matches the manual 96px offset #filtration has always used. */
      .sec { scroll-margin-top: 96px; }
      .sec-head { text-align: center; margin-bottom: var(--head-gap); }

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

      .products-grid { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent; }
      .products-grid::-webkit-scrollbar { height: 4px; }
      .products-grid::-webkit-scrollbar-track { background: transparent; }
      .products-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

      @media (max-width: 768px) {
        :root { --sec-pad: 40px; --head-gap: 26px; }
        .hero-grid { grid-template-columns: 1fr !important; }
        .about-grid { grid-template-columns: 1fr !important; }
        .products-grid { grid-template-columns: 1fr !important; }
        .pricing-grid { grid-template-columns: 1fr !important; }
        .contact-grid { grid-template-columns: 1fr !important; }
        .how-grid { grid-template-columns: 1fr 1fr !important; }
        .industries-grid { grid-template-columns: 1fr !important; }
        .footer-grid { grid-template-columns: 1fr !important; text-align: center; }
        .nav-links { display: none !important; }
        /* The brochure pill stays on mobile but drops to icon-only — it is the
           only CTA in the bar now, and the label is what costs the width. */
        .nav-brochure { padding: 11px !important; }
        .nav-brochure-label { display: none !important; }
        .hero-bottles { display: none !important; }
        .hero-bottle-single { display: flex !important; }
        .hero-h1 { font-size: clamp(36px,8vw,52px) !important; }
        .services-numbered { grid-template-columns: 1fr !important; }
        .testimonials-grid { grid-template-columns: 1fr !important; }
        .journey-row-grid { grid-template-columns: 1fr !important; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
}
