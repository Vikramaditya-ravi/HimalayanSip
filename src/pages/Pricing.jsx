import { TrackInView } from '../analytics/TrackInView.jsx'
import { FAQSection } from '../sections/FAQ.jsx'
import { HowWeWorkSection } from '../sections/HowWeWork.jsx'
import { PricingSection } from '../sections/Pricing.jsx'
import { PageShell } from '../site/PageShell.jsx'
import { RelatedResources } from '../site/Resources.jsx'

/**
 * Pricing: the tiers, and the questions buyers ask about them.
 *
 * The FAQ sits here rather than on its own URL because three of its seven
 * entries are about MOQ and rate structure — they answer the page they are on.
 * This is also the route that carries the FAQPage schema.
 */
export function PricingPage() {
  return (
    <PageShell route="pricing">
      <TrackInView event="section_viewed" sectionId="pricing"><PricingSection /></TrackInView>
      {/* This is the route that carries the FAQPage schema, so it is the one
          page where the questions are the destination. The disclosures go
          directly above them here for the same reason they do on home. */}
      <TrackInView event="section_viewed" sectionId="how-we-work"><HowWeWorkSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="faq"><FAQSection /></TrackInView>
      {/* Someone on the pricing page is comparing numbers, and the three pages
          that answer the question the table cannot — why it costs that, what
          the minimums mean, what a case actually contains — were reachable only
          from the footer. */}
      <RelatedResources
        placement="pricing"
        heading="Understand the pricing"
        intro="What drives the per-case rate, what the minimums mean in bottles, and the full specification behind what you are quoting for."
        slugs={[
          'guides/custom-water-bottle-cost-india',
          'guides/branded-water-bottle-moq',
          'specifications',
        ]}
      />
    </PageShell>
  )
}
