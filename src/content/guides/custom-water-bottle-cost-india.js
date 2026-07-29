import { CASE_SIZES, PRICING_TIERS, perBottle } from '../../site/data'
import { COMMON_FAQS, LEAD_TIME, rateTable, sizeTable } from '../shared'

export default {
  slug: 'guides/custom-water-bottle-cost-india',
  title: 'How Much Do Custom Branded Water Bottles Cost in India? | AquaVia',
  description:
    'What custom branded water bottles actually cost in India — per-bottle and per-case rates by size, what drives the price up or down, and what is excluded from a quoted rate.',
  keywords:
    'custom water bottle price India, branded water bottle cost, personalised water bottle price per bottle, bulk water bottle rate Delhi',
  h1: 'How Much Do Custom Branded Water Bottles Cost in India?',
  breadcrumb: 'Cost of custom water bottles',
  linkText: 'what custom branded bottles cost',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'Custom branded bottled water in India typically costs ₹4 to ₹9 per bottle at business volumes, sold by the case rather than individually. AquaVia rates start at ₹100 per case of 12 × 1 litre (₹8.33 per bottle) and fall with weekly dispatch volume. GST and transportation are quoted separately.',

  keyFacts: [
    { term: 'Typical range', detail: '₹4–₹9 per bottle at commercial volumes, depending on size and order frequency' },
    { term: 'Sold by', detail: `The case — ${Object.entries(CASE_SIZES).map(([k, v]) => `${v} × ${k}`).join(', ')}` },
    { term: 'Cheapest per bottle', detail: '250ml, because 36 bottles share one case' },
    { term: 'Cheapest per litre', detail: '1 litre, by a wide margin' },
    { term: 'Not included in the rate', detail: 'GST and transportation' },
    { term: 'Included in the rate', detail: 'Label printing, label application, standard artwork setup' },
  ],

  sections: [
    {
      id: 'short-answer',
      heading: 'The short answer',
      body: [
        'At business volumes, custom branded bottled water in India lands between roughly ₹4 and ₹9 per bottle. Where you fall in that range is decided by three things, in this order of impact: the bottle size, how often you take delivery, and the label stock you choose.',
        'Almost nobody in this category quotes per bottle, and you should be suspicious of anyone who leads with a per-bottle number without saying what the case is. Water is sold by the case because that is how it is filled, packed and moved. A per-bottle figure is a derived number, useful for comparison and misleading as a headline.',
      ],
    },
    {
      id: 'by-size',
      heading: 'What each size costs',
      body: [
        'These are AquaVia’s entry-tier rates — what a first-time buyer pays before any volume discount.',
      ],
      table: sizeTable('Entry-tier rates by bottle size'),
      after: [
        'Read that table twice, because it contains the single most common costing mistake in this category. The 250ml bottle has the lowest per-bottle price and by far the highest price per litre of water. If you are buying hydration — a gym, a hospital, a site canteen — the litre bottle is roughly a third of the cost per litre. If you are buying a brand impression handed to someone for ninety seconds, the 250ml is the cheaper unit of that.',
        'Decide which of the two you are actually buying before you compare quotes. Most disappointing bottled-water spends come from buying the impression and measuring it as hydration, or the reverse.',
      ],
    },
    {
      id: 'tiers',
      heading: 'Why frequency changes the price more than volume does',
      body: [
        'AquaVia prices by weekly dispatch frequency rather than by order size. Three tiers, set by how many dispatches an account takes in a week:',
      ],
      list: PRICING_TIERS.map((t) => ({
        term: `${t.name} (${t.dispatches})`,
        detail: `From ₹${t.prices['1000 ML']} per case of 12 × 1 litre — ₹${perBottle(t.prices['1000 ML'], '1000 ML')} per bottle.`,
      })),
      table: rateTable(),
      after: [
        'The logic is worth understanding because it tells you how to buy well. The expensive part of supplying bottled water is not the water; it is sending a vehicle. An account taking two dispatches a week costs less to serve per case than one taking the same annual volume in four irregular drops, and the tiers reflect that rather than pretending the difference does not exist.',
        'The practical consequence: if you are a multi-site business, consolidating your sites onto one supply agreement will move you down a tier faster than increasing any single order will.',
      ],
    },
    {
      id: 'drivers',
      heading: 'What actually moves the number',
      list: [
        { term: 'Bottle size', detail: 'The largest single factor in cost per litre. A 1 litre bottle carries four times the water of a 250ml at under twice the price.' },
        { term: 'Dispatch frequency', detail: 'Moves you between tiers. Worth more than a one-off large order.' },
        { term: 'Label stock', detail: 'BOPP film costs more than paper; metallic foil costs more again. On a large run this is a real line item, not a rounding error.' },
        { term: 'Artwork readiness', detail: 'Print-ready vector artwork costs nothing to set up. Artwork that has to be redrawn from a low-resolution image is chargeable design work.' },
        { term: 'Delivery profile', detail: 'One address on a loading bay is cheaper to serve than six addresses with time windows and gate passes.' },
        { term: 'Lead time', detail: 'Rush production can be accommodated and is not free. Ordering three weeks out costs less than ordering three days out.' },
      ],
    },
    {
      id: 'excluded',
      heading: 'What is not in the quoted rate',
      body: [
        'Two things are quoted separately in this category almost universally, and both catch first-time buyers out at invoice.',
      ],
      list: [
        { term: 'GST', detail: 'The published per-case rates are ex-tax. Ask for the tax-inclusive figure if you are comparing against a quote that bundles it.' },
        { term: 'Transportation', detail: 'Quoted against the delivery profile. A single drop inside Delhi is not the same cost as a split across five NCR sites.' },
      ],
      after: [
        'When you compare suppliers, insist on comparing like for like: per case, ex-tax, with transportation stated. Two quotes that look ₹15 apart per case are frequently identical once one of them stops hiding freight inside the rate.',
      ],
    },
    {
      id: 'budgeting',
      heading: 'Budgeting a real order',
      body: [
        'A worked example, using entry-tier rates. A 300-person conference wanting one 500ml bottle per attendee per day across two days needs 600 bottles — 25 cases at ₹136, so ₹3,400 before tax and freight. That is roughly ₹11 per attendee for the whole event, which is generally less than the coffee.',
        'A 40-desk office replacing a water cooler contract with 1 litre branded bottles at two per person per week needs about 320 bottles a month — 27 cases, around ₹2,700 monthly at entry rate, less once a weekly dispatch schedule moves the account into the Preferred tier.',
        `Whatever the shape of the order, build ${LEAD_TIME} into the plan after artwork approval, not before it.`,
      ],
    },
  ],

  faqs: [
    { q: 'What is the cheapest custom water bottle in India?', a: 'Per bottle, the 250ml is always cheapest because 36 of them share one case — AquaVia’s entry rate works out at ₹4.89 per bottle. Per litre of water, the 1 litre bottle is far cheaper. Which is "cheapest" depends entirely on whether you are buying water or a branded object.' },
    { q: 'Is there a setup or plate charge for the label?', a: 'Standard label setup from print-ready artwork is included in the rate. Redrawing artwork that is not print-ready is chargeable and quoted before any work starts.' },
    { q: 'Do prices drop for very large orders?', a: 'Yes, but through the dispatch tiers rather than through a one-off volume discount. Consistent weekly dispatch moves an account into Preferred or Enterprise rates, which is a durable reduction rather than a one-time concession.' },
    { q: 'Why do online sellers quote ₹15–₹25 per bottle?', a: 'Those are usually retail or low-quantity print runs of a few hundred bottles with retail packaging and courier delivery priced in. Commercial bulk supply on a repeating schedule is a different transaction and prices differently.' },
    ...COMMON_FAQS,
  ],

  related: [
    'guides/branded-water-bottle-moq',
    'specifications',
    'guides/water-bottle-label-materials',
  ],
}
