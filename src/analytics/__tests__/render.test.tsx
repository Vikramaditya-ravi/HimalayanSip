import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../../App.jsx';

/**
 * Smoke test for the marketing page.
 *
 * Instrumentation restructured ProductCard and wrapped every section in
 * TrackInView. Those are JSX-structure changes to a live business page — the
 * build catches syntax errors but not a component that renders nothing, so this
 * asserts the page still produces its actual content.
 */

describe('marketing page renders after instrumentation', () => {
  const html = renderToString(<App />);

  it('renders the page shell', () => {
    expect(html.length).toBeGreaterThan(5000);
  });

  it('renders every section anchor', () => {
    for (const id of ['hero', 'about', 'services', 'journey', 'products', 'pricing', 'industries', 'faq', 'contact']) {
      expect(html, `missing section #${id}`).toContain(`id="${id}"`);
    }
  });

  it('renders the three bottle sizes with their prices', () => {
    for (const size of ['250ml', '500ml', '1 Litre']) {
      expect(html, `missing product ${size}`).toContain(size);
    }
    // The brochure rate, not the invented one it replaced.
    expect(html).toContain('₹5.67/bottle');
  });

  it('no longer offers the discontinued 100ml and 350ml sizes', () => {
    // Covers the product cards, the customizer size picker, the MOQ answers and
    // the JSON-LD alike — these sizes are not sold and must appear nowhere.
    for (const gone of ['100ml', '350ml', 'Nano', 'Slim']) {
      expect(html, `discontinued size ${gone} still rendered`).not.toContain(gone);
    }
  });

  it('renders the pricing tiers and the brochure download', () => {
    for (const tier of ['Signature', 'Preferred', 'Enterprise']) {
      expect(html, `missing tier ${tier}`).toContain(tier);
    }
    // Case price and its derived per-bottle line must both be present, since the
    // per-bottle figure is computed rather than written down.
    expect(html).toContain('₹8.33 / bottle');
    expect(html).toContain('/aquavia-pricing-brochure.pdf');
    expect(html).toContain('data-evt="pricing_brochure_downloaded"');
  });

  it('no longer publishes the superseded prices anywhere', () => {
    for (const stale of ['₹28/bottle', '₹18/bottle', '₹15/bottle', '₹12/bottle', '₹9/bottle']) {
      expect(html, `stale price ${stale} still rendered`).not.toContain(stale);
    }
  });

  it('renders all seven filtration stages as real text', () => {
    // The spec must be in the static HTML, not revealed by hover or a click:
    // crawlers and screen readers get it either way.
    for (const stage of [
      'Back-Wash Sand Filter', 'Double Y-Strainer', 'CTO Carbon Block',
      'Sediment Filter', 'RO Membrane', 'Activated Carbon', 'Ozonation',
    ]) {
      expect(html, `missing filtration stage ${stage}`).toContain(stage);
    }
    expect(html).toContain('id="filtration"');
  });

  it('renders the three contact channels instead of an enquiry form', () => {
    // The enquiry form was deliberately removed; the panel replaces it. If a
    // form comes back here, the funnel's terminal step assumptions break too.
    for (const channel of ['WhatsApp', 'Call the sales desk', 'Email us']) {
      expect(html, `missing channel ${channel}`).toContain(channel);
    }
    expect(html).not.toContain('<form');
  });

  it('renders the new search input', () => {
    expect(html).toContain('id="site-search"');
  });

  it('carries the data-evt attributes the delegated listener depends on', () => {
    // If these vanish, tracking degrades silently — no error, just missing events.
    expect(html).toContain('data-evt="product_cta_clicked"');
    expect(html).toContain('data-evt="industry_clicked"');
    expect(html).toContain('data-evt="contact_intent_clicked"');
    expect(html).toContain('data-sku="500ml"');
    // The caption may read "1 Litre", but the SKU that reaches the database is
    // the canonical one — otherwise one bottle splits across two dashboard rows.
    expect(html).toContain('data-sku="1L"');
    expect(html).not.toContain('data-sku="1 Litre"');
  });

  it('makes phone and email real links', () => {
    expect(html).toContain('href="tel:');
    expect(html).toContain('href="mailto:info@aquaviaworld.com"');
  });

  it('no longer ships the Web3Forms key in the bundle', () => {
    expect(html).not.toContain('1f5d2cae');
    expect(html).not.toContain('api.web3forms.com');
  });
});
