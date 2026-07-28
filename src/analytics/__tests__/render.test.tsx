import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AboutPage } from '../../pages/About.jsx';
import { ContactPage } from '../../pages/Contact.jsx';
import { HomePage } from '../../pages/Home.jsx';
import { PricingPage } from '../../pages/Pricing.jsx';
import { ProcessPage } from '../../pages/Process.jsx';
import { ProductsPage } from '../../pages/Products.jsx';

/**
 * Smoke test for the marketing site.
 *
 * Instrumentation restructured ProductCard and wrapped every section in
 * TrackInView. Those are JSX-structure changes to a live business page — the
 * build catches syntax errors but not a component that renders nothing, so this
 * asserts the pages still produce their actual content.
 *
 * This used to render one <App /> holding every section. The site is now six
 * routes, so each page is rendered on its own and the section anchors are
 * asserted per page — a section that silently lands on the wrong route is
 * exactly the regression this split could introduce. Content assertions run
 * against all six concatenated, since a price is equally wrong wherever it
 * appears.
 */

const PAGES = {
  '/': renderToString(<HomePage />),
  '/products': renderToString(<ProductsPage />),
  '/pricing': renderToString(<PricingPage />),
  '/process': renderToString(<ProcessPage />),
  '/about': renderToString(<AboutPage />),
  '/contact': renderToString(<ContactPage />),
};

const html = Object.values(PAGES).join('');

/**
 * Which anchors each route must render.
 *
 * #testimonials and #customizer are the lazy wrappers — the sections behind them
 * mount only once an IntersectionObserver fires, which never happens in
 * renderToString, but the anchor itself has to exist or /products#customizer
 * lands nowhere.
 *
 * Home lists fewer anchors than it renders in a browser, for that same reason:
 * Journey and Contact are lazy there and carry their ids on the section rather
 * than on the wrapper, so neither id is in the server-rendered string. What is
 * asserted here is what a non-executing crawler actually receives.
 */
const SECTIONS: Record<string, string[]> = {
  '/': ['hero', 'about', 'services', 'how', 'products', 'pricing', 'industries', 'customizer', 'testimonials', 'faq'],
  '/products': ['products', 'customizer'],
  '/pricing': ['pricing', 'faq'],
  '/process': ['how', 'journey', 'filtration'],
  '/about': ['about'],
  '/contact': ['contact'],
};

describe('marketing site renders after the multi-page split', () => {
  it('renders every page shell', () => {
    for (const [route, page] of Object.entries(PAGES)) {
      expect(page.length, `${route} rendered almost nothing`).toBeGreaterThan(2000);
    }
  });

  it('renders each section anchor on home and on its own route', () => {
    for (const [route, ids] of Object.entries(SECTIONS)) {
      for (const id of ids) {
        expect(PAGES[route as keyof typeof PAGES], `${route} is missing #${id}`).toContain(`id="${id}"`);
      }
    }
  });

  it('keeps sections off every route but home and their own', () => {
    /**
     * This assertion used to be "on its own route, and nowhere else" — a section
     * on two URLs was treated as duplicate content by definition.
     *
     * Home is now a deliberate exception: it renders all twelve sections as one
     * scroll, the same components the dedicated routes mount. The duplication is
     * handled where it actually matters instead — each route declares its own
     * canonical, title and description (ROUTES in src/site/data.js), and the
     * Product and FAQPage schemas stay attached only to /products and /pricing
     * so no two URLs compete for the same rich result.
     *
     * What still has to hold is that the dedicated routes stay focused: /about
     * must not sprout a pricing table, or its canonical is describing a page
     * that is really the whole site again.
     */
    const dedicated = Object.entries(SECTIONS).filter(([route]) => route !== '/');
    for (const [route, ids] of dedicated) {
      for (const [otherRoute, otherPage] of Object.entries(PAGES)) {
        if (otherRoute === route || otherRoute === '/') continue;
        for (const id of ids) {
          expect(otherPage, `#${id} leaked onto ${otherRoute}`).not.toContain(`id="${id}"`);
        }
      }
    }
  });

  it('puts the navbar, footer and WhatsApp button on every route', () => {
    for (const [route, page] of Object.entries(PAGES)) {
      expect(page, `${route} lost the site search`).toContain('id="site-search"');
      expect(page, `${route} lost the brochure CTA`).toContain('data-evt="pricing_brochure_downloaded"');
      expect(page, `${route} lost the WhatsApp button`).toContain('data-evt="contact_intent_clicked"');
      expect(page, `${route} lost the footer`).toContain('All rights reserved');
    }
  });

  it('links every route from the nav on every route', () => {
    // The whole point of the split: real internal links a crawler can follow.
    for (const [route, page] of Object.entries(PAGES)) {
      for (const href of ['/products', '/pricing', '/process', '/about', '/contact']) {
        expect(page, `${route} does not link to ${href}`).toContain(`href="${href}"`);
      }
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
