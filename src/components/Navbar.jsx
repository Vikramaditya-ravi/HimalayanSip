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
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3 C14 3 5 13 5 18.5 C5 23.2 9.1 27 14 27 C18.9 27 23 23.2 23 18.5 C23 13 14 3 14 3Z"
            fill="url(#dropGrad)" />
          <defs>
            <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3ecfbf" />
              <stop offset="100%" stopColor="#1a8a80" />
            </linearGradient>
          </defs>
        </svg>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.02em' }}>
          Himalayan<span style={{ color: 'var(--aqua)' }}>Sip</span>
        </span>
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
