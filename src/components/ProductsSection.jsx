import useReveal from '../hooks/useReveal';
import BottleSVG from './svg/BottleSVG';

const SectionTag = ({ children }) => (
  <div style={{
    display: 'inline-block', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--aqua)', border: '1px solid rgba(62,207,191,0.3)',
    borderRadius: 50, padding: '5px 16px', marginBottom: 16,
  }}>{children}</div>
);

const PRODUCTS = [
  { size: '250ml', name: 'Petite', desc: 'Ideal for flights, meetings & premium gift hampers', price: '₹12/bottle', minOrder: '500 units', color: '#3ecfbf', featured: false },
  { size: '500ml', name: 'Classic', desc: 'Our most popular — perfect for offices & events', price: '₹18/bottle', minOrder: '250 units', color: '#c8a44a', featured: true },
  { size: '1 Litre', name: 'Grande', desc: 'Ideal for gyms, hotels & extended stays', price: '₹28/bottle', minOrder: '150 units', color: '#5b8ff9', featured: false },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function ProductsSection() {
  const headRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="products" style={{ padding: '100px 5%', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={headRef} className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionTag>Our Products</SectionTag>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
            fontSize: 'clamp(30px, 4vw, 52px)', color: 'var(--white)', lineHeight: 1.15,
          }}>
            Choose Your Perfect Size
          </h2>
        </div>

        <div ref={gridRef} className="reveal" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28,
        }} className="products-grid reveal">
          {PRODUCTS.map(({ size, name, desc, price, minOrder, color, featured }) => (
            <div
              key={name}
              className="glass-card product-card"
              style={{
                padding: '36px 28px',
                textAlign: 'center',
                position: 'relative',
                border: featured ? '1px solid rgba(62,207,191,0.4)' : '1px solid var(--glass-border)',
              }}
            >
              {featured && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, var(--gold), #a8832a)',
                  color: 'var(--navy)', fontSize: 11, fontWeight: 700,
                  padding: '4px 16px', borderRadius: 50, letterSpacing: '0.08em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <BottleSVG color={color} label={size} size={160} />
              </div>

              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 42,
                fontWeight: 700, color: 'var(--white)', lineHeight: 1,
              }}>{size}</div>
              <div style={{ color: color, fontWeight: 600, fontSize: 16, marginTop: 4, marginBottom: 10 }}>{name}</div>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>{desc}</p>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--white)', fontFamily: "'Cormorant Garamond', serif" }}>{price}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Min. order: {minOrder}</div>
              </div>

              <button
                onClick={() => scrollTo('contact')}
                style={{
                  background: color, border: 'none', color: '#04101f',
                  fontWeight: 600, fontSize: 15, padding: '12px 28px',
                  borderRadius: 50, cursor: 'pointer', width: '100%',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.25s',
                }}
                className="order-btn"
              >
                Order Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
