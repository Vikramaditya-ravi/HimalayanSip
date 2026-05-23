---
name: AquaVia
description: Premium Himalayan-sourced branded water for India's leading businesses
colors:
  abyssal-navy: "#04101f"
  navy-mid: "#081b35"
  navy-card: "#0b2244"
  glacial-melt: "#3ecfbf"
  glacial-melt-deep: "#1a8a80"
  durbar-gold: "#c8a44a"
  summit-white: "#f5faff"
  arctic-haze: "#7a9bb5"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(44px, 5.5vw, 76px)"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(30px, 4vw, 52px)"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(20px, 2.5vw, 28px)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.12em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "24px"
  pill: "50px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "60px"
  section: "100px"
components:
  button-primary:
    backgroundColor: "{colors.glacial-melt}"
    textColor: "{colors.abyssal-navy}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.glacial-melt-deep}"
    textColor: "{colors.abyssal-navy}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.glacial-melt}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  section-tag:
    backgroundColor: "transparent"
    textColor: "{colors.glacial-melt}"
    rounded: "{rounded.pill}"
    padding: "5px 16px"
  glass-card:
    backgroundColor: "{colors.navy-card}"
    textColor: "{colors.summit-white}"
    rounded: "{rounded.lg}"
    padding: "32px 28px"
  input-field:
    backgroundColor: "{colors.navy-card}"
    textColor: "{colors.summit-white}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
---

# Design System: AquaVia

## 1. Overview

**Creative North Star: "The Himalayan Vantage"**

AquaVia occupies the altitude where mountain-sourced purity meets corporate precision. The design system is built on a field of near-black navy — not because dark is fashionable, but because a procurement manager evaluating this product at a hotel front desk or a conference room side table is surrounded by artificial light, white tablecloths, and ambient clutter. The dark field cuts through. The teal accent reads like water light on stone. The gold says: this bottle has been placed on a 5-star table before.

This is not a wellness brand. It is not a SaaS product. It is not a consumer FMCG. It is an Indian B2B premium goods brand that happens to sell water — and the design should behave accordingly: confident, legible from a distance, warm enough to close a deal, cold enough to be believed.

The system rejects the catalog aesthetics of Indiamart, the startup-blue minimalism of SaaS landing pages, and the loud discount-banner energy of consumer retail. Every surface should read: "We have placed bottles in boardrooms. We will place them in yours."

**Key Characteristics:**
- Full-palette dark field with three tonal navy layers (abyssal, mid, card)
- Teal accent reserved for interaction and active state only — its scarcity is structural
- Durbar Gold as a premium signal: used twice per screen maximum
- Editorial serif (Cormorant Garamond) for structural elements; precision sans (DM Sans) for operational text
- Glass layer for floating UI; flat tonal steps for everything else
- Hover state as primary depth cue: lift, glow, and border brightening
- Scroll-reveal choreography on section entry; floating animation on hero bottles

## 2. Colors: The Himalayan Palette

Three navy depths form the surface stack. One teal accent marks every interactive element. One gold marks premium status signals.

### Primary
- **Glacial Melt** (`#3ecfbf` / `oklch(74% 0.13 185)`): The signature teal. Used on CTA buttons, active borders, scrollbar thumbs, icon highlights, focus rings, and hover glow sources. Never used as a large surface fill. Appears on 10–15% of any given screen; its rarity is the point.
- **Glacial Melt Deep** (`#1a8a80` / `oklch(52% 0.13 185)`): The dimmed form of the primary teal. Used on button hover backgrounds and gradient fills alongside Glacial Melt. Never used alone on interactive elements at rest.

### Secondary
- **Durbar Gold** (`#c8a44a` / `oklch(68% 0.10 75)`): The premium signal. Appears on the "Most Popular" badge, the hero sample-request bar, and gold-accented testimonial markers. Two placements per screen is the ceiling. Any more and it stops being premium.

### Neutral
- **Abyssal Navy** (`#04101f` / `oklch(9% 0.025 245)`): The deepest surface. Page background, hero sections, and the scrollbar track. The darkest point of the depth stack.
- **Navy Mid** (`#081b35` / `oklch(13% 0.03 245)`): The second layer. Alternating section backgrounds (About, How It Works, Industries, Testimonials) to create readable rhythm without adding color.
- **Navy Card** (`#0b2244` / `oklch(16% 0.04 245)`): The card surface. Product cards, form inputs, and any opaque panel that sits above a background. One step lighter than Navy Mid.
- **Glass Surface** (`rgba(255,255,255,0.04)` border `rgba(255,255,255,0.09)`): The translucent layer. Used exclusively for the glass-card component: service cards, step cards, the live customizer preview. Requires `backdrop-filter: blur(16px)`. Not valid as a general card style; reserved for surfaces where the blur depth reads as intentional.
- **Summit White** (`#f5faff` / `oklch(98% 0.005 245)`): Primary text on dark backgrounds. Not pure white; tinted slightly toward the navy hue so it reads as part of the same world, not pasted on top.
- **Arctic Haze** (`#7a9bb5` / `oklch(63% 0.04 220)`): Secondary text, metadata, placeholder text, muted labels. Sits between Navy Card and Summit White in perceived brightness. Never used for body text longer than two sentences.

