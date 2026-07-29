import { TrackInView } from '../analytics/TrackInView.jsx'
import { HowItWorksSection } from '../sections/HowItWorks.jsx'
import { JourneySection } from '../sections/Journey.jsx'
import { PageShell } from '../site/PageShell.jsx'
import { RelatedResources } from '../site/Resources.jsx'

/** Process: how an order runs, and how the water is actually made. */
export function ProcessPage() {
  return (
    <PageShell route="process">
      <TrackInView event="section_viewed" sectionId="how"><HowItWorksSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="journey"><JourneySection /></TrackInView>
      {/* The seven stages raise exactly three follow-up questions, and each one
          has a page. A procurement reader checking whether the treatment claim
          is credible is the reader most likely to want them. */}
      <RelatedResources
        placement="process"
        heading="How the water is treated"
        intro="The filtration and standards questions the seven stages raise, answered at length."
        slugs={[
          'guides/how-ro-filtration-works',
          'guides/packaged-drinking-water-standards-india',
          'guides/ideal-tds-drinking-water',
        ]}
      />
    </PageShell>
  )
}
