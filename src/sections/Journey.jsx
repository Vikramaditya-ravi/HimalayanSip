import { useEffect, useRef, useState } from 'react'

import { track } from '../analytics/tracker'
import { FILTRATION_COLORS, FILTRATION_STAGES, JOURNEY_STEPS } from '../site/data'
import { useReveal } from '../site/hooks'

// ─── Journey: "From Earth to You" ─────────────────────────────────────────────
function IllusSource() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190" style={{overflow:'visible'}}>
      <defs>
        <radialGradient id="dropGrad1" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#7efff4"/><stop offset="100%" stopColor="#1a8a80"/>
        </radialGradient>
      </defs>
      {[0, 0.75, 1.5].map((delay,i) => (
        <circle key={i} cx="100" cy="110" r="50" fill="none" stroke="#3ecfbf" strokeWidth="1.5"
          className="svg-anim"
          style={{animation:`sonarPulse 2.25s ${delay}s ease-out infinite`,animationFillMode:'both'}}/>
      ))}
      <ellipse cx="100" cy="140" rx="72" ry="10" fill="#3ecfbf" opacity="0.07"/>
      <ellipse cx="100" cy="152" rx="56" ry="7" fill="#3ecfbf" opacity="0.05"/>
      <path d="M100 72 C100 72 74 100 74 116 C74 133 86 144 100 144 C114 144 126 133 126 116 C126 100 100 72 100 72Z" fill="url(#dropGrad1)"/>
      <ellipse cx="90" cy="104" rx="7" ry="10" fill="white" opacity="0.22"/>
    </svg>
  )
}

function IllusExtraction() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <ellipse cx="100" cy="166" rx="60" ry="9" fill="#5b8ff9" opacity="0.12"/>
      <rect x="94" y="38" width="12" height="128" rx="6" fill="#5b8ff9" opacity="0.18"/>
      <rect x="96" y="40" width="8" height="124" rx="4" fill="#5b8ff9" opacity="0.35"/>
      <path d="M97 40 L100 28 L103 40Z" fill="#5b8ff9" opacity="0.9"/>
      {[0, 0.7, 1.4].map((delay,i) => (
        <ellipse key={i} cx="100" cy="150" rx="4.5" ry="6.5" fill="#5b8ff9"
          className="svg-anim"
          style={{animation:`dropRise 2.1s ${delay}s ease-in-out infinite`,animationFillMode:'both',opacity:0}}/>
      ))}
      <rect x="28" y="158" width="144" height="2" fill="#5b8ff9" opacity="0.2" rx="1"/>
    </svg>
  )
}

