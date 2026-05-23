import { useState, useEffect } from 'react';

const links = [
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Products', id: 'products' },
  { label: 'Industries', id: 'industries' },
  { label: 'Customizer', id: 'customizer' },
  { label: 'Contact', id: 'contact' },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={scrolled ? 'nav-scrolled' : ''}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', zIndex: 1000, transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <img src="/aquavia-logo.jpeg" alt="AquaVia" style={{ height: 48, borderRadius: 8, display: 'block' }} />
      </div>

      {/* Nav links */}
      <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => scrollTo(l.id)}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0,
              fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s',
            }}
            className="nav-link"
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={() => scrollTo('contact')}
          className="nav-cta"
          style={{
            background: 'linear-gradient(135deg, var(--aqua), var(--aqua-dim))',
            border: 'none', color: 'var(--navy)', fontSize: 14, fontWeight: 600,
            padding: '10px 22px', borderRadius: 50, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", transition: 'all 0.25s',
          }}
        >
          Get a Quote
        </button>
      </div>
    </nav>
  );
}
