import { serviceNode } from '../../site/schema'
import { COMMON_FAQS, LEAD_TIME, PROOF_TIME } from '../shared'

export default {
  slug: 'for/weddings-and-events',
  title: 'Personalised Water Bottles for Weddings & Events in Delhi NCR | AquaVia',
  description:
    'Personalised bottled water for weddings, conferences, launches and exhibitions across Delhi NCR — quantities, timelines, label stock that survives ice, and venue delivery.',
  keywords:
    'personalised water bottles wedding, event water bottles Delhi, conference water bottles NCR, custom water bottle labels event',
  h1: 'Personalised Bottled Water for Weddings and Events',
  breadcrumb: 'Weddings & events',
  linkText: 'personalised water for weddings and events',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia produces personalised bottled water for weddings, conferences, launches and exhibitions across Delhi NCR. 500ml is the event standard at two to six bottles per guest per day depending on season and venue. Order three weeks before the date; production runs 2–3 business days after proof approval.',

  keyFacts: [
    { term: 'Event standard size', detail: '500ml — one serving, held in one hand, finished' },
    { term: 'Wedding quantity', detail: '2–3 per guest per day indoors, 4–6 outdoors in summer' },
    { term: 'Conference quantity', detail: '2 per delegate per day, plus 20% for staff and crew' },
    { term: 'Label stock', detail: 'BOPP film — event bottles live in ice' },
    { term: 'Order by', detail: 'Three weeks before the date' },
    { term: 'Production after approval', detail: LEAD_TIME },
  ],

  sections: [
    {
      id: 'events',
      heading: 'The event types this suits',
      list: [
        { term: 'Weddings and receptions', detail: 'Names, date or monogram on the label. The bottles appear in a great many photographs, which is most of the value.' },
        { term: 'Conferences and summits', detail: 'Delegate bags and table service. Removes the water-cooler queue during sessions.' },
        { term: 'Product launches', detail: 'Launch branding on the bottle, cold, in the guest’s hand within a minute of arrival.' },
        { term: 'Exhibitions and trade stands', detail: 'The most reliable way to make a visitor stop walking is to hand them something cold.' },
        { term: 'Sports and community events', detail: '500ml at the finish line; 1 litre in team and crew areas.' },
        { term: 'Film and production units', detail: 'Unit branding, high volume, delivered to location.' },
      ],
    },
    {
      id: 'quantities',
      heading: 'How many bottles to order',
      body: [
        'Two variables dominate: whether people are outdoors, and what month it is. In Delhi NCR the difference between an air-conditioned February reception and an outdoor May sangeet is roughly double.',
      ],
      table: {
        caption: 'Bottles per person per day',
        head: ['Setting', '500ml bottles per person per day'],
        rows: [
          ['Indoor, air-conditioned, winter', '2–3'],
          ['Indoor conference, full day', '2–3'],
          ['Outdoor evening, spring or autumn', '3–5'],
          ['Outdoor daytime, April–June', '5–7'],
          ['Exhibition stand (visitors, not attendees)', 'Estimate from footfall, not headcount'],
        ],
      },
      after: [
        'Add 15–20% on top for staff, vendors, crew, drivers and photographers. They are on site longest, working hardest, and are the group most consistently left out of the count.',
        'A fuller worked example, including a 300-guest two-day wedding, is in the guide to bottled water for weddings.',
      ],
    },
    {
      id: 'timeline',
      heading: 'The timeline',
      steps: [
        { term: 'Four weeks out', detail: 'Confirm the count you will plan against; brief or send the label artwork.' },
        { term: 'Three weeks out', detail: `Approve the proof — it comes back within ${PROOF_TIME}. This is the step that runs late, not production.` },
        { term: 'Two weeks out', detail: `Production and delivery take ${LEAD_TIME} from approval, so this window is your buffer.` },
        { term: 'Delivery week', detail: 'Confirm the delivery point, the access and who will sign for it at the venue.' },
        { term: 'Day before', detail: 'Start chilling. Icing several thousand bottles takes far longer than people expect.' },
      ],
    },
    {
      id: 'labels',
      heading: 'Label stock for events: one recommendation',
      body: [
        'BOPP film, without qualification.',
        'Event bottles go into ice tubs, coolers and buckets. A paper label in an ice tub cockles within the hour, the ink bleeds and the edges lift — and it is not recoverable on the day. This is the most common and most avoidable failure in event water orders, and it happens because the decision gets made on how the proof looks rather than on where the bottle will be.',
        'If the presentation needs to be more than clean, foil accents on a BOPP base give the premium read without the failure mode.',
      ],
    },
    {
      id: 'venue',
      heading: 'Venue logistics',
      list: [
        { term: 'Chilling capacity', detail: 'Ask the venue how many bottles they can actually ice at once. The honest answer is often far below your order.' },
        { term: 'Storage', detail: 'A 3,000-bottle order is 125 cases. Confirm a dry, secure space before the delivery, not on the morning.' },
        { term: 'Access', detail: 'Farmhouses, banquet halls and exhibition centres frequently have narrow approaches, restricted vehicle hours or no loading bay. Tell us in advance.' },
        { term: 'Who signs', detail: 'Name a person at the venue. Deliveries that arrive with nobody expecting them are the ones that go wrong.' },
        { term: 'Leftovers', detail: 'Water keeps. Ask for current stock dating if you want to carry surplus to a later function.' },
      ],
    },
  ],

  faqs: [
    { q: 'How many water bottles do I need for an event?', a: 'Two to three 500ml bottles per person per day indoors, four to six outdoors in a Delhi NCR summer, plus 15–20% for staff, vendors and crew. Count exhibition stands from footfall rather than headcount.' },
    { q: 'How far in advance should I order personalised event bottles?', a: 'Three weeks before the date. Production and delivery run 2–3 business days after you approve the proof, and it is almost always the approval — not the printing — that slips.' },
    { q: 'What size bottle works best at an event?', a: '500ml. It is one serving, fits a hand and a table setting, and gets finished. 250ml doubles your effective count because people take a second, and a litre bottle gets half-drunk and abandoned at a standing function.' },
    { q: 'Which label material should event bottles use?', a: 'BOPP film. Event bottles live in ice, and paper labels are ruined within an hour of getting wet.' },
    { q: 'Can you deliver directly to the venue?', a: 'Yes. Give us the venue address, the access constraints and a named contact who will be there to receive it.' },
    ...COMMON_FAQS,
  ],

  schema: () => [
    serviceNode({
      slug: 'for/weddings-and-events',
      name: 'Personalised bottled water for weddings and events',
      description:
        'Personalised packaged drinking water with custom labels for weddings, conferences, launches and exhibitions, delivered to venues across Delhi NCR.',
    }),
  ],

  related: [
    'guides/bottled-water-for-weddings',
    'guides/water-bottle-label-materials',
    'guides/branded-water-bottle-moq',
  ],
}
