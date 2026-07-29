import { serviceNode } from '../../site/schema'
import { COMMON_FAQS, LEAD_TIME } from '../shared'

export default {
  slug: 'delhi',
  title: 'Custom Branded Water Bottles in Delhi | AquaVia',
  description:
    'Branded bottled water delivered across Delhi — Connaught Place, Nehru Place, Aerocity, Okhla, Saket and Chanakyapuri. Bulk orders from 150 units with 5–10 day delivery.',
  keywords:
    'custom water bottles Delhi, branded water bottle supplier Delhi, bulk water bottles Connaught Place, corporate water Nehru Place',
  h1: 'Custom Branded Water Bottles in Delhi',
  breadcrumb: 'Delhi',
  linkText: 'branded water delivery in Delhi',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia delivers custom branded bottled water across Delhi, including Connaught Place, Nehru Place, Aerocity, Okhla, Saket and the Chanakyapuri diplomatic enclave. Orders start at 150 units per size and reach delivery 5–10 business days after label approval.',

  keyFacts: [
    { term: 'Areas covered', detail: 'Central, South, East, West and North Delhi' },
    { term: 'Business districts served', detail: 'Connaught Place, Nehru Place, Aerocity, Okhla, Jasola, Saket, Netaji Subhash Place' },
    { term: 'Minimum order', detail: '150 units (1 litre) / 250 (500ml) / 500 (250ml)' },
    { term: 'Lead time', detail: LEAD_TIME },
    { term: 'Typical delivery window', detail: 'Weekday mornings, outside the commercial-vehicle restriction hours' },
    { term: 'Common uses', detail: 'Offices, hotels, conferences at Bharat Mandapam and Pragati Maidan, restaurants, clinics' },
  ],

  sections: [
    {
      id: 'districts',
      heading: 'Where we deliver in Delhi',
      body: [
        'Delhi is not one delivery problem. A tower in Nehru Place, a hotel in Aerocity and a restaurant in Khan Market each need a different approach, and knowing which one you are is most of getting the delivery right.',
      ],
      list: [
        { term: 'Connaught Place and the central district', detail: 'Offices, banks and restaurants inside the Inner and Outer Circle. Vehicle access is time-restricted and parking is the constraint, so deliveries here are scheduled early.' },
        { term: 'Nehru Place and Kalkaji', detail: 'Dense IT and trading offices in tower blocks with shared service lifts. Lift booking matters more than road access.' },
        { term: 'Aerocity and the airport corridor', detail: 'Hotels and conference facilities. Security screening at the perimeter adds time and needs advance vehicle details.' },
        { term: 'Okhla, Jasola and Mohan Cooperative', detail: 'Industrial estates and corporate offices with proper loading access — the most straightforward deliveries in the city.' },
        { term: 'Saket, Vasant Kunj and South Delhi', detail: 'Malls, clinics, boutique hotels and studios. Mall deliveries go through goods entrances with fixed hours.' },
        { term: 'Chanakyapuri and the diplomatic enclave', detail: 'Missions and institutional buildings; entry requires prior notification and named personnel.' },
        { term: 'Netaji Subhash Place, Pitampura and North Delhi', detail: 'Offices and banquet venues.' },
        { term: 'Karol Bagh, Paharganj and Rajouri Garden', detail: 'Hotels and event venues with narrow approaches — smaller vehicles, earlier slots.' },
      ],
    },
    {
      id: 'who',
      heading: 'Who orders branded water in Delhi',
      body: [
        'The mix here is distinctive, and it is not the same mix as Gurugram or Noida.',
        'Delhi has the conference and exhibition calendar. Bharat Mandapam and Pragati Maidan between them run large events almost continuously, and every exhibitor with a stand wants branded bottles to hand visitors. Those orders are date-driven, quantity-uncertain until late, and the single most common reason someone calls us with three days’ notice.',
        'It also has the institutional business: government and PSU offices, embassies and high commissions, hospitals and diagnostic chains, and the professional-services firms clustered around the central district. These buy on schedule rather than by event, and they ask harder documentation questions than a corporate office does.',
        'And it has the hospitality density — Aerocity, the central luxury hotels, and a restaurant scene from Khan Market to Hauz Khas where own-branded table water is increasingly the norm rather than a novelty.',
      ],
    },
    {
      id: 'logistics',
      heading: 'Delivering in Delhi, practically',
      body: [
        'Three things shape a Delhi delivery more than distance does.',
      ],
      steps: [
        { term: 'Commercial vehicle hours', detail: 'Goods vehicle movement is restricted in parts of the city during the day. Deliveries are generally scheduled early morning, and a slot promised for 3pm in central Delhi is a slot someone has not thought about.' },
        { term: 'Building access', detail: 'Tower blocks in Nehru Place and Connaught Place have shared service lifts with booking systems. Give us the lift timing and the security desk process and the delivery lands first time.' },
        { term: 'Event venues', detail: 'Pragati Maidan and Bharat Mandapam have their own gate-pass and vehicle-entry procedures with lead times of their own. Start that paperwork when you place the order, not the week of the event.' },
      ],
      after: [
        'None of this is exotic — every supplier in the city deals with it. It is worth stating because the failure mode is always the same: a delivery that was possible fails because nobody mentioned the gate pass.',
      ],
    },
    {
      id: 'timing',
      heading: 'Planning around the Delhi calendar',
      body: [
        'Two seasonal effects are worth building into a plan.',
        'Summer, roughly April to June, changes consumption sharply. An outdoor event that needs three bottles a head in February needs six in May, and offices see pantry consumption rise by a third. If you set an annual supply schedule on winter numbers, you will run short exactly when running short is most visible.',
        'The wedding and conference season from October to March is the other. Demand across the whole NCR supply chain tightens in those months, and lead times that are comfortable in July are not comfortable in November. For a dated event in that window, order four weeks out rather than three.',
      ],
    },
  ],

  faqs: [
    { q: 'Do you deliver branded water bottles across all of Delhi?', a: 'Yes — central, south, east, west and north Delhi, including Connaught Place, Nehru Place, Aerocity, Okhla, Jasola, Saket, Vasant Kunj, Chanakyapuri and Netaji Subhash Place.' },
    { q: 'How quickly can I get branded bottles in Delhi?', a: 'Production and delivery run 5–10 business days after you approve the label proof, with the proof itself returning in 24–48 hours. For a dated event, allow three weeks — four during the October to March season.' },
    { q: 'Can you deliver to Pragati Maidan or Bharat Mandapam?', a: 'Yes. Both have their own vehicle-entry and gate-pass procedures with their own lead times, so start that paperwork when you place the order rather than the week of the event.' },
    { q: 'What is the minimum order for a Delhi business?', a: '150 units for 1 litre, 250 for 500ml, 500 for 250ml — the same across the service area.' },
    { q: 'Why are deliveries scheduled early in the morning?', a: 'Goods vehicle movement is restricted in parts of Delhi during the day. Early slots are how a central-district delivery arrives reliably rather than optimistically.' },
    ...COMMON_FAQS.slice(1),
  ],

  schema: () => [
    serviceNode({
      slug: 'delhi',
      name: 'Custom branded water bottle supply in Delhi',
      description:
        'Branded packaged drinking water delivered to offices, hotels, restaurants, clinics and event venues across Delhi.',
    }),
  ],

  related: ['gurugram', 'noida', 'specifications'],
}