### Named Rules
**The Cold Light Rule.** Glacial Melt is never a background fill for large surfaces. It exists on borders, button fills, focus rings, and glow sources. If a surface is predominantly teal, something has gone wrong.

**The Gold Ceiling Rule.** Durbar Gold appears in at most two distinct locations per screen. The badge, the bar, or the accent — never all three simultaneously.

**The Depth Stack Rule.** New surfaces can only step up the tonal stack (abyssal → mid → card → glass), never sideways to an unrelated color. Blue accent backgrounds, dark purple sections, and off-palette panels are prohibited.

## 3. Typography

**Display Font:** Cormorant Garamond (Georgia, serif fallback)
**Body Font:** DM Sans (system-ui, sans-serif fallback)

**Character:** Cormorant Garamond brings old-world editorial weight to a modern B2B product brand — it signals heritage, natural provenance, and confidence without fussiness. DM Sans provides operational precision: readable at small sizes, legible on dark backgrounds, unambiguous in forms and navigation. The pairing reads as "premium Indian business" rather than "tech startup" or "wellness brand."

Note: both families appear on common font reflex-reject lists. They are preserved here because they are the established brand identity, not new choices. Any future redesign should evaluate alternatives.

### Hierarchy
- **Display** (700 weight, `clamp(44px, 5.5vw, 76px)`, lh 1.1): Hero `<h1>` only. Single screen, primary product statement. Never appears in section bodies.
- **Headline** (700 weight, `clamp(30px, 4vw, 52px)`, lh 1.1): Section `<h2>` headings. One per section; sets the section's subject. Line-height 1.1 keeps multi-line headings tight without crowding.
- **Title** (600 weight, `clamp(20px, 2.5vw, 28px)`, lh 1.3): Product size labels (42px at featured scale), card headings, component titles. The 42px product size use is a deliberate typographic moment and exceeds the headline scale intentionally.
- **Body** (400 weight, 15–18px, lh 1.75): Section paragraphs and card descriptions. Line length capped at 65–75ch. On dark backgrounds, `line-height: 1.75` is required; lighter line-heights make DM Sans feel cramped against the dark field.
- **Label** (600 weight, 12px, `letter-spacing: 0.12em`, uppercase): Section tags (the pill labels above headings), metadata, status badges, and nav links. Always DM Sans, never Cormorant Garamond.

### Named Rules
**The Separation of Voices Rule.** Cormorant Garamond is structural: headings, size labels, product names, large numerics. DM Sans is operational: body text, buttons, nav, labels, form controls. They do not swap roles. A button set in Cormorant Garamond is a brand violation.

**The Floor Rule.** Cormorant Garamond is never used below 18px in any context. Below that size, the stroke contrast collapses and the letterforms look damaged against a dark field.

**The Stat Rule.** Hero metric numbers (500+, 2Cr+, 48hr) are always Cormorant Garamond 700 at 32px or larger with Glacial Melt as the color. The supporting label is DM Sans 13px Arctic Haze. This is the one place where a number-plus-label structure is permitted; it reads as editorial data, not SaaS metrics dashboard.

## 4. Elevation

AquaVia uses tonal layering as its primary depth system, not traditional box shadows. Three navy depths form the surface stack; surfaces are flat at rest and earn elevation through hover state.

The one exception is the bottle SVG, which carries a signature drop-shadow: `filter: drop-shadow(0 20px 40px rgba(62,207,191,0.3))`. This is a deliberate product moment — the teal glow beneath the bottle makes the product feel physically present. It is not a pattern to replicate on other elements.

