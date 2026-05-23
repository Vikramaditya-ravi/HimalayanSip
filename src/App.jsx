import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// ─── Global Style Injection ───────────────────────────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

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
      @keyframes shimText { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
      @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
      @keyframes waBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

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

      .form-input {
        width: 100%;
        background: rgba(11,34,68,0.6);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 14px 18px;
        color: var(--white);
        font-family: 'DM Sans', sans-serif;
        font-size: 15px;
        outline: none;
        transition: border-color 0.3s, box-shadow 0.3s;
      }
      .form-input:focus {
        border-color: var(--aqua);
        box-shadow: 0 0 0 3px rgba(62,207,191,0.15);
      }
      .form-input::placeholder { color: var(--muted); }
      .form-input option { background: var(--navy-card); color: var(--white); }

      .service-card:hover { transform:translateY(-6px); border-color:rgba(62,207,191,0.3); box-shadow:0 24px 60px rgba(62,207,191,0.1); }
      .step-card:hover .step-num { background: var(--aqua); color: var(--navy); }
      .industry-chip:hover { border-color:var(--aqua) !important; background:rgba(62,207,191,0.08) !important; transform:translateX(4px); }
      .bottle-card:hover { transform:translateY(-8px); }
      .bottle-card { transition: transform 0.35s; }

      @media (max-width: 768px) {
        .hero-grid { grid-template-columns: 1fr !important; }
        .about-grid { grid-template-columns: 1fr !important; }
        .products-grid { grid-template-columns: 1fr !important; }
        .contact-grid { grid-template-columns: 1fr !important; }
        .how-grid { grid-template-columns: 1fr 1fr !important; }
        .industries-grid { grid-template-columns: 1fr !important; }
        .footer-grid { grid-template-columns: 1fr !important; text-align: center; }
        .nav-links { display: none !important; }
        .hero-bottles { display: none !important; }
        .hero-bottle-single { display: flex !important; }
        .hero-h1 { font-size: clamp(36px,8vw,52px) !important; }
        .services-grid { grid-template-columns: 1fr !important; }
        .testimonials-grid { grid-template-columns: 1fr !important; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
}

// ─── Custom Hook: useReveal ───────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}

// ─── useSEO ───────────────────────────────────────────────────────────────────
function useSEO({ title, description, keywords, canonical, schema }) {
  useEffect(() => {
    document.title = title
    const setMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    setMeta('name', 'description', description)
    setMeta('name', 'keywords', keywords)
    setMeta('name', 'robots', 'index, follow')
    setMeta('name', 'author', 'AquaVia')
    setMeta('name', 'theme-color', '#04101f')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:image', 'https://himalayan-sip.vercel.app/og-cover.jpg')
    setMeta('property', 'og:site_name', 'AquaVia')
    setMeta('property', 'og:locale', 'en_IN')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', 'https://himalayan-sip.vercel.app/og-cover.jpg')
    setMeta('name', 'twitter:site', '@AquaVia')
    let link = document.querySelector("link[rel='canonical']")
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link) }
    link.setAttribute('href', canonical)
    if (schema) {
      let el = document.getElementById('hs-schema')
      if (!el) { el = document.createElement('script'); el.id = 'hs-schema'; el.type = 'application/ld+json'; document.head.appendChild(el) }
      el.textContent = JSON.stringify(schema)
    }
  }, [title, description, keywords, canonical])
}

// ─── useGeoTarget ─────────────────────────────────────────────────────────────
function useGeoTarget() {
  const [geoData, setGeoData] = useState({ city: null, region: null, country: null, detected: false, loading: true })
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setGeoData({ city: d.city, region: d.region, country: d.country_name, countryCode: d.country_code, detected: true, loading: false }))
      .catch(() => setGeoData({ city: null, region: null, country: 'India', detected: false, loading: false }))
  }, [])
  return geoData
}

// ─── GEO_CONTENT ─────────────────────────────────────────────────────────────
const DELHI_NCR_CITIES = new Set(['delhi', 'new delhi', 'gurugram', 'gurgaon', 'noida', 'faridabad', 'ghaziabad', 'greater noida'])

const GEO_CONTENT = {
  'delhi-ncr': {
    heroSubheading: "Supplying premium branded bottled water to Delhi NCR's corporates, 5-star hotels, government offices, and large-scale events.",
    badge: '📍 Serving Delhi NCR',
    deliveryNote: 'Same-week delivery: Delhi · Gurugram · Noida · Faridabad · Ghaziabad',
    localTestimonial: {
      name: 'Amit Verma', title: 'Procurement Manager, Connaught Corp Delhi', initials: 'AV',
      text: "Our boardroom always has AquaVia branded bottles. The quality and precision of the labels is outstanding — delivered on time, every time.",
      rating: 5,
    },
    phone: '+91 76671 23460',
    whatsappMsg: "Hi! I'm in Delhi NCR and want to order custom branded water bottles.",
    seoTitle: 'Custom Branded Water Bottles Delhi NCR | AquaVia',
    seoDescription: 'Premium customized water bottles with your logo for Delhi NCR businesses. Serving Connaught Place, Gurugram, Noida, Greater Noida. Bulk orders available.',
    seoKeywords: 'custom water bottles Delhi, branded water bottles Delhi NCR, corporate water bottle Gurugram, bulk water bottle Noida',
  },
  'default': {
    heroSubheading: 'Currently serving Delhi and Delhi NCR. Pan-India expansion coming soon — register your interest today.',
    badge: null,
    deliveryNote: 'Currently serving Delhi NCR. Expanding pan-India soon.',
    localTestimonial: null,
    phone: '+91 76671 23460',
    whatsappMsg: "Hi! I'm interested in customized water bottles for my business.",
    seoTitle: 'AquaVia — Customized Branded Water Bottles | Delhi NCR',
    seoDescription: 'AquaVia provides premium customized bottled water with your company logo. Serving Delhi NCR — corporate offices, hotels, events, hospitals.',
    seoKeywords: 'custom branded water bottles Delhi, personalized water bottles business India, bulk water bottle orders Delhi NCR',
  },
}

