import { TrackInView } from '../analytics/TrackInView.jsx'
import { FAQSection } from '../sections/FAQ.jsx'
import { PricingSection } from '../sections/Pricing.jsx'
import { PageShell } from '../site/PageShell.jsx'

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
      <TrackInView event="section_viewed" sectionId="faq"><FAQSection /></TrackInView>
    </PageShell>
  )
}
