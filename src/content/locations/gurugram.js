import { serviceNode } from '../../site/schema'
import { COMMON_FAQS, LEAD_TIME } from '../shared'

export default {
  slug: 'gurugram',
  title: 'Custom Branded Water Bottles in Gurugram (Gurgaon) | AquaVia',
  description:
    'Branded bottled water delivered across Gurugram — Cyber City, Golf Course Road, Sohna Road, Udyog Vihar, MG Road and IMT Manesar. Bulk orders from 150 units.',
  keywords:
    'custom water bottles Gurgaon, branded water bottles Gurugram, corporate water supply Cyber City, bulk water bottles Sohna Road',
  h1: 'Custom Branded Water Bottles in Gurugram',
  breadcrumb: 'Gurugram',
  linkText: 'branded water delivery in Gurugram',
  publishedAt: '2026-07-29',
  updatedAt: '2026-07-29',
  answerBlock:
    'AquaVia delivers custom branded bottled water across Gurugram, including Cyber City, Golf Course Road, Sohna Road, Udyog Vihar, MG Road and IMT Manesar. Orders start at 150 units per size, with delivery 5–10 business days after label approval.',

  keyFacts: [
    { term: 'Business districts served', detail: 'Cyber City, Cyber Hub, Golf Course Road, Golf Course Extension, Sohna Road, Udyog Vihar, MG Road, Sector 44' },
    { term: 'Industrial areas', detail: 'IMT Manesar, Udyog Vihar Phases I–V' },
    { term: 'Minimum order', detail: '150 units (1 litre) / 250 (500ml) / 500 (250ml)' },
    { term: 'Lead time', detail: LEAD_TIME },
    { term: 'Dominant demand', detail: 'Corporate offices and multinational campuses' },
    { term: 'Common constraint', detail: 'Basement loading bays and managed-campus security' },
  ],

  sections: [
    {
      id: 'districts',
      heading: 'Where we deliver in Gurugram',
      list: [
        { term: 'Cyber City and Cyber Hub', detail: 'The densest corporate cluster in NCR — multinational offices in managed towers, plus a heavy restaurant and bar concentration in Cyber Hub itself. Deliveries go through basement bays with facility-management sign-in.' },
        { term: 'Golf Course Road and Golf Course Extension', detail: 'Corporate offices, luxury hotels and premium residential. Long stretch, multiple tower complexes, each with its own access rules.' },
        { term: 'Sohna Road and Sector 48–49', detail: 'Mid-size offices, co-working, clinics and a growing restaurant strip. Generally simpler access than Cyber City.' },
        { term: 'Udyog Vihar', detail: 'Older industrial and office estate across five phases. Proper loading access; some of the easiest deliveries in the city.' },
        { term: 'MG Road and Sector 28', detail: 'Malls, hotels and banqueting. Mall deliveries run through goods entrances on fixed hours.' },
        { term: 'Sector 44, Huda City Centre and Sector 29', detail: 'Offices and a substantial food-and-beverage cluster.' },
        { term: 'IMT Manesar', detail: 'Manufacturing plants and their canteens — large-volume, straightforward, high-frequency accounts.' },
        { term: 'New Gurugram, Sectors 80–95', detail: 'Newer corporate parks and residential clubhouses along the Dwarka Expressway corridor.' },
      ],
    },
    {
      id: 'who',
      heading: 'What Gurugram orders, and why it differs',
      body: [
        'Gurugram is the most corporate of the NCR markets and it buys differently from Delhi.',
        'The dominant account is the multinational or large domestic office: several hundred people, a facilities team with a procurement process, meeting rooms in constant use, and a preference for a standing weekly delivery over ad-hoc ordering. These accounts value predictability above almost everything, and they are exactly the profile our dispatch-frequency pricing was designed for.',
        'The second cluster is hospitality — the Golf Course Road and MG Road hotels, and the Cyber Hub restaurant density, where own-branded table water has become normal rather than distinctive.',
        'The third is manufacturing at IMT Manesar, which behaves differently again: high volume, litre bottles, canteen and shop-floor supply, and cost per litre as the deciding number.',
      ],
    },
    {
      id: 'logistics',
      heading: 'Delivering in Gurugram, practically',
      body: [
        'Access, not distance, is the whole problem here — and it is a different problem from Delhi’s.',
      ],
      steps: [
        { term: 'Managed campuses', detail: 'Cyber City towers and the larger Golf Course Road complexes are managed properties with their own vendor registration, gate passes and delivery windows. First delivery to a new address takes the longest; subsequent ones are routine once the vendor record exists.' },
        { term: 'Basement bays and service lifts', detail: 'Most towers deliver through a basement bay to a service lift with a booking system. Give us the lift slot and the delivery lands first time.' },
        { term: 'Monsoon waterlogging', detail: 'Parts of the Golf Course Road and NH-48 corridor flood in heavy rain, and delivery times move accordingly. For a dated event in July or August, do not schedule the delivery for the morning of.' },
        { term: 'Manesar timing', detail: 'IMT Manesar deliveries are best scheduled against shift changes rather than against your own calendar — the gate is busiest exactly when shifts turn over.' },
      ],
    },
    {
      id: 'buying-well',
      heading: 'How Gurugram accounts buy well',
      body: [
        'Two observations specific to this market.',
        'First: consolidate across floors and entities. It is common for a company here to have three business units in the same tower, each ordering separately, each at entry rates. One account with a combined weekly dispatch drops all of them into a better tier without changing anything else.',
        'Second: many Gurugram offices run a hybrid attendance pattern, which makes consumption uneven across the week rather than lower overall. Tuesday to Thursday can be double Monday and Friday. A flat weekly delivery against an average leaves you short mid-week and overstocked by Friday — tell us the pattern and we will shape the schedule to it.',
      ],
    },
  ],

  faqs: [
    { q: 'Do you deliver branded water bottles in Cyber City?', a: 'Yes. Cyber City and Cyber Hub deliveries go through basement loading bays with facility-management sign-in. The first delivery to a new tower takes longest while vendor registration is set up; after that it is routine.' },
    { q: 'Which areas of Gurugram do you cover?', a: 'Cyber City, Golf Course Road and Extension, Sohna Road, Udyog Vihar, MG Road, Sector 29 and 44, Huda City Centre, the Dwarka Expressway sectors and IMT Manesar.' },
    { q: 'Can you supply a manufacturing canteen at IMT Manesar?', a: 'Yes. Canteen supply is usually 1 litre bottles at high frequency, where cost per litre is the deciding number. Deliveries are best scheduled away from shift changes.' },
    { q: 'How long does delivery take in Gurugram?', a: '5–10 business days after label approval, with the proof back in 24–48 hours. Standing weekly schedules run to a fixed day once the account is set up.' },
    { q: 'We have several teams in one building ordering separately — does that matter?', a: 'It costs you money. Consolidating into one account with a combined weekly dispatch usually moves the whole building into a better rate tier without any other change.' },
    ...COMMON_FAQS.slice(1),
  ],

  schema: () => [
    serviceNode({
      slug: 'gurugram',
      name: 'Custom branded water bottle supply in Gurugram',
      description:
        'Branded packaged drinking water delivered to corporate offices, hotels, restaurants and manufacturing canteens across Gurugram and IMT Manesar.',
    }),
  ],

  related: ['delhi', 'for/corporate-offices', 'specifications'],
}