function useGeoContent(geo) {
  return useMemo(() => {
    if (!geo.detected || !geo.city) return GEO_CONTENT['default']
    const key = geo.city.toLowerCase()
    return DELHI_NCR_CITIES.has(key) ? GEO_CONTENT['delhi-ncr'] : GEO_CONTENT['default']
  }, [geo.detected, geo.city])
}

// ─── useLazySection ───────────────────────────────────────────────────────────
function useLazySection() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { rootMargin: '200px' })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
const HS_SCHEMA = [
  {
    '@context': 'https://schema.org', '@type': 'LocalBusiness',
    name: 'AquaVia',
    description: 'Premium customized branded bottled water solutions for businesses in Delhi NCR',
    url: 'https://himalayan-sip.vercel.app',
    telephone: '+91-76671-23460', email: 'ravi.prakash4104@gmail.com',
    priceRange: '₹₹', currenciesAccepted: 'INR', paymentAccepted: 'Cash, Credit Card, UPI, Bank Transfer',
    areaServed: { '@type': 'City', name: 'Delhi NCR' },
    address: { '@type': 'PostalAddress', addressLocality: 'New Delhi', addressRegion: 'Delhi', postalCode: '110001', addressCountry: 'IN' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' }],
    sameAs: ['https://www.instagram.com/aquavia.official?igsh=eHVmM3F3MnI2OTl0','https://www.linkedin.com/company/aquavia'],
  },
  {
    '@context': 'https://schema.org', '@type': 'Product',
    name: 'Custom Branded Water Bottles',
    description: 'Personalized bottled water with your company logo. Available in 250ml, 500ml, and 1L sizes.',
    brand: { '@type': 'Brand', name: 'AquaVia' },
    offers: [
      { '@type': 'Offer', name: '250ml Custom Bottle', price: '12', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: '500ml Custom Bottle', price: '18', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
      { '@type': 'Offer', name: '1L Custom Bottle',   price: '28', priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is the minimum order quantity for custom water bottles?', acceptedAnswer: { '@type': 'Answer', text: 'Minimum order is 150 units for 1L bottles, 250 units for 500ml, and 500 units for 250ml bottles.' } },
      { '@type': 'Question', name: 'Which areas do you currently serve?', acceptedAnswer: { '@type': 'Answer', text: 'We currently serve Delhi and Delhi NCR including Gurugram, Noida, Faridabad and Ghaziabad.' } },
      { '@type': 'Question', name: 'How long does production and delivery take?', acceptedAnswer: { '@type': 'Answer', text: 'Design proof in 24–48 hours. Production + delivery in 5–10 business days.' } },
      { '@type': 'Question', name: 'Can I get a sample bottle before placing a bulk order?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, we offer sample bottles so you can verify quality and design before committing to a bulk order.' } },
    ],
  },
]

// ─── FAQSection ───────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'What is the minimum order quantity?', a: '150 units for 1L, 250 units for 500ml, and 500 units for 250ml bottles.' },
  { q: 'Which areas do you currently serve?', a: 'We currently serve Delhi and Delhi NCR — including Gurugram, Noida, Faridabad, and Ghaziabad.' },
  { q: 'How long does production and delivery take?', a: 'Design proof in 24–48 hours. Production + delivery in 5–10 business days. Rush orders available.' },
  { q: 'What file format should I send my logo in?', a: 'We accept PNG, SVG, PDF, and AI files. Vector formats (SVG, AI) yield the sharpest print results.' },
  { q: 'Can I get a sample before placing a bulk order?', a: 'Absolutely — request a free sample bottle through our contact form.' },
  { q: 'What label materials do you offer?', a: 'BOPP (waterproof), matte paper, glossy paper, and premium metallic foil labels.' },
]

function FAQSection() {
  const [open, setOpen] = useState(null)
  const ref = useReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="faq" style={{ padding:'100px 5%', background:'var(--navy)' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        <div ref={ref} className="reveal" style={{ textAlign:'center', marginBottom:60 }}>
          <SectionTag>FAQ</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Frequently Asked Questions
          </h2>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {FAQS.map((item, i) => (
            <div key={i} className="glass-card" style={{ overflow:'hidden', cursor:'pointer' }} onClick={() => setOpen(open===i ? null : i)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px' }}>
                <span style={{ fontWeight:600, fontSize:16, color:'var(--white)', paddingRight:16 }}>{item.q}</span>
                <span style={{ fontSize:22, color:'var(--aqua)', flexShrink:0, transition:'transform 0.3s', transform: open===i ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>
              <div style={{ maxHeight: open===i ? 200 : 0, overflow:'hidden', transition:'max-height 0.4s ease' }}>
                <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:15, padding:'0 24px 20px' }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:40 }}>
          <button onClick={() => scrollTo('contact')} style={{
            background:'transparent', border:'1px solid rgba(62,207,191,0.4)', borderRadius:50,
            padding:'12px 28px', color:'var(--aqua)', fontFamily:'DM Sans, sans-serif',
            fontSize:15, fontWeight:500, cursor:'pointer',
          }}>Have more questions? Contact us →</button>
        </div>
      </div>
    </section>
  )
}

// ─── SVG Components ───────────────────────────────────────────────────────────
function BottleSVG({ logo, color = '#3ecfbf', label = '500ml', size = 200, animationClass = '' }) {
  const id = `grad-${color.replace('#', '')}-${size}`
  const waterColor = color + 'aa'
  return (
    <svg
      viewBox="0 0 110 260"
      width={size * 0.42}
      height={size}
      style={{ filter: 'drop-shadow(0 20px 40px rgba(62,207,191,0.3))', animation: animationClass, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0f0f8" />
          <stop offset="100%" stopColor="#a8dce8" />
        </linearGradient>
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
        <clipPath id={`body-clip-${id}`}>
          <rect x="18" y="50" width="74" height="194" rx="10" />
        </clipPath>
      </defs>

      {/* Cap */}
      <rect x="36" y="6" width="38" height="22" rx="6" fill={`url(#cap-${id})`} />
      <rect x="38" y="8" width="20" height="6" rx="3" fill="white" fillOpacity="0.3" />

      {/* Neck */}
      <path d="M36 26 L28 50 L82 50 L74 26 Z" fill={color} fillOpacity="0.5" />

      {/* Body */}
      <rect x="18" y="50" width="74" height="194" rx="10" fill={`url(#body-${id})`} />

      {/* Water fill */}
      <g clipPath={`url(#body-clip-${id})`}>
        <rect x="18" y="145" width="74" height="99" fill={`url(#water-${id})`} />
        {/* Wave */}
        <path d="M18 148 Q37 138 55 148 Q73 158 92 148 L92 160 Q73 170 55 160 Q37 150 18 160 Z" fill={color} fillOpacity="0.4" />
      </g>

      {/* Label area background */}
      <rect x="24" y="74" width="62" height="100" rx="6" fill="white" />

      {/* Label top strip */}
      <rect x="24" y="74" width="62" height="22" rx="6" fill={color} />
      <rect x="24" y="84" width="62" height="12" fill={color} />
      <text x="55" y="89" textAnchor="middle" fill="white" fontSize="8" fontFamily="serif" fontWeight="bold" letterSpacing="1">HIMALAYAN</text>

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
      <text x="55" y="170" textAnchor="middle" fill="white" fontSize="6" fontFamily="DM Sans, sans-serif">{label} · purified water</text>

      {/* Shine overlay */}
      <rect x="18" y="50" width="20" height="194" rx="10" fill={`url(#shine-${id})`} />
    </svg>
  )
}

function MountainBg() {
  return (
    <svg viewBox="0 0 1440 300" width="100%" height="300"
      style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.12, pointerEvents: 'none' }}
      preserveAspectRatio="none">
      <defs>
        <linearGradient id="mtn-grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mtn-grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mtn-grad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 300 L200 120 L400 220 L600 60 L800 180 L1000 40 L1200 160 L1440 80 L1440 300 Z" fill="url(#mtn-grad1)" />
      <path d="M0 300 L300 160 L500 240 L700 100 L900 200 L1100 80 L1300 190 L1440 120 L1440 300 Z" fill="url(#mtn-grad2)" />
      <path d="M0 300 L150 200 L350 260 L550 150 L750 230 L950 130 L1150 220 L1350 160 L1440 200 L1440 300 Z" fill="url(#mtn-grad3)" />
    </svg>
  )
}

function MoonMountainIllustration() {
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

// ─── Reusable UI ─────────────────────────────────────────────────────────────
function SectionTag({ children }) {
  return (
    <div style={{
      display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
      borderRadius: 50, padding: '5px 16px', marginBottom: 16
    }}>{children}</div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: '🎨', title: 'Custom Label Design', desc: 'Professional designers craft labels matching your brand identity, colors, and messaging perfectly.' },
  { icon: '📦', title: 'Bulk Corporate Orders', desc: 'Volume pricing that scales with your business. MOQ suited for companies of all sizes.' },
  { icon: '🎪', title: 'Event & Conference Branding', desc: 'Make a lasting impression at every corporate event or product launch with branded hydration.' },
  { icon: '🏨', title: 'Hotel & Restaurant Supply', desc: 'Elevate the guest experience with premium water that carries your brand\'s story.' },
  { icon: '🏢', title: 'Office & Enterprise', desc: 'Reinforce company culture daily with beautifully branded water on every desk.' },
  { icon: '🚚', title: 'Express Delivery', desc: 'Reliable pan-India delivery. Rush orders welcomed. Real-time shipment tracking.' },
]

const STEPS = [
  { num: '01', title: 'Share Your Logo', desc: 'Upload your logo, colors, and design preferences through our simple online portal.' },
  { num: '02', title: 'Select & Specify', desc: 'Choose bottle size (250ml / 500ml / 1L), quantity, and label material type.' },
  { num: '03', title: 'Approve Design', desc: 'Receive a digital proof within 24 hours. Unlimited revisions until you\'re 100% satisfied.' },
  { num: '04', title: 'Get Delivery', desc: 'Your branded bottles arrive at your doorstep, packaged and ready to impress.' },
]

const PRODUCTS = [
  { size: '250ml', name: 'Petite', desc: 'Ideal for flights, meetings & premium gift hampers', price: '₹12/bottle', minOrder: '500 units', color: '#3ecfbf', featured: false },
  { size: '500ml', name: 'Classic', desc: 'Our most popular — perfect for offices & events', price: '₹18/bottle', minOrder: '250 units', color: '#c8a44a', featured: true },
  { size: '1 Litre', name: 'Grande', desc: 'Ideal for gyms, hotels & extended stays', price: '₹28/bottle', minOrder: '150 units', color: '#5b8ff9', featured: false },
]

const INDUSTRIES = [
  { icon: '🏨', name: 'Hotels & Resorts' }, { icon: '🏥', name: 'Hospitals & Clinics' },
  { icon: '🏢', name: 'Corporate Offices' }, { icon: '🎪', name: 'Events & Weddings' },
  { icon: '🏗️', name: 'Real Estate' }, { icon: '💪', name: 'Gyms & Wellness' },
  { icon: '🍽️', name: 'Restaurants & Cafes' }, { icon: '✈️', name: 'Airlines & Travel' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', title: 'Marketing Head, Nexus Realty', initials: 'PS', text: 'AquaVia transformed our site visits. Handing branded water to potential buyers elevated our brand perception instantly. Orders arrived ahead of schedule — flawless execution.', rating: 5 },
  { name: 'Arjun Mehta', title: 'Director of Operations, Transcend Hotels', initials: 'AM', text: 'As a luxury hotel group, presentation is everything. AquaVia bottles sit on every dining table. Guests always comment on them. Exceptional quality, beautiful labels, reliable supply.', rating: 5 },
  { name: 'Kiran Rao', title: 'COO, Summit Ventures', initials: 'KR', text: "We've branded our annual summit for 3 consecutive years with AquaVia. 800 attendees, branded bottles at every seat. The design team's attention to detail is genuinely unmatched.", rating: 5 },
]

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav className={scrolled ? 'nav-scrolled' : ''} style={{
      position: 'fixed', top: 0, width: '100%', zIndex: 1000, height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5%', transition: 'all 0.4s ease', background: 'transparent'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="drop-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3ecfbf" />
              <stop offset="100%" stopColor="#1a8a80" />
            </linearGradient>
          </defs>
          <path d="M16 4 Q24 14 24 20 A8 8 0 0 1 8 20 Q8 14 16 4Z" fill="url(#drop-g)" />
          <ellipse cx="13" cy="18" rx="2.5" ry="4" fill="white" fillOpacity="0.3" />
        </svg>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: 'var(--white)' }}>
          Aqua<span style={{ color: 'var(--aqua)' }}>Via</span>
        </span>
      </div>

      {/* Nav links */}
      <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {['about','services','products','industries','customizer','contact'].map(id => (
          <button key={id} onClick={() => scrollTo(id)} style={{
            background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14,
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500, cursor: 'pointer',
            textTransform: 'capitalize', transition: 'color 0.2s',
            padding: '4px 0'
          }}
            onMouseEnter={e => e.target.style.color = 'var(--white)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >{id}</button>
        ))}
      </div>

      {/* CTA */}
      <button onClick={() => scrollTo('contact')} style={{
        background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
        border: 'none', borderRadius: 50, padding: '10px 24px',
        color: 'var(--navy)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
        fontSize: 14, cursor: 'pointer', transition: 'all 0.3s',
        boxShadow: '0 4px 20px rgba(62,207,191,0.3)'
      }}
        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(62,207,191,0.4)' }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(62,207,191,0.3)' }}
      >Get a Quote</button>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ geo, content }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#3ecfbf', display:'inline-block', boxShadow:'0 0 8px #3ecfbf' }} />
              <span style={{ fontSize:13, color:'var(--aqua)', fontWeight:500 }}>{content.badge}</span>
            </div>
          )}
          <SectionTag>Premium B2B Water Branding</SectionTag>
          <h1 className="hero-h1" id="main-heading" style={{
            fontFamily:'Cormorant Garamond, serif', fontWeight:700,
            fontSize:'clamp(44px, 5.5vw, 76px)', lineHeight:1.1, color:'var(--white)',
            marginBottom:24
          }}>
            Pure Water.<br />
            <span style={{
              background:'linear-gradient(270deg, #3ecfbf, #f5faff, #c8a44a, #3ecfbf)',
              backgroundSize:'300%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text', animation:'shimText 4s ease infinite'
            }}>Your Brand.</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:18, lineHeight:1.75, maxWidth:480, marginBottom:36 }}>
            {content?.heroSubheading || 'Premium Himalayan water, bottled with your logo. Trusted by 500+ brands for corporate events, hotels, offices, and more.'}
          </p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:48 }}>
            <button onClick={() => scrollTo('customizer')} style={{
              background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))', border:'none',
              borderRadius:50, padding:'14px 32px', color:'var(--navy)', fontFamily:'DM Sans, sans-serif',
              fontWeight:600, fontSize:15, cursor:'pointer', transition:'all 0.3s',
              boxShadow:'0 8px 30px rgba(62,207,191,0.3)'
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >Design Your Bottle →</button>
            <button onClick={() => scrollTo('products')} style={{
              background:'transparent', border:'1px solid rgba(62,207,191,0.4)',
              borderRadius:50, padding:'14px 32px', color:'var(--aqua)', fontFamily:'DM Sans, sans-serif',
              fontWeight:500, fontSize:15, cursor:'pointer', transition:'all 0.3s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(62,207,191,0.08)'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateY(0)' }}
            >View Products</button>
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
      <SampleRequestBar scrollTo={scrollTo} />
    </section>
  )
}

