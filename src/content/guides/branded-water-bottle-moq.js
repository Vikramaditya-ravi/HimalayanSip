import { PRODUCTS } from '../../site/data'
import { COMMON_FAQS, LEAD_TIME, PROOF_TIME, sizeTable } from '../shared'

export default {
  slug: 'guides/branded-water-bottle-moq',
  title: 'Minimum Order Quantity for Branded Water Bottles | AquaVia',
  description:
    'What the minimum order quantity is for custom branded water bottles in India, why MOQs exist at all, how they differ by bottle size, and how to work with one when your requirement is smaller.',
  keywords:
    'branded water bottle MOQ, minimum order custom water bottle India, smallest custom water bottle order, personalised water bottle minimum quantity',
  h1: 'What Is the Minimum Order for Branded Water Bottles?',
  breadcrumb: 'Minimum order quantities',
  linkText: 'minimum order quantities explained',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia’s minimum order is 150 units for 1 litre bottles, 250 units for 500ml and 500 units for 250ml. The minimums differ because case counts differ — 12 bottles per case at 1 litre against 36 at 250ml — so each represents a similar number of cases through the line.',

  keyFacts: PRODUCTS.map((p) => ({ term: `${p.size} minimum`, detail: p.minOrder })).concat([
    { term: 'Lowest entry point', detail: '150 units of 1 litre' },
    { term: 'Why they differ', detail: 'Case counts differ by size; the MOQ is roughly constant in cases, not in bottles' },
    { term: 'Mixed orders', detail: 'Allowed, but each size must meet its own minimum independently' },
  ]),

  sections: [
    {
      id: 'the-numbers',
      heading: 'The numbers',
      table: sizeTable('Minimum order quantity by size'),
      after: [
        'The lowest entry point into a branded run is 150 × 1 litre. That is around a dozen cases — a single pallet layer — and is deliberately set low enough that a small firm can put its brand on a bottle without committing to a warehouse full of them.',
      ],
    },
    {
      id: 'why',
      heading: 'Why minimum order quantities exist',
      body: [
        'An MOQ is not a sales tactic, and it is worth understanding what it is actually protecting, because that tells you where there is flexibility and where there is not.',
        'The cost of a branded run is dominated by changeover, not by production. Printing a label means preparing artwork, mounting it, running the press up to colour, and — critically — stopping the filling line, clearing the previous label, running yours through, and stopping again. That changeover cost is identical whether you order 150 bottles or 15,000. Below a certain quantity, the changeover is the entire cost of the order and the water is a rounding error.',
        'So the MOQ is the point below which the price per bottle stops being about water at all. A supplier who waives it is either absorbing the changeover, or charging you for it somewhere less visible.',
      ],
    },
    {
      id: 'by-size',
      heading: 'Why the minimum is different for each size',
      body: [
        'The three minimums look inconsistent in bottles and are near-identical in cases. 500 × 250ml is about 14 cases. 250 × 500ml is about 10 cases. 150 × 1 litre is 12 cases.',
        'That is the tell: the constraint is case throughput on the line, not bottle count. Once you see the MOQ in cases, the apparent inconsistency disappears, and it becomes obvious why ordering 400 × 250ml is not possible while ordering 150 × 1 litre is.',
      ],
    },
    {
      id: 'below-moq',
      heading: 'What to do if your requirement is smaller',
      body: ['Four honest options, in the order we would suggest them.'],
      steps: [
        { term: 'Move up a size', detail: 'If you need 300 bottles and the 250ml minimum is 500, the 500ml minimum of 250 may already fit. Buyers routinely fix an MOQ problem by changing size rather than quantity.' },
        { term: 'Consolidate across the year', detail: 'One 1,000-bottle order dispatched across four quarters costs less per bottle than four 250-bottle orders, and clears every minimum at once. Water keeps; ask about current stock dating if the event is far out.' },
        { term: 'Consolidate across teams or sites', detail: 'Two departments each wanting 300 bottles is one order of 600, one artwork approval and one delivery.' },
        { term: 'Ask anyway', detail: 'Tell us the real quantity and the real deadline. If it cannot be done at a sensible price we will say so, rather than quoting you a number designed to make you go away.' },
      ],
    },
    {
      id: 'planning',
      heading: 'Planning around the minimum',
      body: [
        'The MOQ is rarely the thing that goes wrong on a branded water order. Timing is.',
        `A run needs artwork, then ${PROOF_TIME} for the first proof, then however long your own approval takes, then ${LEAD_TIME} for production and delivery. The middle step is the one nobody budgets for: a proof that sits in an inbox over a weekend costs the same as a week of production.`,
        'If you have a fixed date, work backwards from it and set your internal approval deadline three weeks before, not one.',
      ],
    },
  ],

  faqs: [
    { q: 'What is the absolute smallest branded water order you will take?', a: '150 units of 1 litre. That is the lowest minimum across the three sizes and the cheapest way to get a branded bottle in your hands at all.' },
    { q: 'Can I order 100 bottles for a small event?', a: 'Not as a branded run — 100 falls under every size minimum. If it is genuinely a one-off for a small event, ask about sample quantities, or consider whether a 150-unit 1 litre run at a slightly higher unit cost is worth the difference to you.' },
    { q: 'Does the minimum apply per order or per year?', a: 'Per production run. A single annual commitment split into scheduled dispatches counts as one run, which is usually the cheapest way for a smaller business to buy.' },
    { q: 'Is the MOQ negotiable for a first order?', a: 'The changeover cost that sets it is not negotiable, but the shape of the order often is. Tell us what you actually need and we will tell you the cheapest legitimate way to get there.' },
    ...COMMON_FAQS,
  ],

  related: [
    'guides/custom-water-bottle-cost-india',
    'specifications',
    'guides/bottled-water-for-weddings',
  ],
}
