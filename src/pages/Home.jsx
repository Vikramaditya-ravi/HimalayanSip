import { TrackInView } from '../analytics/TrackInView.jsx'
import { HeroSection } from '../sections/Hero.jsx'
import { IndustriesSection } from '../sections/Industries.jsx'
import { ServicesSection } from '../sections/Services.jsx'
import { TestimonialsSection } from '../sections/Testimonials.jsx'
import { PageShell } from '../site/PageShell.jsx'
import { useLazySection } from '../site/hooks'

/**
 * Home: the pitch and the proof.
 *
 * Section views were the stand-in for page views when this was one long page.
 * They still are within a page — what changed is that there are now six real
 * page views underneath them, one per route.
 */
export function HomePage() {
  const { ref: testimonialsRef, visible: testimonialsVisible } = useLazySection()

  return (
    <PageShell route="home" padTop={false}>
      <TrackInView event="section_viewed" sectionId="hero">
        <HeroSection />
      </TrackInView>
      <TrackInView event="section_viewed" sectionId="services"><ServicesSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="industries"><IndustriesSection /></TrackInView>
      {/* The section itself is lazy, so the anchor has to live on the wrapper —
          it is the only node that exists before the observer fires. */}
      <div id="testimonials" ref={testimonialsRef} style={{ scrollMarginTop: 96 }}>
        {testimonialsVisible && (
          <TrackInView event="section_viewed" sectionId="testimonials">
            <TestimonialsSection />
          </TrackInView>
        )}
      </div>
    </PageShell>
  )
}
