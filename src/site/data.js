// ─── Site identity ────────────────────────────────────────────────────────────
// One source of truth for the live origin. These used to be five hardcoded
// copies of the old preview host (himalayan-sip.vercel.app), which has since
// been torn down and 404s — so rel=canonical, og:url, og:image and the
// LocalBusiness `url` were all pointing search engines and social scrapers at a
// dead domain. Anything user-facing that needs an absolute URL derives it here.
export const SITE_URL = 'https://www.aquaviaworld.com'
export const OG_IMAGE = `${SITE_URL}/og-cover.jpg`

// ─── Data ─────────────────────────────────────────────────────────────────────
export const SERVICES = [
  { icon: '🎨', title: 'Custom Label Design', desc: 'Professional designers craft labels matching your brand identity, colors, and messaging perfectly.' },
  { icon: '📦', title: 'Bulk Corporate Orders', desc: 'Volume pricing that scales with your business. MOQ suited for companies of all sizes.' },
  { icon: '🎪', title: 'Event & Conference Branding', desc: 'Make a lasting impression at every corporate event or product launch with branded hydration.' },
  { icon: '🏨', title: 'Hotel & Restaurant Supply', desc: 'Elevate the guest experience with premium water that carries your brand\'s story.' },
  { icon: '🏢', title: 'Office & Enterprise', desc: 'Reinforce company culture daily with beautifully branded water on every desk.' },
  { icon: '🚚', title: 'Express Delivery', desc: 'Reliable pan-India delivery. Rush orders welcomed. Real-time shipment tracking.' },
]

export const STEPS = [
  { num: '01', title: 'Share Your Logo', desc: 'Upload your logo, colors, and design preferences through our simple online portal.' },
  { num: '02', title: 'Select & Specify', desc: 'Choose bottle size (250ml / 500ml / 1L), quantity, and label material type.' },
  { num: '03', title: 'Approve Design', desc: 'Receive a digital proof within 24 hours. Unlimited revisions until you\'re 100% satisfied.' },
  { num: '04', title: 'Get Delivery', desc: 'Your branded bottles arrive at your doorstep, packaged and ready to impress.' },
]

// The range is exactly the three sizes the corporate pricing brochure quotes.
// Prices are its Signature (entry) tier — what a first-time buyer actually pays.
//
// `size` is the caption; `sku` is what analytics groups by. They differ for the
// litre bottle on purpose — see PRODUCT_SKUS in analytics/catalog.ts.
export const PRODUCTS = [
  { size: '250ml', sku: '250ml', name: 'Petite', desc: 'Ideal for flights, meetings & premium gift hampers', price: '₹4.89/bottle', caseNote: '₹176 per case of 36', minOrder: '500 units', color: '#3ecfbf', featured: false },
  { size: '500ml', sku: '500ml', name: 'Classic', desc: 'Our most popular — perfect for offices & events', price: '₹5.67/bottle', caseNote: '₹136 per case of 24', minOrder: '250 units', color: '#c8a44a', featured: true },
  { size: '1 Litre', sku: '1L', name: 'Grande', desc: 'Ideal for gyms, hotels & extended stays', price: '₹8.33/bottle', caseNote: '₹100 per case of 12', minOrder: '150 units', color: '#5b8ff9', featured: false },
]

// ─── Corporate pricing programme (from the pricing brochure) ──────────────────
export const BROCHURE_URL = '/aquavia-pricing-brochure.pdf'

export const PACK_SIZES = ['1000 ML', '500 ML', '250 ML']

// Not assumed — these are implied by the brochure's own per-bottle figures, and
// hold for all nine cells (100/8.33 = 12, 136/5.67 = 24, 176/4.89 = 36).
export const CASE_SIZES = { '1000 ML': 12, '500 ML': 24, '250 ML': 36 }

