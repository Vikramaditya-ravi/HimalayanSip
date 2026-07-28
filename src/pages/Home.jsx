import { TrackInView } from '../analytics/TrackInView.jsx'
import { AboutSection } from '../sections/About.jsx'
import { ContactSection } from '../sections/Contact.jsx'
import { CustomizerSection } from '../sections/Customizer.jsx'
import { FAQSection } from '../sections/FAQ.jsx'
import { HeroSection } from '../sections/Hero.jsx'
import { HowItWorksSection } from '../sections/HowItWorks.jsx'
import { IndustriesSection } from '../sections/Industries.jsx'
import { JourneySection } from '../sections/Journey.jsx'
import { PricingSection } from '../sections/Pricing.jsx'
import { ProductsSection } from '../sections/Products.jsx'
import { ServicesSection } from '../sections/Services.jsx'
import { TestimonialsSection } from '../sections/Testimonials.jsx'
import { PageShell } from '../site/PageShell.jsx'
import { useLazySection } from '../site/hooks'

/**
 * Home: the whole pitch, in one scroll.
 *
 * Every section also has a dedicated route, and this page is not a substitute
 * for them — it renders the same components a second time. A visitor who lands
 * on / gets the full narrative from hero to contact without navigating; a
 * visitor who arrives on /pricing from search gets that one thing, with its own
 * title, description and canonical.
 *
 * Nothing here is a copy. These are the identical components src/pages/*.jsx
 * mount, so the two presentations cannot drift apart.
 *
 * Section order is the original single-page order, unchanged.
 *
 * The four heaviest sections below the fold are deferred. Home is the only page
 * that renders all twelve, so without this it would pull in Journey's inline SVG
 * and the customizer on first paint — the cost the per-route split was meant to
 * avoid. The dedicated routes stay eager: there the section IS the page.
 */
export function HomePage() {
  const journey = useLazySection('journey')
  const customizer = useLazySection('customizer')
  const testimonials = useLazySection('testimonials')
  const contact = useLazySection('contact')

  return (
    <PageShell route="home" padTop={false}>
      <TrackInView event="section_viewed" sectionId="hero">
        <HeroSection />
      </TrackInView>
      <TrackInView event="section_viewed" sectionId="about"><AboutSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="services"><ServicesSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="how"><HowItWorksSection /></TrackInView>

      {/* No id on this wrapper: JourneySection sets id="journey" on its own
          <section>, and two nodes sharing an id in one document is invalid.
          The deep link still lands, because useLazySection('journey') mounts the
          section up front when the hash asks for it. Same for #contact below. */}
      <div ref={journey.ref}>
        {journey.visible && (
          <TrackInView event="section_viewed" sectionId="journey"><JourneySection /></TrackInView>
        )}
      </div>

      <TrackInView event="section_viewed" sectionId="products"><ProductsSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="pricing"><PricingSection /></TrackInView>
      <TrackInView event="section_viewed" sectionId="industries"><IndustriesSection /></TrackInView>

      {/* These two carry no id of their own, so the anchor has to live on the
          wrapper — it is the only node that exists before the observer fires. */}
      <div id="customizer" ref={customizer.ref} style={{ scrollMarginTop: 96 }}>
        {customizer.visible && (
          <TrackInView event="customizer_opened" sectionId="customizer">
            <CustomizerSection />
          </TrackInView>
        )}
      </div>
      <div id="testimonials" ref={testimonials.ref} style={{ scrollMarginTop: 96 }}>
        {testimonials.visible && (
          <TrackInView event="section_viewed" sectionId="testimonials">
            <TestimonialsSection />
          </TrackInView>
        )}
      </div>

      <TrackInView event="section_viewed" sectionId="faq"><FAQSection /></TrackInView>

      {/* No section_viewed wrapper, matching /contact and the single-page
          original — the panel emits contact_form_viewed from inside itself. */}
      <div ref={contact.ref}>
        {contact.visible && <ContactSection />}
      </div>
    </PageShell>
  )
}