function IllusFiltration({ activeStage = null, onStageHover }) {
  const BAR_COLORS = FILTRATION_COLORS
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <rect x="16" y="158" width="168" height="2" fill="white" opacity="0.07" rx="1"/>
      {BAR_COLORS.map((color,i) => {
        const x = 20 + i * 23
        const isActive = activeStage === i
        const isDimmed = activeStage !== null && !isActive
        return (
          // Dim/undim rides on the group, not on the animated rect: the
          // filterLight keyframe owns that rect's opacity and would win.
          <g key={i}
            onMouseEnter={() => onStageHover?.(i)}
            onMouseLeave={() => onStageHover?.(null)}
            style={{ opacity: isDimmed ? 0.2 : 1, transition:'opacity 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
            <title>{`${FILTRATION_STAGES[i].num} — ${FILTRATION_STAGES[i].name}`}</title>
            <rect x={x} y="48" width="17" height="110" rx="8" fill={color} opacity="0.08"/>
            <rect x={x} y="48" width="17" height="110" rx="8" fill={color}
              style={{
                animation:`filterLight 1.96s ${i*0.24}s ease-in-out infinite`, opacity:0.15,
                // Hold the shimmer still while a stage is being inspected, so the
                // steady highlight below reads as the answer to the hover.
                animationPlayState: activeStage !== null ? 'paused' : 'running',
              }}/>
            <rect x={x} y="48" width="17" height="110" rx="8" fill={color}
              style={{ opacity: isActive ? 0.95 : 0, transition:'opacity 0.3s cubic-bezier(0.22,1,0.36,1)' }}/>
            <text x={x+8.5} y="178" textAnchor="middle" fill={color} fontSize="7.5" fontFamily="DM Sans"
              style={{ opacity: isActive ? 1 : 0.8, transition:'opacity 0.3s ease' }}>S{i+1}</text>
          </g>
        )
      })}
      {[0,1,2,3,4,5].map(i => (
        <path key={i} d={`M${37+i*23} 100 L${43+i*23} 100`} stroke="white" strokeWidth="0.6" opacity="0.15"/>
      ))}
    </svg>
  )
}

function IllusMinerals() {
  const IONS = [
    {label:'Ca',color:'#c8a44a',r:42,speed:'3.2s',di:0},
    {label:'Mg',color:'#3ecfbf',r:32,speed:'2.4s',di:1},
    {label:'K', color:'#7c4dff',r:50,speed:'4s',  di:0},
    {label:'Na',color:'#5b8ff9',r:38,speed:'2.8s',di:1},
  ]
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <defs>
        <radialGradient id="dropGrad4" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#b2fff8"/><stop offset="100%" stopColor="#1a8a80"/>
        </radialGradient>
      </defs>
      {[32,42,50].map((r,i) => (
        <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="white" strokeWidth="0.6" opacity="0.08" strokeDasharray="4 6"/>
      ))}
      {IONS.map((ion,i) => (
        <g key={i} style={{
          transformOrigin:'100px 100px',
          animation:`orbitSpin ${ion.speed} ${i*0.4}s linear infinite`,
          animationDirection: ion.di===1 ? 'reverse' : 'normal'
        }}>
          <circle cx={100+ion.r} cy="100" r="10" fill={ion.color} opacity="0.18"/>
          <circle cx={100+ion.r} cy="100" r="6" fill={ion.color} opacity="0.7"/>
          <text x={100+ion.r} y="104" textAnchor="middle" fill="white" fontSize="6" fontFamily="DM Sans" fontWeight="600">{ion.label}</text>
        </g>
      ))}
      <path d="M100 80 C100 80 84 97 84 108 C84 119 91 126 100 126 C109 126 116 119 116 108 C116 97 100 80 100 80Z" fill="url(#dropGrad4)"/>
      <ellipse cx="93" cy="102" rx="5" ry="7" fill="white" opacity="0.25"/>
    </svg>
  )
}

function IllusBottling() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <defs>
        <clipPath id="bottleClip5">
          <path d="M88 48 L88 68 L78 78 L78 170 L122 170 L122 78 L112 68 L112 48 Z"/>
        </clipPath>
        <linearGradient id="waterGrad5" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#1a8a80" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      <path d="M88 48 L88 68 L78 78 L78 170 L122 170 L122 78 L112 68 L112 48 Z"
        fill="rgba(62,207,191,0.06)" stroke="#3ecfbf" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="86" y="40" width="28" height="10" rx="4" fill="#3ecfbf" opacity="0.4"/>
      <rect x="78" y="100" width="44" height="40" fill="rgba(62,207,191,0.06)" stroke="rgba(62,207,191,0.2)" strokeWidth="0.8"/>
      <text x="100" y="118" textAnchor="middle" fill="#3ecfbf" fontSize="7" fontFamily="DM Sans" opacity="0.7">YOUR</text>
      <text x="100" y="128" textAnchor="middle" fill="#3ecfbf" fontSize="7" fontFamily="DM Sans" opacity="0.7">BRAND</text>
      <rect x="78" y="78" width="44" height="92" fill="url(#waterGrad5)"
        clipPath="url(#bottleClip5)"
        className="svg-anim"
        style={{animation:'fillBottle 3s ease-in-out infinite'}}/>
      <path d="M86 82 L86 160" stroke="white" strokeWidth="2" opacity="0.08" strokeLinecap="round"/>
      <rect x="50" y="172" width="100" height="3" rx="1.5" fill="white" opacity="0.08"/>
      {[0,1,2,3].map(i => (
        <circle key={i} cx={58+i*22} cy="178" r="4" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12"/>
      ))}
    </svg>
  )
}

