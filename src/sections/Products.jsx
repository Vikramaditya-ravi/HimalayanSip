import { TrackInView } from '../analytics/TrackInView.jsx'
import { PRODUCTS, moqFull } from '../site/data'
import { useReveal } from '../site/hooks'
import { BottleSVG, SectionTag } from '../site/ui.jsx'

// ─── Products ─────────────────────────────────────────────────────────────────
export function ProductsSection() {
  const titleRef = useReveal()
  const doubled = [...PRODUCTS, ...PRODUCTS]
  return (
    <section id="products" className="sec" aria-labelledby="products-heading" style={{ background:'var(--navy)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div ref={titleRef} className="reveal sec-head">
          <SectionTag>Our Range</SectionTag>
          <h2 id="products-heading" style={{ fontFamily:'Cormorant Garamond, serif', fontWeight:700, fontSize:'clamp(30px,4vw,52px)', color:'var(--white)', lineHeight:1.1 }}>
            Choose Your Perfect Size
          </h2>
        </div>
        <div className="marquee-wrapper" style={{ paddingTop:20, paddingBottom:16 }}>
          <div className="marquee-track" style={{ animation:'marquee 22s linear infinite' }}>
            {doubled.map((p, i) => (
              // The marquee renders PRODUCTS twice to loop seamlessly. Only the
              // first copy emits view events, or every bottle size would report
              // exactly double the views it actually got.
              <ProductCard
                key={`${p.size}-${i}`}
                product={p}
                delay={0}
                marquee
                trackable={i < PRODUCTS.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, delay, marquee, trackable = true }) {
  const ref = useReveal()
  const card = (
    <div ref={marquee ? null : ref} className={`bottle-card${marquee ? '' : ' reveal'}${product.featured ? ' featured-card' : ''}`} style={{
      background:'var(--navy-card)', border:`1px solid ${product.featured ? 'rgba(62,207,191,0.4)' : 'var(--glass-border)'}`,
      borderRadius:24, padding:'24px 22px', textAlign:'center', position:'relative',
      transitionDelay:marquee ? '0s' : `${delay}s`, display:'flex', flexDirection:'column', alignItems:'center', gap:0,
      flex:'0 0 252px', minWidth:252, marginRight:20,
    }}>
      {product.featured && (
        <div className="featured-badge" style={{
          position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)',
          background:'linear-gradient(135deg, var(--gold), #a87c28)', borderRadius:50,
          padding:'4px 18px', fontSize:11, fontWeight:700, letterSpacing:'0.1em',
          color:'var(--navy)', textTransform:'uppercase', zIndex:10, whiteSpace:'nowrap'
        }}>Most Popular</div>
      )}
      <BottleSVG color={product.color} label={product.size} size={132} />
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:32, fontWeight:700, color:product.color, marginTop:8, lineHeight:1 }}>{product.size}</div>
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:18, color:'var(--white)', marginBottom:6 }}>{product.name}</div>
      <p style={{ color:'var(--muted)', fontSize:13, lineHeight:1.55, marginBottom:14 }}>{product.desc}</p>
      <div style={{ width:'100%', height:1, background:'var(--glass-border)', margin:'2px 0 14px' }} />
      <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:24, fontWeight:700, color:'var(--white)', marginBottom:4 }}>{product.price}</div>
      {/* Always rendered, blank when absent: the sizes quoted on request would
          otherwise sit a line higher and knock the row of buttons out of line. */}
      <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>
        {product.caseNote ? `${product.caseNote} · lower at volume` : ' '}
      </div>
      <div style={{ fontSize:13, color:'var(--muted)', marginBottom:16 }}>Min. {moqFull(product)}</div>
      <a
        href="/contact"
        data-evt="product_cta_clicked"
        data-sku={product.sku}
        style={{
        display:'block', textDecoration:'none', textAlign:'center', boxSizing:'border-box',
        width:'100%', background:`linear-gradient(135deg, ${product.color}, ${product.color}aa)`,
        border:'none', borderRadius:12, padding:'11px', color:'var(--navy)',
        fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:15, cursor:'pointer', transition:'all 0.3s'
      }}
        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
      >Order Now</a>
    </div>
  )

  if (!trackable) return card
  return (
    // The wrapper becomes the marquee's flex item; the card keeps its own
    // minWidth/marginRight so the track spacing is unchanged.
    <TrackInView
      event="product_viewed"
      productSku={product.sku}
      sectionId="products"
      style={{ flex: '0 0 auto', display: 'flex' }}
    >
      {card}
    </TrackInView>
  )
}
