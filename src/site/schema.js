import { CLAIMS, claim } from './claims'
import {
  FAQS, FILTRATION_STAGES, INDUSTRIES, OG_IMAGE, PRICING_TIERS, PRODUCTS,
  SERVICES, SITE_URL, STEPS, bottlesPerUnit, moqBottles, moqUnits,
} from './data'

/**
 * The structured-data graph.
 *
 * This replaces three hand-written constants that used to sit in data.js as
 * independent blobs — a LocalBusiness, a Product and an FAQPage, each carrying
 * its own `@context`, none of them referring to the others. Three disconnected
 * objects describe three unrelated things. What an engine needs in order to say
 * "AquaVia is a private-label bottled water supplier serving Delhi NCR" is ONE
 * graph in which the offer, the pages, the service area and the business are all
 * the same entity, addressed by `@id`.
 *
 * So every page emits a single `@graph`, every node has a stable `@id`, and
 * cross-references are `{'@id': …}` pointers into the same document. Anything an
 * engine can reach by following a pointer, it can attribute to the entity.
 *
 * Two deliberate omissions, both of which are easy to add and wrong to:
 *
 * - **No `Review` / `AggregateRating`.** TESTIMONIALS are illustrative, not
 *   consented quotes from named clients (see the note there). Review markup for
 *   unverifiable quotes is a manual-action risk that would cost more than every
 *   gain in this file combined.
 * - **No `SearchAction`.** SiteSearch filters an in-memory index; there is no
 *   `?q=` URL to hand a search engine. A potentialAction pointing at a URL that
 *   does not resolve is worse than no potentialAction at all.
 */