function IllusDelivery() {
  return (
    <svg viewBox="0 0 200 200" width="190" height="190">
      <rect x="8" y="160" width="184" height="4" rx="2" fill="#5b8ff9" opacity="0.12"/>
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={12+i*36} y="161.5" width="18" height="1" rx="0.5" fill="#5b8ff9" opacity="0.18"/>
      ))}
      {[0,1,2].map(i => (
        <line key={i} x1="8" y1={124+i*10} x2={48+i*4} y2={124+i*10}
          stroke="#5b8ff9" strokeWidth={1.2-i*0.3} opacity="0.2"
          style={{transformOrigin:'48px 100px',animation:`speedLine 1.2s ${i*0.25}s ease-out infinite`}}/>
      ))}
      <g style={{animation:'truckWobble 0.6s ease-in-out infinite'}}>
        <rect x="38" y="104" width="94" height="56" rx="5" fill="#0b2244" stroke="#5b8ff9" strokeWidth="1.5" opacity="0.95"/>
        <text x="68" y="136" fontSize="16" fill="#5b8ff9" opacity="0.55" textAnchor="middle">❄</text>
        <text x="95" y="136" fontSize="16" fill="#5b8ff9" opacity="0.45" textAnchor="middle">❄</text>
        <text x="116" y="136" fontSize="13" fill="#5b8ff9" opacity="0.35" textAnchor="middle">❄</text>
        <text x="85" y="154" fontSize="9.5" fill="#3ecfbf" fontFamily="DM Sans" fontWeight="600" textAnchor="middle">4°C</text>
        <rect x="130" y="116" width="36" height="44" rx="4" fill="#081b35" stroke="#5b8ff9" strokeWidth="1.5"/>
        <rect x="135" y="122" width="20" height="17" rx="3" fill="#3ecfbf" opacity="0.22"/>
        <circle cx="163" cy="152" r="3.5" fill="#c8a44a" opacity="0.85"/>
        <circle cx="163" cy="152" r="6" fill="#c8a44a" opacity="0.12"/>
        <circle cx="70" cy="160" r="11" fill="#04101f" stroke="#5b8ff9" strokeWidth="2"/>
        <circle cx="70" cy="160" r="5" fill="#5b8ff9" opacity="0.4"/>
        <circle cx="148" cy="160" r="11" fill="#04101f" stroke="#5b8ff9" strokeWidth="2"/>
        <circle cx="148" cy="160" r="5" fill="#5b8ff9" opacity="0.4"/>
        <rect x="38" y="158" width="130" height="4" rx="2" fill="#5b8ff9" opacity="0.1"/>
      </g>
      {[{x:28,y:80,d:0},{x:18,y:62,d:0.5},{x:44,y:55,d:1},{x:12,y:92,d:0.8}].map((s,i) => (
        <circle key={i} cx={s.x} cy={s.y} r="2.5" fill="#5b8ff9" opacity="0.35"
          className="svg-anim"
          style={{animation:`snowFloat 2.2s ${s.d}s ease-in-out infinite alternate`}}/>
      ))}
    </svg>
  )
}

