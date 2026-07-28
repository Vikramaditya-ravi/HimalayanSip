import { ContactSection } from '../sections/Contact.jsx'
import { PageShell } from '../site/PageShell.jsx'

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
    </PageShell>
  )
}
