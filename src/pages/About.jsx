import { TrackInView } from '../analytics/TrackInView.jsx'
import { AboutSection } from '../sections/About.jsx'
import { HowWeWorkSection } from '../sections/HowWeWork.jsx'
import { PageShell } from '../site/PageShell.jsx'
import { RelatedResources } from '../site/Resources.jsx'

/** About: who we are. */
export function AboutPage() {
  return (
    <PageShell route="about">
      <TrackInView event="section_viewed" sectionId="about"><AboutSection /></TrackInView>
      {/* It was the tail of AboutSection until it became its own section. This
          page is still where it belongs most — the narrative above, the
          checkable structure directly under it. */}
      <TrackInView event="section_viewed" sectionId="how-we-work"><HowWeWorkSection /></TrackInView>
      {/* About says who we are; these say what we can evidence. The
          specification and standards pages are the honest follow-up to a page
          that is otherwise all narrative. */}
      <RelatedResources
        placement="about"
        heading="What we can evidence"
        intro="The published specification, the standards packaged drinking water is held to in India, and every question we get asked before an order."
        slugs={['specifications', 'guides/packaged-drinking-water-standards-india', 'faq']}
      />
    </PageShell>
  )
}