export const PRICING_TIERS = [
  { num:'01', name:'Signature', segment:'Hotels & Luxury', dispatches:'1–10 dispatches / week', featured:false,
    prices:{ '1000 ML':100, '500 ML':136, '250 ML':176 } },
  { num:'02', name:'Preferred', segment:'Restaurants & Corporate', dispatches:'11–50 dispatches / week', featured:true,
    prices:{ '1000 ML':96, '500 ML':130, '250 ML':170 } },
  { num:'03', name:'Enterprise', segment:'Large Enterprises', dispatches:'51+ dispatches / week', featured:false,
    prices:{ '1000 ML':92, '500 ML':126, '250 ML':166 } },
]

export const PRICING_INCLUDES = ['Premium mineral water', 'Custom branding', 'High quality label printing', 'Corporate dispatch', 'Quality assurance']
export const PRICING_FOOTNOTE = 'GST and transportation charges are quoted separately where applicable.'

// Derived, never hard-coded a second time: one edit to a case price cannot leave
// a stale per-bottle figure sitting next to it.
export const perBottle = (casePrice, size) => (casePrice / CASE_SIZES[size]).toFixed(2)

export const INDUSTRIES = [
  { icon: '🏨', name: 'Hotels & Resorts' }, { icon: '🏥', name: 'Hospitals & Clinics' },
  { icon: '🏢', name: 'Corporate Offices' }, { icon: '🎪', name: 'Events & Weddings' },
  { icon: '🏗️', name: 'Real Estate' }, { icon: '💪', name: 'Gyms & Wellness' },
  { icon: '🍽️', name: 'Restaurants & Cafes' }, { icon: '✈️', name: 'Airlines & Travel' },
]

/**
 * The actual plant process behind the "7-Stage Filtration" claim.
 *
 * Ordered as the water flows, and indexed 1:1 with the seven bars IllusFiltration
 * draws (S1–S7) — adding a stage here without adding a bar there leaves the
 * illustration lying about the process.
 */
// Shared by the showcase pipeline and the step-03 illustration so a stage is the
// same colour wherever it appears — the two are cross-highlighted on hover, which
// only reads as "the same thing" if the colour agrees.
export const FILTRATION_COLORS = ['#3ecfbf','#5b8ff9','#7c4dff','#c8a44a','#7c4dff','#5b8ff9','#3ecfbf']

export const FILTRATION_STAGES = [
  { num:'01', name:'Back-Wash Sand Filter',
    purpose:'Removes large suspended particles — sand, dust, rust and mud.' },
  { num:'02', name:'Double Y-Strainer',
    purpose:'Two passes, 10–20 micron then 5 micron, clearing finer suspended solids before the sensitive filters.' },
  { num:'03', name:'CTO Carbon Block',
    purpose:'Chlorine, Taste & Odour. Removes chlorine, pesticides and organic chemicals.' },
  { num:'04', name:'Sediment Filter',
    purpose:'5 then 1 micron. Removes fine silt, rust and particulate matter, protecting the RO membrane downstream.' },
  { num:'05', name:'RO Membrane',
    purpose:'Reverse osmosis strips dissolved solids, heavy metals and microbiological contaminants.' },
  { num:'06', name:'Activated Carbon',
    purpose:'Adsorbs dissolved organic compounds — removes residual odour and colour, and improves taste.' },
  { num:'07', name:'Ozonation',
    purpose:'Ozone (O₃) is injected into the purified water, destroying bacteria, viruses and fungi and preventing microbial growth inside the sealed bottle.' },
]

export const JOURNEY_STEPS = [
  { num:'01', title:'The Ancient Source', color:'#3ecfbf',
    body:'Deep beneath the earth, ancient groundwater lies pristine and untouched — patient for centuries, waiting to become something extraordinary.' },
  { num:'02', title:'Precision Extraction', color:'#5b8ff9',
    body:'Our precision-engineered wells reach into protected aquifers, drawing water upward gently, without disturbance to the surrounding ecosystem.' },
  { num:'03', title:'7-Stage Filtration', color:'#7c4dff',
    body:'Every drop enters our fortress of purity — seven sequential stages stripping out sediment, bacteria, dissolved solids, and invisible contaminants.',
    stages: FILTRATION_STAGES },
  { num:'04', title:'Mineral Alchemy', color:'#c8a44a',
    body:'Stripped of impurities but not of life. Essential minerals — calcium, magnesium, potassium — are woven back in, perfectly balanced for the human body.' },
  { num:'05', title:'Custom Bottling', color:'#3ecfbf',
    body:"Your brand. Your label. Your identity. Each bottle is filled, sealed, and dressed in your livery — a product that's unmistakably yours." },
  { num:'06', title:'Cold-Chain Delivery', color:'#5b8ff9',
    body:"Temperature never rises above 4°C from the moment it's sealed. Our refrigerated fleet ensures every bottle arrives as cold as it was born." },
  { num:'07', title:'Your Water', color:'#c8a44a',
    body:'Cold. Crisp. Crafted for you. Not mass-produced. Not generic. Your water — made to your specification, delivered to your door.' },
]