function SampleRequestBar({ scrollTo }) {
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      background:'linear-gradient(90deg, rgba(200,164,74,0.12), rgba(200,164,74,0.05))',
      borderTop:'1px solid rgba(200,164,74,0.25)', borderBottom:'1px solid rgba(200,164,74,0.25)',
      padding:'14px 5%', display:'flex', alignItems:'center', gap:16, zIndex:2, flexWrap:'wrap'
    }}>
      <span style={{ color:'var(--gold)', fontSize:14 }}>✦ Try before you commit —</span>
      <button onClick={() => scrollTo('contact')} style={{
        background:'transparent', border:'1px solid rgba(200,164,74,0.5)', borderRadius:50,
        padding:'7px 20px', color:'var(--gold)', fontFamily:'DM Sans, sans-serif',
        fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.3s'
      }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(200,164,74,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >Request a Sample Bottle →</button>
    </div>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutSection() {
  const leftRef = useReveal()
  const rightRef = useReveal()
  const FEATURES = [
    { icon:'🌊', label:'Himalayan-sourced purity' },
    { icon:'🎨', label:'250+ label designs' },
    { icon:'♻️', label:'Eco-friendly materials' },
    { icon:'⚡', label:'48-hour proofing' },
  ]
  return (
    <section id="about" style={{ padding:'100px 5%', background:'var(--navy-mid)', position:'relative' }}>
      <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center', maxWidth:1200, margin:'0 auto' }}>
        <div ref={leftRef} className="reveal-left">
          <SectionTag>About Us</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', lineHeight:1.1, color:'var(--white)', marginBottom:24 }}>
            Born in the Himalayas,<br />Built for Your Brand
          </h2>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:20 }}>
            AquaVia was founded on one belief: that hydration is the most powerful touchpoint a brand can own. We source pure water from Himalayan springs and package it with your story — transforming every sip into a brand impression.
          </p>
          <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:36 }}>
            From intimate boardrooms to large-scale conferences, our bottles carry your logo, your colors, and your message — delivered on time, every time, across every corner of India.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {FEATURES.map(f => (
              <div key={f.label} className="glass-card" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:22 }}>{f.icon}</span>
                <span style={{ fontSize:14, fontWeight:500, color:'var(--white)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={rightRef} className="reveal-right" style={{ display:'flex', justifyContent:'center', position:'relative' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:300, height:300, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(62,207,191,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div className="glass-card" style={{ padding:24, position:'relative', zIndex:1 }}>
            <MoonMountainIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────
function ServicesSection() {
  const ref = useReveal()
  return (
    <section id="services" style={{ padding:'100px 5%', background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }} ref={ref} className="reveal">
          <SectionTag>What We Offer</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            End-to-End Branded Water Solutions
          </h2>
        </div>
        <div className="services-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24 }}>
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} service={s} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ service, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="glass-card service-card reveal" style={{ padding:'32px 28px', transitionDelay:`${delay}s` }}>
      <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg, rgba(62,207,191,0.2), rgba(62,207,191,0.05))',
        border:'1px solid rgba(62,207,191,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:20 }}>
        {service.icon}
      </div>
      <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:22, fontWeight:600, color:'var(--white)', marginBottom:12 }}>{service.title}</h3>
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:15 }}>{service.desc}</p>
    </div>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const titleRef = useReveal()
  return (
    <section id="how" style={{ padding:'100px 5%', background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }} ref={titleRef} className="reveal">
          <SectionTag>The Process</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            From Logo to Doorstep in 4 Steps
          </h2>
        </div>
        <div className="how-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, position:'relative' }}>
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} delay={i * 0.12} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, delay, isLast }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="glass-card step-card reveal" style={{
      padding:'32px 24px', textAlign:'center', position:'relative', transitionDelay:`${delay}s`
    }}>
      {!isLast && (
        <div style={{
          position:'absolute', top:44, right:'-12%', width:'24%', height:2,
          background:'linear-gradient(90deg, var(--aqua), transparent)',
          zIndex:10, pointerEvents:'none'
        }} />
      )}
      <div className="step-num" style={{
        width:52, height:52, borderRadius:'50%', border:'2px solid var(--aqua)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'Cormorant Garamond, serif', fontSize:18, fontWeight:700,
        color:'var(--aqua)', margin:'0 auto 20px', transition:'all 0.3s'
      }}>{step.num}</div>
      <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, fontWeight:600, color:'var(--white)', marginBottom:10 }}>{step.title}</h3>
      <p style={{ color:'var(--muted)', lineHeight:1.75, fontSize:14 }}>{step.desc}</p>
    </div>
  )
}