const ID = {
  org: `${SITE_URL}/#organization`,
  business: `${SITE_URL}/#business`,
  website: `${SITE_URL}/#website`,
  logo: `${SITE_URL}/#logo`,
  page: (path) => `${SITE_URL}${path === '/' ? '/' : path}#webpage`,
  breadcrumb: (path) => `${SITE_URL}${path}#breadcrumb`,
  product: (sku) => `${SITE_URL}/products#product-${sku}`,
  service: (name) => `${SITE_URL}/#service-${slug(name)}`,
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const absolute = (path) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`)

// ─── Entity nodes ─────────────────────────────────────────────────────────────

/**
 * What AquaVia is competent in.
 *
 * `knowsAbout` is how an entity tells a knowledge graph its subject areas, and
 * it is the join between the business node and the guide pages: every topic
 * listed here has a page on this site that treats it seriously. Adding a term
 * with no page behind it would be the same empty claim as a fake SearchAction.
 */
const KNOWS_ABOUT = [
  'Private label bottled water',
  'Custom branded water bottles',
  'BOPP label printing',
  'Packaged drinking water standards in India',
  'BIS IS 14543',
  'Reverse osmosis filtration',
  'Corporate gifting',
  'Cold-chain distribution',
  'Bulk beverage supply for events',
]

function organization() {
  const node = {
    '@type': 'Organization',
    '@id': ID.org,
    name: 'AquaVia',
    alternateName: 'AquaVia World',
    legalName: 'AquaVia',
    url: `${SITE_URL}/`,
    logo: { '@id': ID.logo },
    image: { '@id': ID.logo },
    description:
      'Private-label bottled water supplier. AquaVia prints client branding on 250ml, 500ml and 1 litre packaged drinking water bottles and delivers them in bulk across Delhi NCR.',
    slogan: 'Pure Water. Your Brand.',
    email: 'info@aquaviaworld.com',
    telephone: '+91-76248-03460',
    knowsAbout: KNOWS_ABOUT,
    areaServed: areaServed(),
    // Both of these need a human to confirm they resolve — a `sameAs` pointing
    // at a 404 is a negative entity signal, not a neutral one. See
    // docs/entity-authority.md, which tracks the off-site profiles this list
    // should eventually grow to include.
    sameAs: [
      'https://www.instagram.com/aquavia.official',
      'https://www.linkedin.com/company/aquavia',
    ],
  }
  // Renders only once someone confirms the year. An invented foundingDate is a
  // fact an engine will happily repeat back at you forever.
  if (claim('foundingYear')) node.foundingDate = String(claim('foundingYear'))
  return node
}

function areaServed() {
  return [
    { '@type': 'City', name: 'New Delhi' },
    { '@type': 'City', name: 'Gurugram' },
    { '@type': 'City', name: 'Noida' },
    { '@type': 'City', name: 'Greater Noida' },
    { '@type': 'City', name: 'Faridabad' },
    { '@type': 'City', name: 'Ghaziabad' },
  ]
}

/**
 * The LocalBusiness node.
 *
 * Service-area business, not a storefront: we deliver across Delhi NCR and have
 * no address customers visit. `areaServed` carries the geography and the
 * PostalAddress stays region-level, so no street address is asserted that a
 * customer could turn up at. That decision predates this file and still holds.
 */
function localBusiness() {
  const hours = CLAIMS.businessHours.schema
  return {
    '@type': 'LocalBusiness',
    '@id': ID.business,
    name: 'AquaVia',
    parentOrganization: { '@id': ID.org },
    description:
      'Custom branded bottled water for businesses in Delhi NCR — hotels, corporate offices, events, restaurants, hospitals and gyms.',
    url: `${SITE_URL}/`,
    image: { '@id': ID.logo },
    logo: { '@id': ID.logo },
    telephone: '+91-76248-03460',
    email: 'info@aquaviaworld.com',
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Credit Card, UPI, Bank Transfer',
    areaServed: areaServed(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.days,
        opens: hours.opens,
        closes: hours.closes,
      },
    ],
  }
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: `${SITE_URL}/`,
    name: 'AquaVia',
    publisher: { '@id': ID.org },
    inLanguage: 'en-IN',
  }
}

function logoImage() {
  return {
    '@type': 'ImageObject',
    '@id': ID.logo,
    url: `${SITE_URL}/aquavia-logo.png`,
    contentUrl: `${SITE_URL}/aquavia-logo.png`,
    caption: 'AquaVia',
  }
}

/**
 * The identity nodes every page carries.
 *
 * Repeating these on all six routes is intentional: each page has to stand on
 * its own for a crawler that only ever fetches that one URL, and identical `@id`
 * values mean the repeats collapse into one entity rather than six.
 */
function identityNodes() {
  return [organization(), localBusiness(), website(), logoImage()]
}

// ─── Page nodes ───────────────────────────────────────────────────────────────

function webPage({ path, title, description, dateModified, breadcrumb }) {
  const node = {
    '@type': 'WebPage',
    '@id': ID.page(path),
    url: absolute(path),
    name: title,
    description,
    isPartOf: { '@id': ID.website },
    about: { '@id': ID.org },
    inLanguage: 'en-IN',
    primaryImageOfPage: { '@id': ID.logo },
  }
  // Freshness is one of the few signals an assistant can read directly off a
  // page, and it weighs on whether a passage is worth citing today.
  if (dateModified) node.dateModified = dateModified
  if (breadcrumb) node.breadcrumb = { '@id': ID.breadcrumb(path) }
  return node
}

/**
 * BreadcrumbList for a route.
 *
 * `trail` is [{name, path}] excluding Home, which is prepended here so no caller
 * can forget it and leave a breadcrumb that starts halfway down the site.
 */
export function breadcrumbList(path, trail) {
  return {
    '@type': 'BreadcrumbList',
    '@id': ID.breadcrumb(path),
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  }
}

// ─── Offer and service nodes ──────────────────────────────────────────────────

/**
 * One Product node per SKU, replacing the single generic "Custom Branded Water
 * Bottles" node that used to stand for all three.
 *
 * The generic node could not carry a per-size MOQ, which is the single most
 * asked question in this category — `eligibleQuantity` now does, as a real
 * QuantitativeValue rather than prose an engine has to parse out of a
 * description.
 */
function products() {
  return PRODUCTS.map((p) => ({
    '@type': 'Product',
    '@id': ID.product(p.sku),
    name: `${p.size} Custom Branded Water Bottle`,
    description: p.desc,
    sku: p.sku,
    brand: { '@id': ID.org },
    image: OG_IMAGE,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/pricing`,
      price: p.price.replace(/[^\d.]/g, ''),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: { '@id': ID.business },
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        value: moqBottles(p),
        unitText: 'bottles',
        description: `Minimum order quantity for ${p.size} — ${moqUnits(p)}, a unit being a case of ${bottlesPerUnit(p)}`,
      },
      areaServed: areaServed(),
    },
  }))
}

/** The six services, from the same array the page renders. */
function services() {
  return SERVICES.map((s) => ({
    '@type': 'Service',
    '@id': ID.service(s.title),
    name: s.title,
    description: s.desc,
    provider: { '@id': ID.org },
    areaServed: areaServed(),
    serviceType: 'Private label bottled water',
  }))
}

/**
 * The order flow as a HowTo.
 *
 * Four genuine steps a customer performs, not a marketing list — which is the
 * bar HowTo markup is supposed to meet and mostly isn't.
 */
function howToOrder() {
  return {
    '@type': 'HowTo',
    '@id': `${SITE_URL}/process#howto`,
    name: 'How to order custom branded water bottles',
    description:
      'Send artwork, choose a size and quantity, approve the digital proof, and take delivery across Delhi NCR.',
    totalTime: 'P10D',
    step: STEPS.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
      url: `${SITE_URL}/process#how`,
    })),
  }
}

/**
 * The seven filtration stages as an ordered ItemList.
 *
 * This is the most extractable thing on the site: a named, ordered, explained
 * sequence is exactly the shape an assistant lifts wholesale when someone asks
 * how packaged drinking water is treated.
 */