export const TESTIMONIALS = [
  { name: 'Priya Sharma', title: 'Marketing Head, Nexus Realty', initials: 'PS', text: 'AquaVia transformed our site visits. Handing branded water to potential buyers elevated our brand perception instantly. Orders arrived ahead of schedule — flawless execution.', rating: 5 },
  { name: 'Arjun Mehta', title: 'Director of Operations, Transcend Hotels', initials: 'AM', text: 'As a luxury hotel group, presentation is everything. AquaVia bottles sit on every dining table. Guests always comment on them. Exceptional quality, beautiful labels, reliable supply.', rating: 5 },
  { name: 'Kiran Rao', title: 'COO, Summit Ventures', initials: 'KR', text: "We've branded our annual summit for 3 consecutive years with AquaVia. 800 attendees, branded bottles at every seat. The design team's attention to detail is genuinely unmatched.", rating: 5 },
]

export const FAQS = [
  { q: 'What is the minimum order quantity?', a: '500 units for 250ml, 250 units for 500ml, and 150 units for 1L bottles.' },
  { q: 'How is your pricing structured?', a: 'Pricing is per case across three partnership tiers set by weekly dispatch volume — Signature (1–10 / week), Preferred (11–50) and Enterprise (51+). A case is 12 × 1L, 24 × 500ml or 36 × 250ml. Rates start at ₹100 / ₹136 / ₹176 per case and fall with volume. GST and transportation are quoted separately.' },
  { q: 'Which areas do you currently serve?', a: 'We currently serve Delhi and Delhi NCR — including Gurugram, Noida, Faridabad, and Ghaziabad.' },
  { q: 'How long does production and delivery take?', a: 'Design proof in 24–48 hours. Production + delivery in 5–10 business days. Rush orders available.' },
  { q: 'What file format should I send my logo in?', a: 'We accept PNG, SVG, PDF, and AI files. Vector formats (SVG, AI) yield the sharpest print results.' },
  { q: 'Can I get a sample before placing a bulk order?', a: 'Absolutely — request a free sample bottle through our contact form.' },
  { q: 'What label materials do you offer?', a: 'BOPP (waterproof), matte paper, glossy paper, and premium metallic foil labels.' },
]

// ─── GEO_CONTENT ─────────────────────────────────────────────────────────────
export const DELHI_NCR_CITIES = new Set(['delhi', 'new delhi', 'gurugram', 'gurgaon', 'noida', 'faridabad', 'ghaziabad', 'greater noida'])

export const GEO_CONTENT = {
  'delhi-ncr': {
    heroSubheading: "Supplying premium branded bottled water to Delhi NCR's corporates, 5-star hotels, government offices, and large-scale events.",
    badge: '📍 Serving Delhi NCR',
    deliveryNote: 'Same-week delivery: Delhi · Gurugram · Noida · Faridabad · Ghaziabad',
    localTestimonial: {
      name: 'Amit Verma', title: 'Procurement Manager, Connaught Corp Delhi', initials: 'AV',
      text: "Our boardroom always has AquaVia branded bottles. The quality and precision of the labels is outstanding — delivered on time, every time.",
      rating: 5,
    },
    phone: '+91 76248 03460',
    whatsappMsg: "Hi! I'm in Delhi NCR and want to order custom branded water bottles.",
  },
  'default': {
    heroSubheading: 'Currently serving Delhi and Delhi NCR. Pan-India expansion coming soon — register your interest today.',
    badge: null,
    deliveryNote: 'Currently serving Delhi NCR. Expanding pan-India soon.',
    localTestimonial: null,
    phone: '+91 76248 03460',
    whatsappMsg: "Hi! I'm interested in customized water bottles for my business.",
  },
}

