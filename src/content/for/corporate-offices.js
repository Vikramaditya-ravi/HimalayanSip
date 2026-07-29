import { serviceNode } from '../../site/schema'
import { COMMON_FAQS } from '../shared'

export default {
  slug: 'for/corporate-offices',
  title: 'Branded Bottled Water for Corporate Offices in Delhi NCR | AquaVia',
  description:
    'Own-branded bottled water for offices across Delhi, Gurugram and Noida — meeting rooms, reception, pantries and all-hands — with scheduled dispatch and multi-site delivery.',
  keywords:
    'office water bottles branded, corporate water supply Delhi NCR, custom water bottles for office, meeting room water bottles',
  h1: 'Branded Bottled Water for Corporate Offices',
  breadcrumb: 'Corporate offices',
  linkText: 'branded water for offices',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia supplies offices across Delhi NCR with bottled water carrying the company’s own branding — 500ml for meeting rooms and reception, 1 litre for pantries and desks. Minimum orders start at 150 units, and multi-site deliveries across Gurugram, Noida and Delhi are handled on a single schedule.',

  keyFacts: [
    { term: 'Meeting rooms and reception', detail: '500ml — one serving, presentable on a table' },
    { term: 'Pantry and desk supply', detail: '1 litre — lowest cost per litre' },
    { term: 'Town halls and offsites', detail: '500ml, ordered against the headcount plus 20%' },
    { term: 'Multi-site', detail: 'Split deliveries across NCR offices on one order' },
    { term: 'Label stock', detail: 'Matte paper for boardrooms, BOPP if bottles are chilled' },
    { term: 'Minimum order', detail: '150 units (1 litre) / 250 (500ml) / 500 (250ml)' },
  ],

  sections: [
    {
      id: 'why',
      heading: 'What it changes in an office',
      body: [
        'The meeting room is where this earns its keep. A client sits down opposite a bottle carrying your mark rather than a supermarket brand, and the room reads as a company that pays attention. It is a small thing that costs about five rupees and is noticed considerably more often than the expensive things are.',
        'Internally the effect is different and worth naming honestly: it is not motivational. Nobody works harder because the water is branded. What it does do is make a workplace feel deliberate rather than assembled — the same reason companies bother with a decent coffee machine and consistent signage.',
        'The third argument is procurement. A single supplier on a scheduled dispatch replaces a rolling problem — someone noticing the pantry is empty, someone else placing an order, a delivery arriving at a time nobody planned for — with a line item and a calendar.',
      ],
    },
    {
      id: 'where',
      heading: 'Where the bottles go',
      table: {
        caption: 'Placement and size in a typical office',
        head: ['Placement', 'Size', 'Notes'],
        rows: [
          ['Meeting and board rooms', '500ml', 'One per seat, replaced between meetings'],
          ['Reception and visitor waiting', '500ml', 'Chilled, offered on arrival'],
          ['Pantry and open desks', '1 litre', 'Cost per litre is the only consideration here'],
          ['Town halls and all-hands', '500ml', 'Headcount plus 20%'],
          ['Offsites and training days', '500ml', 'Two per person per day'],
          ['Welcome kits for new joiners', '250ml', 'Part of the desk set on day one'],
          ['Client gifting and hampers', '250ml', 'Matte or foil finish, handled dry'],
        ],
      },
    },
    {
      id: 'volume',
      heading: 'Working out your volume',
      body: [
        'The number most offices get wrong is meeting-room consumption, because it is driven by meetings rather than by headcount.',
        'A reasonable starting model: for pantry supply, budget one 1 litre bottle per person per two working days. For meeting rooms, count the seats in each room, multiply by the number of meetings a day you actually hold in it, and take 60% — not every bottle put out is taken.',
        'A 60-person office with four meeting rooms typically lands around 600–800 bottles a month across both sizes. That is comfortably above every minimum order quantity, and comfortably into a weekly dispatch schedule, which is where the rate improves.',
      ],
    },
    {
      id: 'multi-site',
      heading: 'Multiple offices across NCR',
      body: [
        'This is where consolidating matters. A company with offices in Gurugram, Noida and central Delhi buying separately is three accounts, three dispatch frequencies and three entry-tier rates. Consolidated, it is one account whose combined frequency sits in a better tier, with the delivery split across the three addresses.',
        'The practical requirement is that we get the split by address at order time rather than afterwards, along with each site’s access constraints — basement loading bays, goods-lift timings, gate passes and security desks are the things that turn a routine delivery into a failed one.',
      ],
    },
    {
      id: 'labels',
      heading: 'Label choice for an office',
      body: [
        'Offices are the one setting where paper stock is genuinely the better choice, because office bottles are usually handled at room temperature rather than pulled out of ice.',
        'Matte paper has a tactile, non-reflective quality that photographs well and reads as considered on a boardroom table. If your bottles are stored chilled and served with condensation on them — common in summer — switch to BOPP film, which will not mark.',
        'A restrained mark on a clean field consistently looks more expensive than a full-bleed logo wrap. The bottle is not an advertisement; it is a signal that the details are handled.',
      ],
    },
  ],

  faqs: [
    { q: 'How many water bottles does an office need per month?', a: 'A useful starting model is one 1 litre bottle per person per two working days for pantry supply, plus meeting-room consumption based on seats × meetings × 60%. A 60-person office with four meeting rooms typically uses 600–800 bottles a month.' },
    { q: 'Can you deliver to several of our offices on one order?', a: 'Yes. Give us the split by address at order time along with any access constraints, and the order dispatches to each site. Consolidating sites also improves your rate tier.' },
    { q: 'Is branded water cheaper than a water cooler contract?', a: 'Not always on cost per litre alone, and we would rather say so. It is competitive on 1 litre bottles, and it buys presentation and portability that a cooler does not — which is why most offices use both rather than replacing one with the other.' },
    { q: 'What is the minimum order for an office?', a: '150 units of 1 litre, 250 of 500ml, or 500 of 250ml. Any office of more than about twenty people clears these in a single month.' },
    { q: 'Which label finish suits a corporate office?', a: 'Matte paper, if bottles are handled at room temperature — it looks the most considered on a boardroom table. Use BOPP film if you store and serve them chilled.' },
    ...COMMON_FAQS,
  ],

  schema: () => [
    serviceNode({
      slug: 'for/corporate-offices',
      name: 'Branded bottled water supply for corporate offices',
      description:
        'Own-branded packaged drinking water for meeting rooms, reception, pantries and company events, delivered on schedule to single or multiple office sites across Delhi NCR.',
    }),
  ],

  related: [
    'guides/corporate-gifting-branded-water',
    'guides/custom-water-bottle-cost-india',
    'specifications',
  ],
}