function IllusYours() {
  const RAY_ANGLES = [0,45,90,135,180,225,270,315]
  const SPARK_ANGLES = [22,67,112,157,202,247,292,337]
  return (
    <svg viewBox="0 0 200 200" width="190" height="190" style={{overflow:'visible'}}>
      <defs>
        <radialGradient id="dropGrad7" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fffbf0"/><stop offset="100%" stopColor="#3ecfbf"/>
        </radialGradient>
        <radialGradient id="glowGrad7" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8a44a" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#c8a44a" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="65" fill="url(#glowGrad7)"/>
      {RAY_ANGLES.map((angle,i) => {
        const rad = angle * Math.PI / 180
        const x2 = 100 + Math.cos(rad) * 68
        const y2 = 100 + Math.sin(rad) * 68
        return (
          <line key={i} x1="100" y1="100" x2={x2} y2={y2}
            stroke={i%2===0?'#c8a44a':'#3ecfbf'} strokeWidth="1.8" strokeLinecap="round"
            strokeDasharray="68" strokeDashoffset="68"
            style={{animation:`burstLine 2.4s ${i*0.18}s ease-out infinite`}}/>
        )
      })}
      {SPARK_ANGLES.map((angle,i) => {
        const rad = angle * Math.PI / 180
        const cx = 100 + Math.cos(rad) * 55
        const cy = 100 + Math.sin(rad) * 55
        return (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill={i%2===0?'#c8a44a':'#3ecfbf'}
            className="svg-anim"
            style={{animation:`twinkle 1.8s ${i*0.22}s ease-in-out infinite`,opacity:0.1}}/>
        )
      })}
      <path d="M100 68 C100 68 76 93 76 109 C76 124 87 134 100 134 C113 134 124 124 124 109 C124 93 100 68 100 68Z" fill="url(#dropGrad7)"/>
      <ellipse cx="91" cy="97" rx="7" ry="9" fill="white" opacity="0.28"/>
    </svg>
  )
}

const ILLUS_COMPONENTS = [IllusSource, IllusExtraction, IllusFiltration, IllusMinerals, IllusBottling, IllusDelivery, IllusYours]

function colorToRgb(hex) {
  if (hex === '#3ecfbf') return '62,207,191'
  if (hex === '#5b8ff9') return '91,143,249'
  if (hex === '#7c4dff') return '124,77,255'
  if (hex === '#c8a44a') return '200,164,74'
  return '62,207,191'
}

