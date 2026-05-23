function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Footer() {
  return (
    <footer style={{ background: '#03090f', padding: '60px 5% 30px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 48,
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 3 C14 3 5 13 5 18.5 C5 23.2 9.1 27 14 27 C18.9 27 23 23.2 23 18.5 C23 13 14 3 14 3Z"
                  fill="url(#footerDrop)" />
                <defs>
                  <linearGradient id="footerDrop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3ecfbf" />
                    <stop offset="100%" stopColor="#1a8a80" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: 'var(--white)' }}>
                Aqua<span style={{ color: 'var(--aqua)' }}>Via</span>
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.75, marginBottom: 24, maxWidth: 240 }}>
              Pure Himalayan hydration for brands that care.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['📸', '💼', '🐦', '▶️'].map((icon, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, cursor: 'pointer',
                }}>{icon}</div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 18, fontSize: 15 }}>Quick Links</div>
            {[['About', 'about'], ['Services', 'services'], ['Products', 'products'], ['Industries', 'industries'], ['Contact', 'contact']].map(([label, id]) => (
              <div key={id} onClick={() => scrollTo(id)} style={{
                color: 'var(--muted)', fontSize: 14, marginBottom: 10, cursor: 'pointer',
                transition: 'color 0.2s',
              }} className="footer-link">{label}</div>
            ))}
          </div>

          {/* Services */}
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 18, fontSize: 15 }}>Services</div>
            {['Custom Label Design', 'Bulk Orders', 'Event Branding', 'Hotel Supply', 'Express Delivery'].map(s => (
              <div key={s} style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 10 }}>{s}</div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 18, fontSize: 15 }}>Contact</div>
            {[
              ['📍', 'Bengaluru, India'],
              ['📞', '+91 98765 43210'],
              ['📧', 'hello@aquavia.com'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: 10, color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>© 2024 AquaVia. All rights reserved.</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>Made with 💧 in India</div>
        </div>
      </div>
    </footer>
  );
}