/**
 * Searchable content, assembled from the same consts the page renders.
 * Built from the existing data rather than a hand-written list, so a new bottle
 * size or FAQ becomes searchable without anyone remembering to update an index.
 */
export const SEARCH_INDEX = [
  ...PRODUCTS.map(p => ({
    id: `product-${p.size}`, sectionId: 'products', kind: 'Bottle size',
    title: `${p.size} — ${p.name}`, body: `${p.desc} ${p.price} ${p.minOrder}`,
  })),
  ...SERVICES.map(s => ({
    id: `service-${s.title}`, sectionId: 'services', kind: 'Service',
    title: s.title, body: s.desc,
  })),
  ...INDUSTRIES.map(i => ({
    id: `industry-${i.name}`, sectionId: 'industries', kind: 'Industry',
    title: i.name, body: `${i.name} branded water bottles supply`,
  })),
  ...FAQS.map(f => ({
    id: `faq-${f.q}`, sectionId: 'faq', kind: 'FAQ', title: f.q, body: f.a,
  })),
  ...JOURNEY_STEPS.map(j => ({
    id: `journey-${j.num}`, sectionId: 'journey', kind: 'Our process',
    title: j.title, body: j.body,
  })),
  // A buyer evaluating water quality searches "RO membrane" or "ozonation", not
  // "filtration" — the stage names are the terms worth being findable on.
  ...FILTRATION_STAGES.map(s => ({
    id: `filtration-${s.num}`, sectionId: 'journey', kind: 'Filtration stage',
    title: `${s.num} — ${s.name}`, body: s.purpose,
  })),
  ...FILTRATION_STAGES.map(s => ({
    id: `filtration-${s.num}`, sectionId: 'journey', kind: 'Filtration stage',
    title: s.name, body: s.purpose,
  })),
  { id: 'customizer', sectionId: 'customizer', kind: 'Tool', title: 'Design your bottle live',
    body: 'customizer preview logo upload label colour color mockup' },
  ...PRICING_TIERS.map(t => ({
    id: `tier-${t.name}`, sectionId: 'pricing', kind: 'Pricing tier',
    title: `${t.name} — ${t.segment}`,
    body: `${t.dispatches} price per case ${PACK_SIZES.map(s => `${s} ₹${t.prices[s]}`).join(' ')}`,
  })),
  { id: 'brochure', sectionId: 'pricing', kind: 'Download', title: 'Pricing brochure (PDF)',
    body: 'price list rate card pdf download tiers per case gst transportation' },
  { id: 'contact', sectionId: 'contact', kind: 'Page', title: 'Get a quote',
    body: 'contact enquiry quote sample pricing order delivery brochure rate card' },
]

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
// Split by route rather than shipped as one block on every page. The business
// node is the site's identity and belongs everywhere; the Product and FAQPage
// nodes describe specific pages and are attached only to those, so a crawler is
// never told that the About page is also an offer.
export const BUSINESS_SCHEMA = {
  // Service-area business, not a storefront: we deliver across Delhi NCR and
  // have no address customers visit. `areaServed` carries the geography and
  // the PostalAddress is region-level only, so no fake streetAddress is
  // asserted. The @id makes this the canonical entity node that the Product
  // block below points its `seller` at.
  '@context': 'https://schema.org', '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#business`,
  name: 'AquaVia',
  description: 'Premium customized branded bottled water solutions for businesses in Delhi NCR',
  url: `${SITE_URL}/`,
  image: OG_IMAGE,
  logo: `${SITE_URL}/aquavia-logo.png`,
  telephone: '+91-76248-03460', email: 'info@aquaviaworld.com',
  priceRange: '₹₹', currenciesAccepted: 'INR', paymentAccepted: 'Cash, Credit Card, UPI, Bank Transfer',
  areaServed: { '@type': 'City', name: 'Delhi NCR' },
  address: { '@type': 'PostalAddress', addressLocality: 'New Delhi', addressRegion: 'Delhi', postalCode: '110001', addressCountry: 'IN' },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' }],
  sameAs: ['https://www.instagram.com/aquavia.official?igsh=eHVmM3F3MnI2OTl0','https://www.linkedin.com/company/aquavia'],
}

