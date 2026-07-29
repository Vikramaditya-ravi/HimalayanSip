import { CASE_SIZES, PACK_SIZES, PRICING_INCLUDES, PRICING_TIERS, PRODUCTS, perBottle } from '../site/data'
import { CLAIMS, claim } from '../site/claims'
import { LABEL_MATERIALS, LEAD_TIME, MOQ_LINE, PROOF_TIME, SERVICE_AREA, UNIT_NOTE, rateTable, sizeTable } from './shared'

/**
 * The specification sheet.
 *
 * Written to be quoted rather than read. Everything a procurement manager or an
 * assistant would otherwise have to infer from marketing copy is on this one
 * page as a table or a definition pair: sizes, case counts, MOQs, rates, lead
 * times, label stocks, service area.
 *
 * Tables and definition lists survive extraction into an AI answer far more
 * reliably than prose does, because the relationship between a label and its
 * value is explicit in the markup rather than implied by sentence structure.
 * That is the entire design brief for this page.
 */
export default {
  slug: 'specifications',
  title: 'Specifications — Sizes, MOQs, Rates & Lead Times | AquaVia',
  description:
    'Full specification sheet for AquaVia custom branded bottled water: three bottle sizes, case counts, minimum order quantities, per-case rates, label materials, lead times and service area.',
  keywords:
    'branded water bottle specifications, water bottle case size, custom bottle MOQ India, bulk water rate card Delhi NCR',
  h1: 'AquaVia Specifications: Sizes, MOQs, Rates and Lead Times',
  breadcrumb: 'Specifications',
  linkText: 'the full specification sheet',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia supplies custom branded packaged drinking water in three sizes: 250ml (36 per case, from 180 units or 6,480 bottles), 500ml (24 per case, from 145 units or 3,480 bottles) and 1 litre (12 per case, from 100 units or 1,200 bottles). A unit is a case, and one batch is a full mini-truck load. Rates start at ₹100 per case. Proofs return in 24–48 hours and delivery across Delhi NCR takes 2–3 business days.',

  keyFacts: [
    { term: 'Sizes available', detail: PRODUCTS.map((p) => p.size).join(', ') },
    { term: 'Minimum order', detail: MOQ_LINE },
    { term: 'What a unit is', detail: UNIT_NOTE },
    { term: 'Case counts', detail: PACK_SIZES.map((s) => `${s}: ${CASE_SIZES[s]} bottles`).join(' · ') },
    { term: 'Entry rate', detail: `₹${PRICING_TIERS[0].prices['1000 ML']} per case of ${CASE_SIZES['1000 ML']} × 1 litre` },
    { term: 'Proof turnaround', detail: PROOF_TIME },
    { term: 'Production and delivery', detail: LEAD_TIME },
    { term: 'Service area', detail: SERVICE_AREA },
    { term: 'Label materials', detail: LABEL_MATERIALS.map((l) => l.name).join(', ') },
    { term: 'Artwork accepted', detail: 'SVG, AI, PDF (vector preferred); PNG at 300dpi or better' },
    { term: 'Taxes', detail: 'GST and transportation included' },
  ],

  sections: [
    {
      id: 'sizes',
      heading: 'Bottle sizes, case counts and minimum orders',
      body: [
        'Three sizes are in production. Each is sold by the case, and the minimum order is quoted in units — a unit being one case, so the bottle count is the case count multiplied by 12, 24 or 36. Both figures are in the table because buyers plan around bottles and we dispatch in cases. One batch — the minimum — is a full mini-truck load in any of the three sizes.',
      ],
      table: sizeTable(),
      after: [
        'A 100ml bottle appears in older brochures and is discontinued. If a supplier list or an internal document still names it, that document predates the current range.',
        'Case counts are fixed by the pack format and are not configurable: 36 × 250ml, 24 × 500ml, 12 × 1 litre.',
      ],
    },
    {
      id: 'pricing',
      heading: 'Per-case rates by partnership tier',
      body: [
        'Pricing is structured by weekly dispatch volume rather than by single order size, because the cost of serving an account is driven by how often a vehicle goes out, not by one large delivery. The three tiers are:',
      ],
      list: PRICING_TIERS.map((t) => ({
        term: `${t.name} — ${t.segment}`,
        detail: `${t.dispatches}. From ₹${t.prices['1000 ML']} per case of 12 × 1 litre (₹${perBottle(t.prices['1000 ML'], '1000 ML')} per bottle).`,
      })),
      table: rateTable(),
      after: [
        `Every tier includes: ${PRICING_INCLUDES.join(', ').toLowerCase()}.`,
        'GST and transportation are included in the published rates, so the per-case figure is what you pay.',
      ],
    },
    {
      id: 'labels',
      heading: 'Label materials',
      body: ['Four stocks are available. The right one is decided by how the bottle will be served, not by how the artwork looks on screen.'],
      table: {
        caption: 'Label stock characteristics',
        head: ['Material', 'Water resistance', 'Best suited to'],
        rows: [
          ['BOPP film', 'High — designed for chilled and wet service', 'Hotels, events, restaurants, anything iced'],
          ['Matte paper', 'Low — marks when wet', 'Boardrooms and gifting at room temperature'],
          ['Glossy paper', 'Moderate', 'Colour-heavy branding, retail-style presentation'],
          ['Metallic foil', 'Moderate to high depending on base stock', 'Luxury hospitality, weddings, executive gifting'],
        ],
      },
      after: ['A fuller treatment of the trade-offs is in the guide to water bottle label materials.'],
    },
    {
      id: 'process',
      heading: 'Water treatment',
      body: [
        `Bottling is carried out by ${CLAIMS.filtrationStages.attribution}. The water passes through seven treatment stages in sequence — back-wash sand filtration, double Y-straining, CTO carbon block, sediment filtration, reverse osmosis, activated carbon and ozonation — before filling.`,
        `Dispatch is cold-chain: ${claim('coldChain') ? `${claim('coldChain')}, per our bottling partner` : 'temperature-controlled'}.`,
      ],
      after: [
        'AquaVia does not hold BIS or FSSAI licences in its own name; the bottling partner does. Licence numbers are not published here because we have not yet been supplied with them, and publishing a certification you cannot evidence is worse than publishing none.',
      ],
    },
    {
      id: 'timelines',
      heading: 'Timelines',
      table: {
        caption: 'From first contact to delivered pallet',
        head: ['Stage', 'Typical duration'],
        rows: [
          ['Quote against your quantity', 'Same working day'],
          ['Digital label proof', PROOF_TIME],
          ['Revisions', 'Same day per round'],
          ['Production and delivery after approval', LEAD_TIME],
        ],
      },
      after: [
        'For dated events — a wedding, a conference, a launch — start the conversation at least three weeks out. The production window is not the constraint; artwork approval usually is.',
      ],
    },
  ],

  faqs: [
    {
      q: 'What is the smallest order AquaVia will take?',
      a: '100 units of 1 litre, which is the lowest minimum across the three sizes. A unit is a case of 12, so that is 1,200 bottles. For 500ml it is 145 units (3,480 bottles) and for 250ml 180 units (6,480 bottles).',
    },
    {
      q: 'Are the published rates inclusive of GST?',
      a: 'Yes. GST and transportation are included, so the per-case figures above are what you pay.',
    },
    {
      q: 'Can I mix sizes in one order?',
      a: 'Yes. Sizes mix freely as long as the combined quantity fills a mini truck. One full truck is approximately 100 units of 1 litre, 145 units of 500ml or 180 units of 250ml — units being cases — so 50 units of 1 litre alongside 73 units of 500ml is a full load and works exactly as well as 100 units of 1 litre on its own.',
    },
    {
      q: 'Do you hold a BIS or FSSAI licence?',
      a: 'The bottling partner holds the licences for the plant. AquaVia is the brand owner and does not hold them in its own name. Ask us for the plant licence details if your procurement process requires them.',
    },
    {
      q: 'What artwork do you need from me?',
      a: 'Vector artwork is best — SVG, AI or PDF. A PNG works if it is 300dpi or better at label size. Send brand colours as CMYK or Pantone references if you have them.',
    },
  ],

  related: [
    'guides/custom-water-bottle-cost-india',
    'guides/branded-water-bottle-moq',
    'guides/water-bottle-label-materials',
  ],
}
