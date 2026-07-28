import { TrackInView } from '../analytics/TrackInView.jsx'
import { CustomizerSection } from '../sections/Customizer.jsx'
import { ProductsSection } from '../sections/Products.jsx'
import { PageShell } from '../site/PageShell.jsx'
import { useLazySection } from '../site/hooks'

/** Products: the three sizes, their MOQs, and the live label mockup. */
export function ProductsPage() {
  const { ref: customizerRef, visible: customizerVisible } = useLazySection()

  return (
    <PageShell route="products">
      <TrackInView event="section_viewed" sectionId="products"><ProductsSection /></TrackInView>
      {/* The section itself is lazy, so the anchor has to live on the wrapper —
          it is the only node that exists before the observer fires. This is what
          /products#customizer, and the hero's "Design Your Bottle" CTA, land on. */}
      <div id="customizer" ref={customizerRef} style={{ scrollMarginTop: 96 }}>
        {customizerVisible && (
          <TrackInView event="customizer_opened" sectionId="customizer">
            <CustomizerSection />
          </TrackInView>
        )}
      </div>
    </PageShell>
  )
}
