import { TrackInView } from '../analytics/TrackInView.jsx'
import { AboutSection } from '../sections/About.jsx'
import { PageShell } from '../site/PageShell.jsx'

/** About: who we are. */
export function AboutPage() {
  return (
    <PageShell route="about">
      <TrackInView event="section_viewed" sectionId="about"><AboutSection /></TrackInView>
    </PageShell>
  )
}