export const PRODUCT_SCHEMA = {
  '@context': 'https://schema.org', '@type': 'Product',
  '@id': `${SITE_URL}/#product`,
  name: 'Custom Branded Water Bottles',
  description: 'Personalized bottled water with your company logo, sold by the case across three corporate pricing tiers. Available in 250ml, 500ml, and 1L sizes.',
  brand: { '@type': 'Brand', name: 'AquaVia' },
  image: OG_IMAGE,
  // One offer per size we actually sell, priced from the brochure.
  // lowPrice/highPrice must bracket the enumerated offers exactly — lowPrice
  // was 4.61, a volume-tier rate that appears in no offer below, and Google
  // invalidates the whole AggregateOffer when the bounds disagree.
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'INR', lowPrice: '4.89', highPrice: '8.33', offerCount: 3,
    availability: 'https://schema.org/InStock',
    offers: [
      { '@type': 'Offer', name: '250ml Custom Bottle', price: '4.89', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: '500ml Custom Bottle', price: '5.67', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: '1L Custom Bottle',    price: '8.33', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
    ],
    seller: { '@id': `${SITE_URL}/#business` },
  },
}

export const FAQ_SCHEMA = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the minimum order quantity for custom water bottles?', acceptedAnswer: { '@type': 'Answer', text: 'Minimum order is 500 units for 250ml, 250 units for 500ml, and 150 units for 1L bottles.' } },
    { '@type': 'Question', name: 'How is your pricing structured?', acceptedAnswer: { '@type': 'Answer', text: 'Pricing is per case across three partnership tiers based on weekly dispatch volume: Signature (1–10 dispatches/week), Preferred (11–50) and Enterprise (51+). A case is 12 × 1L, 24 × 500ml or 36 × 250ml. Rates start at ₹100, ₹136 and ₹176 per case respectively and fall with volume. GST and transportation are quoted separately.' } },
    { '@type': 'Question', name: 'Which areas do you currently serve?', acceptedAnswer: { '@type': 'Answer', text: 'We currently serve Delhi and Delhi NCR including Gurugram, Noida, Faridabad and Ghaziabad.' } },
    { '@type': 'Question', name: 'How long does production and delivery take?', acceptedAnswer: { '@type': 'Answer', text: 'Design proof in 24–48 hours. Production + delivery in 5–10 business days.' } },
    { '@type': 'Question', name: 'Can I get a sample bottle before placing a bulk order?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, we offer sample bottles so you can verify quality and design before committing to a bulk order.' } },
  ],
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────
/**
 * The route table, and the JS source of truth for every page's head.
 *
 * Indexed metadata is deliberately NOT geo-dependent.
 *
 * It used to be read off GEO_CONTENT, which is selected from an ipapi.co lookup
 * of the visitor's IP. Googlebot crawls predominantly from US addresses, so it
 * always resolved to the 'default' branch — meaning the Delhi-NCR-targeted
 * titles, descriptions and keywords below were the one variant search engines
 * could never see.
 *
 * Delhi NCR is also the only market actually served, so there is no second
 * region for these to vary across. GEO_CONTENT still personalises the visible
 * hero copy; the head is fixed.
 *
 * CRITICAL: every field here is duplicated as a static tag in the matching
 * root-level HTML file, and the two must stay byte-identical. See the comment
 * at the top of index.html for why that duplication exists.
 */