function JourneyRow({ step, index }) {
  const ref = useReveal()
  // The step-03 illustration is hover-linked to its own bars: the rects are
  // labelled S1–S7, and this is what makes that labelling mean something
  // instead of being decoration.
  const [activeStage, setActiveStage] = useState(null)
  const IllusComp = ILLUS_COMPONENTS[index]
  const isReversed = index % 2 === 1
  const rgb = colorToRgb(step.color)
  const textEl = (
    <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
      <span style={{ color:step.color, fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>
        {step.num}
      </span>
      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'clamp(24px,2.8vw,38px)', color:'var(--white)', lineHeight:1.1, marginBottom:16 }}>
        {step.title}
      </h3>
      <div style={{ width:40, height:2, background:step.color, marginBottom:20, borderRadius:2 }}/>
      <p style={{ color:'var(--muted)', lineHeight:1.8, fontSize:15, maxWidth:420 }}>{step.body}</p>
      {step.stages && (
        // The stage detail now leads the section rather than hiding behind a
        // toggle here; this just points at it.
        <button
          onClick={scrollToFiltration}
          className="stage-toggle"
          style={{
            display:'flex', alignItems:'center', gap:10, background:'none', border:'none',
            padding:0, marginTop:20, cursor:'pointer', color:step.color,
            fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, letterSpacing:1,
          }}>
          See all seven stages
          <span className="stage-toggle-icon" style={{ fontSize:16, lineHeight:1 }}>↑</span>
        </button>
      )}
    </div>
  )
  const illusEl = (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{
        width:240, height:240, borderRadius:'50%',
        background:`radial-gradient(circle, rgba(${rgb},0.09) 0%, transparent 70%)`,
        border:`1px solid rgba(${rgb},0.15)`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {/* activeStage is meaningful only to IllusFiltration; the other six
            illustrations take the prop and ignore it. */}
        <IllusComp activeStage={activeStage} onStageHover={setActiveStage} />
      </div>
    </div>
  )
  return (
    <div ref={ref} className="reveal journey-row-grid"
      style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(32px,5vw,80px)', alignItems:'center', marginBottom:64, transitionDelay:`${index*0.04}s` }}>
      {isReversed ? <>{textEl}{illusEl}</> : <>{illusEl}{textEl}</>}
    </div>
  )
}

// ─── 7-Stage Filtration showcase ──────────────────────────────────────────────
/**
 * The plant spec, promoted out of Journey step 03 and given the whole width.
 *
 * It used to sit behind a "See the seven stages" toggle inside step 03, which
 * meant the single most concrete proof on the page — the actual filtration
 * train — was invisible unless a visitor thought to click. Procurement buyers
 * come here for exactly this.
 *
 * The pipeline and the cards are two views of one selection: hovering either
 * lights the other, which is the same cross-highlight the step-03 illustration
 * already does.
 */
const FILTRATION_GEOM = { start: 30, slot: 86, barW: 48, top: 46, barH: 104, vbW: 624, vbH: 200 }

/**
 * Deliberately NOT scrollIntoView.
 *
 * #filtration sits inside the journey <section>, which sets overflow:hidden.
 * That makes the section its own scrollport, and scrollIntoView stops there:
 * the element is already fully visible *within the clipped box*, so the browser
 * considers the job done and the document never moves. The nav links get away
 * with scrollIntoView because they target top-level sections.
 *
 * Scrolling the window against the element's absolute offset skips the
 * intervening scrollport entirely. The 96px offset clears the fixed navbar.
 */
function scrollToFiltration() {
  const el = document.getElementById('filtration')
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
}

function FiltrationShowcase() {
  const headRef = useReveal()
  const railRef = useReveal()
  const [active, setActive] = useState(null)
  const [pinned, setPinned] = useState(null)
  const [scan, setScan] = useState(0)
  const inspectedRef = useRef(false)

  // Idle attract loop. It walks S1→S7 so the pipeline reads as a sequence a drop
  // travels through rather than seven unrelated bars — but it yields the moment a
  // visitor takes over, and never runs for people who asked for less motion.
  const engaged = pinned !== null || active !== null
  useEffect(() => {
    if (engaged) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setScan(s => (s + 1) % FILTRATION_STAGES.length), 1700)
    return () => clearInterval(id)
  }, [engaged])

  const shown = pinned ?? active ?? (engaged ? null : scan)

  // Fires once per mount, on the first deliberate inspection of a stage. A
  // visitor who merely scrolled past has not checked the spec.
  const noteInspection = () => {
    if (inspectedRef.current) return
    inspectedRef.current = true
    track('filtration_stages_expanded', { sectionId: 'journey' })
  }

  const { start, slot, barW, top, barH, vbW, vbH } = FILTRATION_GEOM

  return (
    <div id="filtration" style={{ marginBottom:96, scrollMarginTop:96 }}>
      <div ref={headRef} className="reveal" style={{ textAlign:'center', marginBottom:32 }}>
        <p style={{ color:'#7c4dff', fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:4, textTransform:'uppercase', marginBottom:14 }}>
          SEVEN-STAGE FILTRATION
        </p>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'clamp(26px,3.4vw,44px)', color:'var(--white)', lineHeight:1.1, marginBottom:16 }}>
          Every drop, <span style={{ color:'var(--aqua)' }}>seven times over</span>
        </h3>
        <p style={{ color:'var(--muted)', fontSize:15, lineHeight:1.75, maxWidth:600, margin:'0 auto' }}>
          Water enters raw and leaves sealed. Between those two moments it passes through
          seven sequential stages — each one removing what the last could not.
        </p>
      </div>

      {/* The pipeline. Decorative in the accessibility tree: every stage it draws
          is stated as real text in the rail below, so a screen reader gets the
          spec without having to parse an SVG. */}
      <div className="glass-card" style={{ padding:'28px 20px 18px', marginBottom:22, overflowX:'auto' }}>
        {/* Capped and centred: stretched to the full 1200px column the bars grow
            to ~440px tall and the diagram bullies the section it introduces. */}
        <svg viewBox={`0 0 ${vbW} ${vbH}`} aria-hidden="true" focusable="false"
          style={{ display:'block', width:'100%', maxWidth:860, minWidth:560, margin:'0 auto' }}>
          <defs>
            <linearGradient id="filtFlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c8a44a" stopOpacity="0.5"/>
              <stop offset="55%" stopColor="#5b8ff9" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0.9"/>
            </linearGradient>
          </defs>

          {/* The pipe the water runs along, dashes drifting downstream. */}
          <line x1="0" y1={top + barH / 2} x2={vbW} y2={top + barH / 2}
            stroke="url(#filtFlow)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray="10 8" style={{ animation:'dashFlow 1.6s linear infinite' }}/>

          {/* One droplet making the full traverse, left (raw) to right (pure). */}
          <circle cx="-8" cy={top + barH / 2} r="5.5" fill="#3ecfbf"
            style={{ animation:'flowRight 5.2s linear infinite' }}/>

          {FILTRATION_STAGES.map((stage, i) => {
            const color = FILTRATION_COLORS[i]
            const x = start + i * slot
            const isActive = shown === i
            const isDimmed = shown !== null && !isActive
            return (
              <g key={stage.num}
                onMouseEnter={() => { setActive(i); noteInspection() }}
                onMouseLeave={() => setActive(null)}
                style={{ opacity: isDimmed ? 0.28 : 1, transition:'opacity 0.35s cubic-bezier(0.22,1,0.36,1)', cursor:'pointer' }}>
                <title>{`${stage.num} — ${stage.name}`}</title>

                {isActive && (
                  <ellipse cx={x + barW / 2} cy={top + barH / 2} rx={barW * 0.82} ry={barH * 0.58}
                    fill={color} opacity="0.18"
                    style={{
                      animation:'stageHalo 2.4s ease-in-out infinite',
                      // Without these the scale() in the keyframe pivots on the
                      // SVG origin and throws the halo off to the top-left.
                      transformBox:'fill-box', transformOrigin:'center',
                    }}/>
                )}

                <rect x={x} y={top} width={barW} height={barH} rx="14" fill={color} opacity="0.09"/>
                <rect x={x} y={top} width={barW} height={barH} rx="14" fill={color}
                  style={{
                    animation:`filterLight 1.96s ${i * 0.24}s ease-in-out infinite`, opacity:0.16,
                    animationPlayState: shown !== null ? 'paused' : 'running',
                  }}/>
                <rect x={x} y={top} width={barW} height={barH} rx="14" fill={color}
                  style={{ opacity: isActive ? 0.9 : 0, transition:'opacity 0.35s cubic-bezier(0.22,1,0.36,1)' }}/>
                <rect x={x} y={top} width={barW} height={barH} rx="14" fill="none"
                  stroke={color} strokeWidth="1.2" opacity={isActive ? 0.95 : 0.3}
                  style={{ transition:'opacity 0.35s ease' }}/>

                {/* Grit caught by this stage, settling out of the stream. */}
                {[0, 1, 2].map(d => (
                  <circle key={d} cx={x + 12 + d * 12} cy={top + 34} r="2" fill={color}
                    style={{ animation:`gritFall 2.6s ${(i * 0.24) + d * 0.5}s ease-in infinite`, opacity:0 }}/>
                ))}

                <text x={x + barW / 2} y={top + barH + 22} textAnchor="middle" fill={color}
                  fontSize="12" fontWeight="600" fontFamily="DM Sans"
                  style={{ opacity: isActive ? 1 : 0.75, transition:'opacity 0.3s ease' }}>
                  S{i + 1}
                </text>
                <text x={x + barW / 2} y={top + barH + 40} textAnchor="middle" fill="#ffffff"
                  fontSize="9.5" fontFamily="DM Sans" opacity={isActive ? 0.75 : 0.32}
                  style={{ transition:'opacity 0.3s ease' }}>
                  {stage.num}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Same max-width as the svg so these sit under the ends of the pipeline
            rather than drifting out to the card's corners. */}
        <div style={{ display:'flex', justifyContent:'space-between', width:'100%', maxWidth:860, minWidth:560, margin:'0 auto', padding:'4px 6px 0', fontFamily:"'DM Sans',sans-serif", fontSize:11, letterSpacing:2, textTransform:'uppercase' }}>
          <span style={{ color:'rgba(200,164,74,0.75)' }}>Raw intake</span>
          <span style={{ color:'var(--aqua)' }}>Sealed &amp; pure</span>
        </div>
      </div>

      {/* The spec as text. Click pins a stage so it can be read without holding
          a hover — the descriptions are long enough that hover-only would be a
          usability trap on the way to reading one. */}
      <div ref={railRef} className="reveal filtration-rail">
        {FILTRATION_STAGES.map((stage, i) => {
          const color = FILTRATION_COLORS[i]
          const isActive = shown === i
          const isDimmed = shown !== null && !isActive
          const isPinned = pinned === i
          return (
            <button
              key={stage.num}
              type="button"
              aria-pressed={isPinned}
              className="stage-btn stage-card-in"
              onMouseEnter={() => { setActive(i); noteInspection() }}
              onMouseLeave={() => setActive(null)}
              onFocus={() => { setActive(i); noteInspection() }}
              onBlur={() => setActive(null)}
              onClick={() => { setPinned(p => (p === i ? null : i)); noteInspection() }}
              style={{
                animationDelay:`${i * 70}ms`,
                opacity: isDimmed ? 0.5 : 1,
                borderColor: isActive ? color : undefined,
                transform: isActive ? 'translateY(-6px)' : undefined,
                boxShadow: isActive ? `0 18px 40px rgba(0,0,0,0.35), 0 0 26px ${color}22` : undefined,
              }}>
              <span style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span aria-hidden="true" style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0, boxShadow: isActive ? `0 0 12px ${color}` : 'none', transition:'box-shadow 0.3s ease' }}/>
                <span style={{ color, fontSize:12, fontWeight:600, letterSpacing:3 }}>{stage.num}</span>
              </span>
              <span style={{ display:'block', color:'var(--white)', fontSize:14.5, fontWeight:600, lineHeight:1.35, marginBottom:8 }}>
                {stage.name}
              </span>
              <span style={{ display:'block', color:'var(--muted)', fontSize:13, lineHeight:1.65 }}>
                {stage.purpose}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function JourneySection() {
  const titleRef = useReveal()
  return (
    <section id="journey" className="sec" style={{ background:'var(--navy)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translateX(-50%)', width:700, height:700, background:'radial-gradient(circle,rgba(62,207,191,0.035) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none' }}/>
      <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
        <div ref={titleRef} className="reveal" style={{ textAlign:'center', marginBottom:88 }}>
          <p style={{ color:'var(--aqua)', fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, letterSpacing:4, textTransform:'uppercase', marginBottom:16 }}>THE JOURNEY</p>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'clamp(34px,5vw,64px)', color:'var(--white)', lineHeight:1.05, marginBottom:20 }}>
            From Earth to <span style={{ color:'var(--gold)' }}>You</span>
          </h2>
          <p style={{ color:'var(--muted)', fontSize:16, lineHeight:1.75, maxWidth:560, margin:'0 auto' }}>
            Every drop carries a story — a journey of purity, precision, and care from ancient aquifers to your hands.
          </p>
        </div>
        <FiltrationShowcase />
        {JOURNEY_STEPS.map((step,i) => (
          <JourneyRow key={step.num} step={step} index={i} />
        ))}
        <div style={{ textAlign:'center', marginTop:8 }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(20px,2.5vw,30px)', fontStyle:'italic', color:'var(--muted)', marginBottom:32 }}>
            Not just water. <span style={{ color:'var(--white)', fontStyle:'italic' }}>Your</span> water.
          </p>
          <a href="/contact"
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 44px rgba(62,207,191,0.48)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(62,207,191,0.3)' }}
            style={{ display:'inline-block', textDecoration:'none', background:'linear-gradient(135deg,var(--aqua-dim),var(--aqua))', color:'var(--navy)', border:'none', borderRadius:50, padding:'14px 38px', fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, cursor:'pointer', boxShadow:'0 8px 32px rgba(62,207,191,0.3)', transition:'all 0.3s' }}>
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  )
}
