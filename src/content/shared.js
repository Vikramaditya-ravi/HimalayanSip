import { claim } from '../site/claims'
import { CASE_SIZES, PACK_SIZES, PRICING_TIERS, PRODUCTS, perBottle } from '../site/data'

/**
 * Facts the content pages share.
 *
 * Everything here is derived from the same constants the product pages render,
 * or from the claims register. Nothing is retyped. A page that quotes an MOQ or
 * a per-case rate reads it from here, so the day a price changes there is no
 * second copy of it buried in twenty-three prose files — which is exactly how
 * content sites end up contradicting their own pricing page.
 */

export const MOQ = Object.fromEntries(PRODUCTS.map((p) => [p.sku, p.minOrder]))
export const PRICE = Object.fromEntries(PRODUCTS.map((p) => [p.sku, p.price]))

export const LEAD_TIME = claim('leadTime')
export const PROOF_TIME = claim('proofTime')
export const SERVICE_AREA = claim('serviceArea')
export const HOURS = claim('businessHours')

export const NCR_CITIES = ['Delhi', 'Gurugram', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad']

/** The rate card as a table, built from PRICING_TIERS rather than transcribed. */
export function rateTable(caption = 'Per-case rates by partnership tier') {
  return {
    caption,
    head: ['Tier', 'Weekly dispatches', ...PACK_SIZES.map((s) => `${s} (case of ${CASE_SIZES[s]})`)],
    rows: PRICING_TIERS.map((t) => [
      t.name,
      t.dispatches,
      ...PACK_SIZES.map((s) => `₹${t.prices[s]} (₹${perBottle(t.prices[s], s)}/bottle)`),
    ]),
  }
}

/**
 * Which entry in PACK_SIZES a PRODUCTS sku corresponds to.
 *
 * The two arrays spell the same three bottles differently ('1L' vs '1000 ML')
 * because one is a caption and the other is the brochure's own wording. This is
 * the single place that knows they are the same thing.
 */
export const PACK_FOR_SKU = { '250ml': '250 ML', '500ml': '500 ML', '1L': '1000 ML' }

/** Sizes, MOQs and case counts — the three numbers every buyer asks for first. */
export function sizeTable(caption = 'Bottle sizes, case counts and minimum order quantities') {
  return {
    caption,
    head: ['Size', 'Bottles per case', 'Minimum order', 'Entry rate'],
    rows: PRODUCTS.map((p) => [
      p.size,
      String(CASE_SIZES[PACK_FOR_SKU[p.sku]]),
      p.minOrder,
      p.price,
    ]),
  }
}

/**
 * The label materials AquaVia actually prints on.
 *
 * Kept here rather than in data.js because only the content pages describe them
 * in this detail; the product pages just name them.
 */
export const LABEL_MATERIALS = [
  {
    name: 'BOPP',
    detail: 'Biaxially-oriented polypropylene. A synthetic film rather than paper, so it survives ice buckets, condensation and chilled transport without cockling or peeling. The default for anything that will be served cold.',
    bestFor: 'Hotels, events, restaurants, anything iced',
  },
  {
    name: 'Matte paper',
    detail: 'Uncoated paper stock with a soft, non-reflective surface. Prints beautifully and photographs well, but absorbs water — a bottle sweating in a cooler will mark it.',
    bestFor: 'Boardrooms, conferences, gifting at room temperature',
  },
  {
    name: 'Glossy paper',
    detail: 'Coated paper with a reflective finish that lifts saturated brand colours. More moisture-tolerant than matte, still paper underneath.',
    bestFor: 'Retail-style presentation, colour-heavy branding',
  },
  {
    name: 'Metallic foil',
    detail: 'Foil-stamped accents over a base stock. Reads as premium at arm’s length and is the most expensive of the four; usually applied to a logo or border rather than the whole label.',
    bestFor: 'Luxury hospitality, weddings, executive gifting',
  },
]

/** Standard closing FAQs every commercial page carries. */
export const COMMON_FAQS = [
  {
    q: 'Which areas does AquaVia deliver to?',
    a: `${SERVICE_AREA}. Deliveries outside Delhi NCR are quoted case by case.`,
  },
  {
    q: 'How long does an order take?',
    a: `A digital label proof comes back in ${PROOF_TIME}. Once you approve it, production and delivery run ${LEAD_TIME}. Rush orders are possible — say so when you enquire.`,
  },
  {
    q: 'Can I see a sample before committing to a bulk order?',
    a: 'Yes. Message the sales desk on WhatsApp at +91 76248 03460 or email info@aquaviaworld.com with your logo and rough quantity, and we will arrange a sample bottle.',
  },
]