function filtrationList() {
  return {
    '@type': 'ItemList',
    '@id': `${SITE_URL}/process#filtration-stages`,
    name: 'Seven-stage water filtration process',
    description: `Filtration sequence at ${CLAIMS.filtrationStages.attribution}'s plant, in the order the water passes through it.`,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: FILTRATION_STAGES.length,
    itemListElement: FILTRATION_STAGES.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      description: s.purpose,
    })),
  }
}

/** An FAQPage node from any [{q, a}] list. */
export function faqPage(faqs, id = `${SITE_URL}/pricing#faq`) {
  return {
    '@type': 'FAQPage',
    '@id': id,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/** The pricing tiers as an OfferCatalog, so the rate structure is machine-readable. */
function priceCatalog() {
  return {
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/pricing#catalog`,
    name: 'Corporate partnership tiers',
    provider: { '@id': ID.org },
    itemListElement: PRICING_TIERS.map((t, i) => ({
      '@type': 'OfferCatalog',
      position: i + 1,
      name: `${t.name} — ${t.segment}`,
      description: `${t.dispatches}. Per case: 1L ₹${t.prices['1000 ML']}, 500ml ₹${t.prices['500 ML']}, 250ml ₹${t.prices['250 ML']}.`,
    })),
  }
}

// ─── Per-route graphs ─────────────────────────────────────────────────────────

/**
 * The graph for one route.
 *
 * Every page gets the identity nodes plus whatever describes that page and
 * nothing else — the About page must never be told it is also an offer, which
 * is the reasoning the old split-by-route comment in data.js recorded and this
 * preserves.
 */
export function graphFor(route, meta, dateModified) {
  const nodes = identityNodes()
  const path = meta.path

  if (path !== '/') {
    nodes.push(
      webPage({ ...meta, dateModified, breadcrumb: true }),
      breadcrumbList(path, [{ name: meta.breadcrumb, path }]),
    )
  } else {
    nodes.push(webPage({ ...meta, dateModified }))
  }

  if (route === 'home') nodes.push(...services())
  if (route === 'products') nodes.push(...products())
  if (route === 'pricing') nodes.push(priceCatalog(), faqPage(FAQS))
  if (route === 'process') nodes.push(howToOrder(), filtrationList())

  return { '@context': 'https://schema.org', '@graph': nodes }
}

/**
 * The graph for a generated content page (src/content).
 *
 * Content pages describe their own extra nodes declaratively — a Service node
 * for a use-case page, an FAQPage for anything with questions — and this wires
 * them into the same entity graph the rest of the site uses.
 */
/**
 * `trail` is passed in rather than derived here, and that is not an accident of
 * convenience. Building a content page's trail needs the content index (it names
 * the page's category), and this module is imported BY the content modules —
 * `serviceNode` — so importing the index back would close a cycle. The caller
 * has the trail already: it comes from contentMeta(), which is also what renders
 * the visible breadcrumbs, so the two are guaranteed to be the same array rather
 * than two derivations that agreed on the day they were written.
 */
export function graphForContent(page, extraNodes = [], trail) {
  const path = `/${page.slug}`
  const nodes = [
    ...identityNodes(),
    webPage({
      path,
      title: page.title,
      description: page.description,
      dateModified: page.updatedAt,
      breadcrumb: true,
    }),
    breadcrumbList(path, trail ?? page.trail ?? [{ name: page.breadcrumb ?? page.h1, path }]),
    {
      '@type': 'Article',
      '@id': `${SITE_URL}${path}#article`,
      headline: page.h1,
      description: page.description,
      // The answer block is the passage written to be quoted, so it is also the
      // passage worth marking as speakable.
      abstract: page.answerBlock,
      datePublished: page.publishedAt,
      dateModified: page.updatedAt,
      author: { '@id': ID.org },
      publisher: { '@id': ID.org },
      isPartOf: { '@id': ID.page(path) },
      mainEntityOfPage: { '@id': ID.page(path) },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.answer-block'],
      },
    },
    ...extraNodes,
  ]
  if (page.faqs?.length) nodes.push(faqPage(page.faqs, `${SITE_URL}${path}#faq`))
  return { '@context': 'https://schema.org', '@graph': nodes }
}

/** A Service node for a use-case page, pointed at the industry it serves. */
export function serviceNode({ slug: pageSlug, name, description }) {
  return {
    '@type': 'Service',
    '@id': `${SITE_URL}/${pageSlug}#service`,
    name,
    description,
    provider: { '@id': ID.org },
    areaServed: areaServed(),
    serviceType: 'Private label bottled water',
    audience: {
      '@type': 'BusinessAudience',
      name: INDUSTRIES.map((i) => i.name).find((n) => name.includes(n.split(' ')[0])) ?? name,
    },
  }
}

export { ID as SCHEMA_IDS }