// ─── Products ─────────────────────────────────────────────────────────────────
function ProductsSection() {
  const titleRef = useReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="products" style={{ padding:'100px 5%', background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }} ref={titleRef} className="reveal">
          <SectionTag>Our Range</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Choose Your Perfect Size
          </h2>
        </div>
        <div className="products-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:28 }}>
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.size} product={p} delay={i * 0.12} scrollTo={scrollTo} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, delay, scrollTo }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="bottle-card reveal" style={{
      background:'var(--navy-card)', border:`1px solid ${product.featured ? 'rgba(62,207,191,0.4)' : 'var(--glass-border)'}`,
      borderRadius:24, padding:'32px 28px', textAlign:'center', position:'relative',
      transitionDelay:`${delay}s`, display:'flex', flexDirection:'column', alignItems:'center', gap:0
    }}>
      {product.featured && (
        <div style={{
          position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(135deg, var(--gold), #a87c28)', borderRadius:50,
          padding:'4px 18px', fontSize:11, fontWeight:700, letterSpacing:'0.1em',
          color:'var(--navy)', textTransform:'uppercase'
        }}>Most Popular</div>
      )}
      <BottleSVG color={product.color} label={product.size} size={210} />
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:42, fontWeight:700, color:product.color, marginTop:8, lineHeight:1 }}>{product.size}</div>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, color:'var(--white)', marginBottom:8 }}>{product.name}</div>
      <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.6, marginBottom:20 }}>{product.desc}</p>
      <div style={{ width:'100%', height:1, background:'var(--glass-border)', margin:'4px 0 20px' }} />
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:28, fontWeight:700, color:'var(--white)', marginBottom:4 }}>{product.price}</div>
      <div style={{ fontSize:13, color:'var(--muted)', marginBottom:24 }}>Min. {product.minOrder}</div>
      <button onClick={() => scrollTo('contact')} style={{
        width:'100%', background:`linear-gradient(135deg, ${product.color}, ${product.color}aa)`,
        border:'none', borderRadius:12, padding:'12px', color:'var(--navy)',
        fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:15, cursor:'pointer', transition:'all 0.3s'
      }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
      >Order Now</button>
    </div>
  )
}

