import { PRODUCTS, moqFull } from '../../site/data'
import { COMMON_FAQS, LEAD_TIME, PROOF_TIME, UNIT_NOTE, sizeTable } from '../shared'

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
    'AquaVia’s minimum order is one batch: 100 units of 1 litre, 145 units of 500ml or 180 units of 250ml. A unit is a case — 12, 24 and 36 bottles respectively — so those batches are 1,200, 3,480 and 6,480 bottles. A batch is a full mini-truck load, and sizes can be mixed freely as long as the combined quantity fills the vehicle.',

  keyFacts: PRODUCTS.map((p) => ({ term: `${p.size} minimum`, detail: moqFull(p) })).concat([
    { term: 'What a unit is', detail: UNIT_NOTE },
    { term: 'Lowest entry point', detail: '100 units of 1 litre — 1,200 bottles' },
    { term: 'Why they differ', detail: 'All three are the same thing — one batch, one full mini truck — counted in different sizes' },
    { term: 'Mixed orders', detail: 'Sizes mix freely; only the combined load has to fill the truck' },
  ]),

  sections: [
    {
      id: 'the-numbers',
      heading: 'The numbers',
      table: sizeTable('Minimum order quantity by size'),
      after: [
        'The lowest entry point into a branded run is one batch of 100 units of 1 litre. Read that as cases, not bottles: a unit is a case of 12, so a batch is 1,200 bottles and a single mini-truck load. It is the smallest quantity that can leave the plant as its own labelled run.',
      ],
    },
    {
      id: 'why',
      heading: 'Why minimum order quantities exist',
      body: [
        'An MOQ is not a sales tactic, and it is worth understanding what it is actually protecting, because that tells you where there is flexibility and where there is not.',
        'Two fixed costs sit underneath it. The first is delivery: a mini truck costs the same to load, drive and unload whether it leaves full or half empty, which is why our minimum is simply one full truck. The second is changeover. Printing a label means preparing artwork, mounting it, running the press up to colour, and — critically — stopping the filling line, clearing the previous label, running yours through, and stopping again. That changeover cost is identical whether you order one batch or fifty.',
        'So the MOQ is the point below which the price per bottle stops being about water at all. A supplier who waives it is either absorbing those costs, or charging you for them somewhere less visible.',
      ],
    },
    {
      id: 'by-size',
      heading: 'Why the minimum looks different for each size',
      body: [
        'They are not really three different minimums. They are one minimum — a single batch, a full mini truck — expressed in three sizes. 180 units of 250ml, 145 of 500ml and 100 of 1 litre are the same vehicle, loaded three ways.',
        'The counts are in units, and a unit is a case: 36 bottles at 250ml, 24 at 500ml, 12 at 1 litre. In bottles the same three batches are 6,480, 3,480 and 1,200 — which is the figure to plan consumption against, and the reason a litre order is the smallest commitment of the three.',
        'It also means mixing is straightforward. Half a load of 500ml and half a load of 1 litre — say 73 units and 50 — is one full truck and one delivery, and clears the minimum exactly as a single-size order does.',
      ],
    },
    {
      id: 'below-moq',
      heading: 'What to do if your requirement is smaller',
      body: ['Four honest options, in the order we would suggest them.'],
      steps: [
        { term: 'Mix sizes, or move up a size', detail: 'The minimum is a full truck, not a per-size hurdle, so 120 units of 250ml plus a few dozen units of 1 litre clears it. And if you want a single size, the 1 litre batch — 100 units, 1,200 bottles — is the smallest commitment of the three.' },
        { term: 'Consolidate across the year', detail: 'A year’s requirement committed once and dispatched across four quarters costs less per case than four separate runs, and clears the minimum on the first one. Water keeps; ask about current stock dating if the event is far out.' },
        { term: 'Consolidate across teams or sites', detail: 'Two departments each wanting half a truck is one full load, one artwork approval and one delivery — and one label both are happy to carry.' },
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
    { q: 'What is the absolute smallest branded water order you will take?', a: '100 units of 1 litre — 1,200 bottles, since a unit is a case of 12. That is the lowest minimum across the three sizes and the cheapest way to get a branded bottle in your hands at all.' },
    { q: 'Can I order 200 bottles for a small event?', a: 'Not as a branded run. 200 bottles is roughly 17 cases of litre bottles against a 100-unit batch, so it does not fill a truck. If it is genuinely a one-off, ask about sample quantities, or find the other teams in your organisation who will use the rest of the batch across the year.' },
    { q: 'Does the minimum apply per order or per year?', a: 'Per production run. A single annual commitment split into scheduled dispatches counts as one run, which is usually the cheapest way for a smaller business to buy.' },
    { q: 'Is the MOQ negotiable for a first order?', a: 'The delivery and changeover costs that set it are not negotiable, but the shape of the order often is. Tell us what you actually need and we will tell you the cheapest legitimate way to get there.' },
    ...COMMON_FAQS,
  ],

  related: [
    'guides/custom-water-bottle-cost-india',
    'specifications',
    'guides/bottled-water-for-weddings',
  ],
}