### Shadow Vocabulary
- **Hover glow (cards):** `box-shadow: 0 24px 60px rgba(62,207,191,0.1)` — subtle teal ambient that lifts the card without hard edges. Activated on hover only.
- **Hover glow (product card):** `box-shadow: 0 32px 64px rgba(0,0,0,0.45), 0 0 50px rgba(62,207,191,0.12)` — deeper lift on bottle cards; the stronger opacity shadow compensates for the larger card mass.
- **Button glow (primary, rest):** `box-shadow: 0 4px 16px rgba(62,207,191,0.18)` — ambient; present at rest to signal interactivity.
- **Button glow (primary, hover):** `box-shadow: 0 8px 24px rgba(62,207,191,0.28)` — intensified on hover.
- **Bottle drop-shadow:** `filter: drop-shadow(0 20px 40px rgba(62,207,191,0.3))` — product-only, signature moment.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. The three navy tonal steps provide all the depth the system needs at rest. Shadows appear only as hover state feedback, never baked into a component's default appearance.

**The Glow Source Rule.** All glows use Glacial Melt (`rgba(62,207,191,...)`) as the light source. No purple glow, no white glow, no gold glow. The teal glow is the system's signature; other colors would read as off-brand or accidental.

## 5. Components

### Buttons
Generous pill shape; the physical product feel comes from the hover lift and glow response.

- **Shape:** Full pill (`border-radius: 50px`). No sharp corners, no subtle rounding. The pill reads as premium and distinct from generic card buttons.
- **Primary:** Glacial Melt fill (`linear-gradient(135deg, #3ecfbf, #1a8a80)`), Abyssal Navy text, `font-weight: 600`, `padding: 14px 32px`. The gradient is structural (adds depth to the fill) not decorative.
- **Primary Hover:** `translateY(-2px)`, glow intensifies to `0 8px 24px rgba(62,207,191,0.28)`. Transition: `cubic-bezier(0.22, 1, 0.36, 1)` at 0.3s.
- **Ghost:** Transparent background, `border: 1px solid rgba(62,207,191,0.4)`, Glacial Melt text. Hover adds `rgba(62,207,191,0.08)` background tint and `translateY(-2px)`.
- **Focus visible:** `outline: 2px solid #3ecfbf; outline-offset: 3px` — required on all button variants for WCAG AA.

### Section Tags (Label Chips)
The repeating uppercase pill labels above section headings.

- **Style:** Transparent background, `border: 1px solid rgba(62,207,191,0.3)`, Glacial Melt text at 12px, 0.12em letter-spacing, uppercase, `border-radius: 50px`, `padding: 5px 16px`.
- **Usage:** One per section, immediately above the `<h2>`. Never stacked or repeated. The label names the domain ("Our Range", "What We Offer"); the heading delivers the statement.

### Glass Cards
The translucent panel layer for services, steps, and feature breakouts.

- **Background:** `rgba(255,255,255,0.04)` with `backdrop-filter: blur(16px)`.
- **Border:** `1px solid rgba(255,255,255,0.09)` at rest; brightens to `rgba(62,207,191,0.3)` on hover.
- **Corner style:** Gently curved (20px radius).
- **Hover:** `translateY(-6px)`, border brightens, teal glow `0 24px 60px rgba(62,207,191,0.1)`. Transition `0.35s`.
- **Usage constraint:** Glass cards are for content that floats above the section background — service features, process steps, about-section highlights. Product cards and the FAQ accordion use opaque Navy Card surfaces instead. Never nest glass cards.

### Product Cards (Bottle Cards)
The signature card component; heavier interaction and tighter brand expression than glass cards.

- **Background:** Opaque Navy Card (`#0b2244`). No blur; the product should feel solid.
- **Border:** `1px solid var(--glass-border)` at rest. Featured card uses animated border glow (`rgba(62,207,191,0.4)` pulsing).
- **Corner style:** Extra curved (24px radius) to match the bottle silhouette.
- **Hover:** `translateY(-12px) scale(1.02)`, deep compound shadow (black + teal), bottle SVG scales `1.06x` and teal drop-shadow intensifies.
- **Featured badge:** Durbar Gold gradient pill, positioned absolutely at `top: -16px`, centered. One badge per grid; never two "Most Popular" signals.
- **Internal layout:** Bottle SVG first, then large Cormorant Garamond size label, then product name, then description, then pricing, then CTA button. This fixed order is not negotiable.

### Inputs and Form Fields
Used in the contact section and the customizer upload zone.

- **Background:** `rgba(11,34,68,0.6)` (semi-transparent Navy Card).
- **Border:** `1px solid rgba(255,255,255,0.09)` at rest.
- **Corner style:** Moderately curved (12px radius).
- **Focus:** Border shifts to Glacial Melt, `box-shadow: 0 0 0 3px rgba(62,207,191,0.15)`.
- **Placeholder text:** Arctic Haze. Never use Summit White for placeholder — it reads as pre-filled content.
- **Error state:** Not currently implemented. When added: border shifts to a warm red (`#e85d75`); do not use orange, which conflicts with the gold vocabulary.