// ─── Industries ───────────────────────────────────────────────────────────────
function IndustriesSection() {
  const titleRef = useReveal()
  return (
    <section id="industries" style={{ padding:'100px 5%', background:'var(--navy-mid)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }} ref={titleRef} className="reveal">
          <SectionTag>Industries We Serve</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Trusted Across Every Sector
          </h2>
        </div>
        <div className="industries-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:16 }}>
          {INDUSTRIES.map((ind, i) => (
            <IndustryChip key={ind.name} ind={ind} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  )
}

function IndustryChip({ ind, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="industry-chip reveal" style={{
      background:'rgba(11,34,68,0.7)', border:'1px solid var(--glass-border)', borderRadius:14,
      padding:'18px 20px', display:'flex', alignItems:'center', gap:14,
      transition:'all 0.3s', cursor:'default', transitionDelay:`${delay}s`
    }}>
      <span style={{ fontSize:28, flexShrink:0 }}>{ind.icon}</span>
      <span style={{ fontWeight:500, fontSize:15, color:'var(--white)', flex:1 }}>{ind.name}</span>
      <span style={{ color:'var(--aqua)', fontSize:18, flexShrink:0 }}>›</span>
    </div>
  )
}

// ─── Customizer ───────────────────────────────────────────────────────────────
function CustomizerSection() {
  const [logo, setLogo] = useState(null)
  const [color, setColor] = useState('#3ecfbf')
  const [size, setSize] = useState('500ml')
  const fileRef = useRef()
  const leftRef = useReveal()
  const rightRef = useReveal()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const COLORS = ['#3ecfbf', '#c8a44a', '#5b8ff9', '#e85d75', '#7c4dff', '#ff7043']
  const SIZES = ['250ml', '500ml', '1L']

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <section id="customizer" style={{ padding:'100px 5%', background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <SectionTag>Live Customizer</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Design Your Bottle, Live
          </h2>
        </div>

        <div className="about-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
          {/* Controls */}
          <div ref={leftRef} className="reveal-left">
            {/* Upload zone */}
            <div onClick={() => fileRef.current?.click()} style={{
              border:'2px dashed rgba(62,207,191,0.3)', borderRadius:18, padding:'32px',
              textAlign:'center', cursor:'pointer', marginBottom:28, transition:'border-color 0.3s',
              background:'rgba(11,34,68,0.4)'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(62,207,191,0.6)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(62,207,191,0.3)'}
            >
              {logo ? (
                <div>
                  <img src={logo} alt="logo preview" style={{ maxHeight:80, maxWidth:160, objectFit:'contain', marginBottom:12 }} />
                  <div style={{ color:'var(--aqua)', fontSize:13, fontWeight:600 }}>Logo uploaded ✓</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:36, marginBottom:10 }}>☁️</div>
                  <div style={{ color:'var(--white)', fontWeight:600, marginBottom:6 }}>Upload Your Logo</div>
                  <div style={{ color:'var(--muted)', fontSize:13 }}>PNG, SVG or JPG · Max 5MB</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />
            {logo && (
              <button onClick={() => setLogo(null)} style={{
                background:'transparent', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8,
                padding:'8px 16px', color:'var(--muted)', fontSize:13, cursor:'pointer',
                marginTop:-16, marginBottom:24, display:'block'
              }}>Remove logo</button>
            )}

            {/* Color picker */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--white)', marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>Label Color</div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setColor(c)} style={{
                    width:32, height:32, borderRadius:'50%', background:c, cursor:'pointer', transition:'all 0.2s',
                    boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : 'none'
                  }} />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom:36 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--white)', marginBottom:14, letterSpacing:'0.05em', textTransform:'uppercase' }}>Bottle Size</div>
              <div style={{ display:'flex', gap:10 }}>
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSize(s)} style={{
                    borderRadius:50, padding:'9px 22px', fontSize:14, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.25s',
                    background: size === s ? 'var(--aqua)' : 'rgba(11,34,68,0.8)',
                    color: size === s ? 'var(--navy)' : 'var(--muted)',
                    borderColor: size === s ? 'var(--aqua)' : 'var(--glass-border)'
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <button onClick={() => scrollTo('contact')} style={{
              width:'100%', background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
              border:'none', borderRadius:14, padding:'16px', color:'var(--navy)',
              fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16, cursor:'pointer', transition:'all 0.3s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >Request This Design →</button>
          </div>

          {/* Live preview */}
          <div ref={rightRef} className="reveal-right">
            <div className="glass-card" style={{ padding:40, minHeight:380, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
              <BottleSVG logo={logo} color={color} label={size} size={280} animationClass="floatB 4s ease-in-out infinite" />
              <div style={{ color:'var(--muted)', fontSize:14, fontWeight:500 }}>Your brand. Live preview.</div>
              <div style={{ color:'var(--muted)', fontSize:12, opacity:0.7, textAlign:'center', maxWidth:260 }}>
                Final print may vary slightly based on label material
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function TestimonialsSection({ content }) {
  const allTestimonials = useMemo(() => {
    if (!content?.localTestimonial) return TESTIMONIALS
    return [{ ...content.localTestimonial, isLocal: true }, ...TESTIMONIALS]
  }, [content?.localTestimonial])

  const [active, setActive] = useState(0)
  const titleRef = useReveal()
  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % allTestimonials.length), 5000)
    return () => clearInterval(timer)
  }, [allTestimonials.length])

  return (
    <section id="testimonials" style={{ padding:'100px 5%', background:'var(--navy-mid)' }} aria-live="polite" aria-atomic="true">
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }} ref={titleRef} className="reveal">
          <SectionTag>What Clients Say</SectionTag>
          <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Trusted by India's Leading Brands
          </h2>
        </div>

        <div className="testimonials-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24, marginBottom:40 }}>
          {allTestimonials.map((t, i) => (
            <div key={t.name} onClick={() => setActive(i)} style={{
              background:'var(--navy-card)', border:`1px solid ${active===i ? 'rgba(62,207,191,0.35)' : 'var(--glass-border)'}`,
              borderRadius:20, padding:'28px 24px', cursor:'pointer', transition:'all 0.4s', position:'relative',
              transform: active===i ? 'scale(1.02)' : 'scale(1)',
              boxShadow: active===i ? '0 16px 50px rgba(62,207,191,0.08)' : 'none'
            }}>
              {t.isLocal && (
                <div style={{ position:'absolute', top:14, right:14, fontSize:11, fontWeight:700, color:'var(--aqua)', background:'rgba(62,207,191,0.1)', border:'1px solid rgba(62,207,191,0.3)', borderRadius:50, padding:'2px 10px', letterSpacing:'0.08em' }}>
                  📍 Delhi NCR
                </div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(62,207,191,0.15)',
                  border:'1px solid rgba(62,207,191,0.3)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16, color:'var(--aqua)', flexShrink:0 }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:15, color:'var(--white)' }}>{t.name}</div>
                  <div style={{ fontSize:12, color:'var(--muted)' }}>{t.title}</div>
                </div>
              </div>
              <div style={{ color:'var(--gold)', fontSize:14, marginBottom:12, letterSpacing:2 }}>{'★'.repeat(t.rating)}</div>
              <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.75, fontStyle:'italic' }}>&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
          {allTestimonials.map((_, i) => (
            <div key={i} onClick={() => setActive(i)} style={{
              height:8, borderRadius:50, cursor:'pointer', transition:'all 0.35s',
              width: active===i ? 28 : 8,
              background: active===i ? 'var(--aqua)' : 'rgba(255,255,255,0.2)'
            }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactSection({ content }) {
  const [form, setForm] = useState({ name:'', company:'', email:'', phone:'', quantity:'', message:'' })
  const [submitted, setSubmitted] = useState(false)
  const leftRef = useReveal()
  const rightRef = useReveal()
  const phone = content?.phone || '+91 76671 23460'
  const deliveryNote = content?.deliveryNote || 'Currently serving Delhi NCR.'

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = () => {
    if (!form.name || !form.email) return
    setSubmitted(true)
  }

  const SOCIAL = [
    { label:'IG', color:'#e1306c', path:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { label:'LI', color:'#0077b5', path:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { label:'TW', color:'#1da1f2', path:'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
    { label:'YT', color:'#ff0000', path:'M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z' },
  ]

  return (
    <section id="contact" style={{ padding:'100px 5%', background:'#04101f' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div className="contact-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
          {/* Left */}
          <div ref={leftRef} className="reveal-left">
            <SectionTag>Get in Touch</SectionTag>
            <h2 style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,48px)', color:'var(--white)', lineHeight:1.1, marginBottom:20 }}>
              Let's Build Something Together
            </h2>
            <p style={{ color:'var(--muted)', lineHeight:1.75, marginBottom:36 }}>
              Ready to put your brand on every bottle? Tell us about your requirements and we'll craft a solution tailored to your needs and timeline.
            </p>
            {[
              { icon:'📍', text:'Delhi, India' },
              { icon:'📞', text:phone },
              { icon:'📧', text:'ravi.prakash4104@gmail.com' },
              { icon:'🚚', text:deliveryNote },
            ].map(item => (
              <div key={item.text} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ color:'var(--white)', fontSize:15 }}>{item.text}</span>
              </div>
            ))}
            <div style={{ display:'flex', gap:12, marginTop:32 }}>
              {SOCIAL.map(s => (
                <div key={s.label} className="glass-card" style={{ width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={s.color}>
                    <path d={s.path} />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div ref={rightRef} className="glass-card reveal-right" style={{ padding:'40px 36px' }}>
            {submitted ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
                <h3 style={{ fontFamily:'Cormorant Garamond, serif', fontSize:26, color:'var(--white)', marginBottom:12 }}>Enquiry Received!</h3>
                <p style={{ color:'var(--muted)' }}>We'll be in touch within 24 hours!</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} className="form-input" />
                <input name="company" placeholder="Company Name" value={form.company} onChange={handleChange} className="form-input" />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="form-input" />
                  <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="form-input" />
                </div>
                <select name="quantity" value={form.quantity} onChange={handleChange} className="form-input">
                  <option value="">Order Quantity</option>
                  <option value="100-500">100 – 500 bottles</option>
                  <option value="500-2000">500 – 2,000 bottles</option>
                  <option value="2000-10000">2,000 – 10,000 bottles</option>
                  <option value="10000+">10,000+ bottles</option>
                </select>
                <textarea name="message" placeholder="Tell us about your requirements..." value={form.message} onChange={handleChange} rows={4} className="form-input" style={{ resize:'vertical' }} />
                <div onClick={handleSubmit} style={{
                  background:'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
                  borderRadius:50, padding:'16px', textAlign:'center', color:'var(--navy)',
                  fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:16,
                  cursor:'pointer', transition:'all 0.3s', userSelect:'none'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(62,207,191,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
                >Send Enquiry →</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ content }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <footer style={{ background:'#03090f', padding:'60px 5% 30px' }}>
      <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40, maxWidth:1200, margin:'0 auto', marginBottom:40 }}>
        {/* Brand */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <svg width="28" height="28" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="fdrop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ecfbf" /><stop offset="100%" stopColor="#1a8a80" />
                </linearGradient>
              </defs>
              <path d="M16 4 Q24 14 24 20 A8 8 0 0 1 8 20 Q8 14 16 4Z" fill="url(#fdrop)" />
            </svg>
            <span style={{ fontFamily:'Cormorant Garamond, serif', fontSize:20, fontWeight:700, color:'var(--white)' }}>
              Himalayan<span style={{ color:'var(--aqua)' }}>Sip</span>
            </span>
          </div>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7 }}>Pure Himalayan hydration for brands that care.</p>
        </div>

        {/* Quick Links */}
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'var(--white)', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>Quick Links</div>
          {['about','services','products','industries','customizer','contact'].map(id => (
            <div key={id} onClick={() => scrollTo(id)} style={{ color:'var(--muted)', fontSize:14, marginBottom:10, cursor:'pointer', textTransform:'capitalize', transition:'color 0.2s' }}
              onMouseEnter={e => e.target.style.color='var(--aqua)'}
              onMouseLeave={e => e.target.style.color='var(--muted)'}
            >{id}</div>
          ))}
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
          {[`📍 Delhi, India`, `📞 ${content?.phone || '+91 76671 23460'}`, '📧 ravi.prakash4104@gmail.com', `🚚 ${content?.deliveryNote || 'Serving Delhi NCR'}`].map(item => (
            <div key={item} style={{ color:'var(--muted)', fontSize:13, marginBottom:10, lineHeight:1.5 }}>{item}</div>
          ))}
        </div>
      </div>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:24, maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <span style={{ color:'var(--muted)', fontSize:13 }}>© 2024 AquaVia. All rights reserved.</span>
        <span style={{ color:'var(--muted)', fontSize:13 }}>Made with 💧 in India</span>
      </div>
    </footer>
  )
}

// ─── WhatsApp Button ──────────────────────────────────────────────────────────
function WhatsAppButton({ content }) {
  const msg = encodeURIComponent(content?.whatsappMsg || "Hi! I'm interested in customized water bottles for my business.")
  const handleClick = () => window.open(`https://wa.me/917667123460?text=${msg}`)
  return (
    <>
      {/* Ripple ring */}
      <div style={{
        position:'fixed', bottom:28, right:28, zIndex:9998,
        width:58, height:58, borderRadius:'50%',
        border:'2px solid rgba(37,211,102,0.5)',
        animation:'ripple 2s ease-out infinite', pointerEvents:'none'
      }} />
      {/* Button */}
      <div onClick={handleClick} style={{
        position:'fixed', bottom:28, right:28, zIndex:9999,
        width:58, height:58, borderRadius:'50%',
        background:'linear-gradient(135deg, #25d366, #1aad52)',
        boxShadow:'0 8px 30px rgba(37,211,102,0.4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', animation:'waBounce 2.5s ease-in-out infinite'
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>
    </>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  useGlobalStyles()
  const geo = useGeoTarget()
  const content = useGeoContent(geo)

  useSEO({
    title: content.seoTitle,
    description: content.seoDescription,
    keywords: content.seoKeywords,
    canonical: 'https://himalayan-sip.vercel.app/',
    schema: HS_SCHEMA,
  })

  useEffect(() => {
    document.documentElement.lang = 'en-IN'
    const setLink = (rel, href, extra) => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const l = document.createElement('link'); l.rel = rel; l.href = href
      if (extra) Object.assign(l, extra)
      document.head.appendChild(l)
    }
    setLink('preconnect', 'https://fonts.googleapis.com')
    setLink('preconnect', 'https://fonts.gstatic.com', { crossOrigin: 'anonymous' })
    setLink('dns-prefetch', 'https://ipapi.co')
    setLink('alternate', 'https://himalayan-sip.vercel.app/', { hreflang: 'en-in' })
    setLink('alternate', 'https://himalayan-sip.vercel.app/', { hreflang: 'x-default' })
  }, [])

  const { ref: customizerRef, visible: customizerVisible } = useLazySection()
  const { ref: testimonialsRef, visible: testimonialsVisible } = useLazySection()

  return (
    <div role="main" style={{ fontFamily:'DM Sans, sans-serif' }}>
      <Navbar />
      <HeroSection geo={geo} content={content} />
      <AboutSection />
      <ServicesSection />
      <HowItWorksSection />
      <ProductsSection />
      <IndustriesSection />
      <div ref={customizerRef}>{customizerVisible && <CustomizerSection />}</div>
      <div ref={testimonialsRef}>{testimonialsVisible && <TestimonialsSection content={content} />}</div>
      <FAQSection />
      <ContactSection content={content} />
      <Footer content={content} />
      <WhatsAppButton content={content} />
    </div>
  )
}