export const ROUTES = {
  home: {
    path: '/',
    title: 'Custom Branded Water Bottles Delhi NCR | AquaVia',
    description: 'Premium customized water bottles with your logo for Delhi NCR businesses. Serving Connaught Place, Gurugram, Noida, Greater Noida. Bulk orders available.',
    keywords: 'custom water bottles Delhi, branded water bottles Delhi NCR, corporate water bottle Gurugram, bulk water bottle Noida',
    schema: [BUSINESS_SCHEMA],
  },
  products: {
    path: '/products',
    title: 'Custom Water Bottle Sizes & MOQs — 250ml, 500ml, 1L | AquaVia',
    description: 'Branded water bottles in 250ml, 500ml and 1 litre. Minimum orders from 150 units. Upload your logo and preview your label before you order.',
    keywords: 'custom water bottle sizes, 250ml branded bottle, 500ml corporate water bottle, 1 litre custom bottle, water bottle MOQ',
    schema: [BUSINESS_SCHEMA, PRODUCT_SCHEMA],
  },
  pricing: {
    path: '/pricing',
    title: 'Bulk Water Bottle Pricing & Corporate Tiers | AquaVia',
    description: 'Per-case rates across three partnership tiers from ₹100 per case. Download the full rate card. GST and transportation quoted separately.',
    keywords: 'bulk water bottle price, corporate water bottle pricing Delhi, branded water rate card, water bottle price per case',
    schema: [BUSINESS_SCHEMA, FAQ_SCHEMA],
  },
  process: {
    path: '/process',
    title: 'How We Make It — 7-Stage Filtration & Delivery | AquaVia',
    description: 'Seven-stage filtration, mineral balancing, bottling and Delhi NCR dispatch in 5–10 business days.',
    keywords: '7 stage filtration water, RO membrane ozonation, packaged drinking water process, cold chain water delivery Delhi',
    schema: [BUSINESS_SCHEMA],
  },
  about: {
    path: '/about',
    title: 'About AquaVia — Branded Bottled Water, Delhi NCR',
    description: 'Who we are, and why businesses across Delhi, Gurugram and Noida put their logo on our bottles.',
    keywords: 'about AquaVia, branded water company Delhi, private label water supplier NCR',
    schema: [BUSINESS_SCHEMA],
  },
  contact: {
    path: '/contact',
    title: 'Contact AquaVia — Get a Bulk Water Bottle Quote',
    description: 'WhatsApp, call or email the sales desk. Send your logo and quantity, get a quote back the same day. Serving Delhi NCR.',
    keywords: 'contact AquaVia, custom water bottle quote Delhi, bulk water bottle enquiry, branded water sample',
    schema: [BUSINESS_SCHEMA],
  },
}

/**
 * The dedicated route for each section anchor.
 *
 * SiteSearch indexes by sectionId and predates routing, so this is what turns a
 * result into a destination: same page and it scrolls, different page and it
 * navigates to `${path}#${sectionId}`.
 *
 * Note these are the *dedicated* routes, not the only place a section renders.
 * Home carries all twelve, so a search hit from / never needs this table — see
 * the home check in Navbar's navigate().
 */
export const SECTION_ROUTES = {
  hero: '/',
  services: '/',
  industries: '/',
  testimonials: '/',
  products: '/products',
  customizer: '/products',
  pricing: '/pricing',
  faq: '/pricing',
  how: '/process',
  journey: '/process',
  about: '/about',
  contact: '/contact',
}

/**
 * The current route, normalised.
 *
 * Production serves /products out of products.html via a rewrite, but the
 * underlying /products.html is still reachable and `vite preview` serves those
 * paths directly. Both spellings have to resolve to one route or the active nav
 * state and the same-page check in SiteSearch silently disagree with each other.
 */
export function currentPath() {
  if (typeof window === 'undefined') return '/'
  const path = window.location.pathname.replace(/\.html$/, '')
  return path === '' || path === '/index' ? '/' : path
}

/**
 * The nav bar, in order.
 *
 * Home leads. The logo has always pointed at / and still does, but that is a
 * convention people have to know rather than a labelled destination — and it is
 * the one route with no link of its own in the bar.
 */
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/process', label: 'Process' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]