### Navigation
Fixed top bar, transparent until scroll, then glass-frosted.

- **At rest:** Fully transparent background. No border.
- **Scrolled state:** `background: rgba(4,16,31,0.92)`, `backdrop-filter: blur(20px)`, `border-bottom: 1px solid rgba(255,255,255,0.09)`. Height remains 72px.
- **Nav links:** Arctic Haze at rest, Summit White on hover. DM Sans 14px 500 weight, no underline. Transition `color 0.2s`.
- **CTA button:** Glacial Melt pill, smaller than page CTAs (`padding: 10px 24px`, 14px font).
- **Mobile:** Nav links hidden below 768px. The CTA button remains visible. A hamburger menu is not yet implemented; when added it should use a full-screen panel, not a dropdown.

### Bottle SVG (Signature Component)
The custom-rendered water bottle is the product's visual centerpiece.

- **Render:** Inline SVG with gradient body (clear blue-white), colored water fill (product accent color), white label area, teal/gold/purple/blue cap depending on product.
- **Drop-shadow:** Teal glow via `filter: drop-shadow(0 20px 40px rgba(62,207,191,0.3))`.
- **Animation:** Three float keyframes (floatA, floatB, floatC) for hero trio; each at different offset and speed (3.5–4s) to prevent lockstep motion.
- **Hover response:** `scale(1.06)`, stronger teal drop-shadow. Transition at `cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.45s`.
- **Shimmer:** On bottle-card hover, a `skewX(-18deg)` semi-transparent white strip sweeps across the card face via the `shimmerSweep` keyframe.

## 6. Do's and Don'ts

### Do:
- **Do** use the three-step navy tonal stack (abyssal → mid → card) for all surface layering. New surfaces must step within this vocabulary.
- **Do** reserve Glacial Melt exclusively for interactive elements: CTA buttons, focus rings, active borders, hover glows, and the scroll indicator. The color's rarity is its power.
- **Do** use Cormorant Garamond for headings, size labels, and large numerics at 18px or above. Its editorial weight is the brand's typographic identity.
- **Do** apply hover lift (`translateY`) with `cubic-bezier(0.22, 1, 0.36, 1)` easing. The exponential ease-out makes interaction feel responsive and physical, not springy.
- **Do** limit Durbar Gold to two placements per screen. "Most Popular" badge and hero sample bar is the established ceiling.
- **Do** cap all body text at 65–75ch line length and set `line-height: 1.75` on dark backgrounds.
- **Do** respect `prefers-reduced-motion`: disable float animations, shimmer sweeps, and entrance choreography. State-change transitions (hover, focus) are permitted as they're user-initiated.
- **Do** provide `outline: 2px solid #3ecfbf; outline-offset: 3px` as the focus ring on all interactive elements for WCAG AA compliance.
- **Do** use glass cards only for content that floats above a section background. Opaque Navy Card surfaces are correct for product cards, FAQ items, and form inputs.

### Don't:
- **Don't** use the Indiamart catalog aesthetic: cluttered text-heavy layouts, table-bordered pricing grids, overcrowded feature lists, stock-photo-background headings. This is the perception AquaVia is explicitly differentiating from.
- **Don't** import generic SaaS blue into the palette (Intercom blue, Notion grey-blue, Linear purple-blue). The teal and navy are chosen; any addition must pass the same Himalayan-origin test.
- **Don't** use loud consumer retail signals: discount-banner yellow, bright red "SALE" tags, flashing urgency elements, pop-up overlays.
- **Don't** introduce health-food or wellness-brand greens (sage, olive, earthy forest green). These signal a completely different product category.
- **Don't** use gradient text (`background-clip: text` with a `background-image` gradient) on new elements. This pattern exists on the current hero's "Your Brand." and is a shipped constraint; do not extend it to new components. Use a single solid Summit White or Glacial Melt instead.
- **Don't** apply glass cards by default to every surface. Glass (`backdrop-filter: blur`) used everywhere is the glassmorphism-as-default anti-pattern. Reserve it for purposeful elevation moments.
- **Don't** add side-stripe borders (`border-left` or `border-right` greater than 1px as a colored accent) to cards, list items, or callouts.
- **Don't** use Cormorant Garamond below 18px. The stroke contrast collapses on dark backgrounds.
- **Don't** add a third typeface to the system. The Cormorant/DM Sans pairing is complete; a mono face or script would introduce noise.
- **Don't** stack multiple "Most Popular" badges or gold premium signals in a single viewport. The Durbar Gold ceiling of two placements is a hard limit.
- **Don't** animate CSS layout properties (width, height, padding, margin). Animate transform and opacity only.
