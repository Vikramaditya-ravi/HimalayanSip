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
    for (const id of ['hero', 'about', 'services', 'journey', 'products', 'industries', 'faq', 'contact']) {
      expect(html, `missing section #${id}`).toContain(`id="${id}"`);
    }
  });

  it('renders all five bottle sizes with their prices', () => {
    for (const size of ['100ml', '250ml', '350ml', '500ml', '1 Litre']) {
      expect(html, `missing product ${size}`).toContain(size);
    }
    expect(html).toContain('₹18/bottle');
  });

  it('renders the contact form fields', () => {
    for (const field of ['name', 'company', 'email', 'phone', 'quantity', 'message']) {
      expect(html, `missing field ${field}`).toContain(`name="${field}"`);
    }
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
  });

  it('makes phone and email real links', () => {
    expect(html).toContain('href="tel:');
    expect(html).toContain('href="mailto:hello@aquavia.in"');
  });

  it('no longer ships the Web3Forms key in the bundle', () => {
    expect(html).not.toContain('1f5d2cae');
    expect(html).not.toContain('api.web3forms.com');
  });
});
