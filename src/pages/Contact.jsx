import { ContactSection } from '../sections/Contact.jsx'
import { PageShell } from '../site/PageShell.jsx'
import { RelatedResources } from '../site/Resources.jsx'

/**
 * Contact: the three channels, ranked.
 *
 * No section_viewed wrapper, matching the single-page original — the panel
 * emits contact_form_viewed from inside itself, which is the funnel step that
 * actually matters here.
 */
export function ContactPage() {
  return (
    <PageShell route="contact">
      <ContactSection />
      {/* Deliberately below the three channels, never above them: this page's
          job is to get a message sent. It is here for the reader who arrived
          not yet ready to ask, who would otherwise leave rather than browse. */}
      <RelatedResources
        placement="contact"
        heading="Not ready to ask yet?"
        intro="The three things people most often want settled before they message the sales desk."
        slugs={[
          'faq',
          'guides/custom-water-bottle-cost-india',
          'guides/branded-water-bottle-moq',
        ]}
      />
    </PageShell>
  )
}
