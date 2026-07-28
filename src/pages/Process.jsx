import { TrackInView } from '../analytics/TrackInView.jsx'
import { HowItWorksSection } from '../sections/HowItWorks.jsx'
import { JourneySection } from '../sections/Journey.jsx'
import { PageShell } from '../site/PageShell.jsx'

/** Process: how an order runs, and how the water is actually made. */
export function ProcessPage() {
  return (
    <PageShell route="process">
      <TrackInView event="section_viewed" sectionId="how"><HowItWorksSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="journey"><JourneySection /></TrackInView>
    </PageShell>
  )
}
