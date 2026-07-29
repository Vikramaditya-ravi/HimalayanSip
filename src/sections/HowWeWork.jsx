import { useReveal } from '../site/hooks'

/**
 * How the business actually works, said plainly.
 *
 * This block exists because the pages around it are positioning, and nothing a
 * buyer could check. Procurement teams and answer engines both reward a supplier
 * that states its own structure — including the parts that are not flattering —
 * over one that implies capabilities it does not own. Every line here is either
 * verifiable or an admission that something is not yet verified.
 *
 * It used to be a tail block inside AboutSection, which put it in the middle of
 * a page rather than in front of the questions it answers. It is its own section
 * now so it can sit directly above the FAQ, where a reader is already in the
 * mood to check something.
 *
 * The six items are deliberately numbered rather than iconified. They are
 * disclosures, not features, and a grid of decorative icons would dress them up
 * as selling points.
 */
const MODEL = [
  { t: 'We are the brand owner, not the bottler',
    d: 'AquaVia designs and prints the label, manages the order and delivers it. The water is filled at a licensed partner plant. We say so on every page rather than implying we own a factory.' },
  { t: 'The licences sit with the plant',
    d: 'BIS certification under IS 14543 and the FSSAI licence belong to our bottling partner, not to AquaVia. We do not claim an ISI mark in our own name, and we will obtain the plant’s licence details for your procurement file on request.' },
  { t: 'We publish numbers we can evidence',
    d: 'Prices, minimum orders, case counts and lead times come from the rate card and appear on /specifications. Figures we have not been given — TDS, mineral analysis — are absent rather than estimated.' },
  { t: 'Delhi NCR, and only Delhi NCR',
    d: 'Delhi, Gurugram, Noida, Greater Noida, Faridabad and Ghaziabad. Anything further is quoted case by case rather than promised as pan-India coverage we do not currently have.' },
  { t: 'No forms between you and a person',
    d: 'WhatsApp, phone and email reach the people who price the order. There is no ticket queue and no enquiry form on the contact page — that was removed deliberately.' },
  { t: 'Client quotes are labelled illustrative',
    d: 'The testimonials on this site are representative, not attributed to named consenting clients, and are marked as such. No review or rating markup is published anywhere until that changes.' },
]

export function HowWeWorkSection() {
  const ref = useReveal()
  return (
    <section id="how-we-work" className="sec hww" aria-labelledby="how-we-work-heading">
      <div className="hww-inner">
        <div ref={ref} className="reveal hww-head">
          <span className="res-eyebrow">How we work</span>
          <h2 id="how-we-work-heading" className="hww-h2">Six things we will not overstate</h2>
          {/* The lede is written to be lifted whole: it says what the list is
              and why it exists, without needing the list for context. */}
          <p className="hww-intro answer-block">
            Before the questions, the structure behind the answers — who owns what,
            which numbers we can evidence, and where our service area actually ends.
          </p>
        </div>

        <ol className="hww-grid">
          {MODEL.map((item, i) => (
            <HowWeWorkItem key={item.t} item={item} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}

function HowWeWorkItem({ item, index }) {
  const ref = useReveal()
  return (
    <li ref={ref} className="reveal hww-card" style={{ transitionDelay: `${index * 0.06}s` }}>
      <span className="hww-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <h3 className="hww-card-t">{item.t}</h3>
      <p className="hww-card-d">{item.d}</p>
    </li>
  )
}
