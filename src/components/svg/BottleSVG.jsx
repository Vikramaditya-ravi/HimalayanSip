export default function BottleSVG({ logo, color = '#3ecfbf', label = '500ml', size = 200, animationClass = '' }) {
  const scale = size / 260;
  const animStyle = animationClass
    ? { animation: animationClass === 'floatA' ? 'floatA 6s ease-in-out infinite'
        : animationClass === 'floatB' ? 'floatB 7s ease-in-out infinite'
        : 'floatC 8s ease-in-out infinite' }
    : {};

  return (
    <svg
      viewBox="0 0 110 260"
      width={110 * scale}
      height={260 * scale}
      style={{ filter: 'drop-shadow(0 20px 40px rgba(62,207,191,0.3))', ...animStyle }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`bodyGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4f5f2" />
          <stop offset="100%" stopColor="#f0fffe" />
        </linearGradient>
        <linearGradient id={`shineGrad-${color.replace('#','')}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`waterGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`capGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <clipPath id={`bodyClip-${color.replace('#','')}`}>
          <rect x="18" y="50" width="74" height="195" rx="10" ry="10" />
        </clipPath>
      </defs>

      {/* Cap */}
      <rect x="34" y="6" width="42" height="22" rx="6" ry="6" fill={`url(#capGrad-${color.replace('#','')})`} />
      <rect x="36" y="7" width="20" height="8" rx="3" ry="3" fill="white" fillOpacity="0.25" />

      {/* Neck */}
      <path d="M38 28 L34 50 L76 50 L72 28 Z" fill={color} fillOpacity="0.7" />

      {/* Body */}
      <rect x="18" y="50" width="74" height="195" rx="10" ry="10" fill={`url(#bodyGrad-${color.replace('#','')})`} />

      {/* Water fill */}
      <rect x="18" y="137" width="74" height="108" rx="0" ry="0" fill={`url(#waterGrad-${color.replace('#','')})`} clipPath={`url(#bodyClip-${color.replace('#','')})`} />

      {/* Wave */}
      <path
        d="M18 140 Q31 133 44 140 Q57 147 70 140 Q83 133 92 140 L92 137 L18 137 Z"
        fill={color}
        fillOpacity="0.4"
        clipPath={`url(#bodyClip-${color.replace('#','')})`}
      />

      {/* Label background */}
      <rect x="24" y="74" width="62" height="100" rx="5" ry="5" fill="white" />

      {/* Label top strip */}
      <rect x="24" y="74" width="62" height="22" rx="5" ry="0" fill={color} />
      <rect x="24" y="88" width="62" height="8" fill={color} />
      <text x="55" y="88" textAnchor="middle" fill="white" fontSize="8" fontFamily="serif" fontWeight="700" letterSpacing="1">HIMALAYAN</text>

      {/* Label center — logo or placeholder */}
      {logo ? (
        <image href={logo} x="30" y="98" width="50" height="46" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          <circle cx="55" cy="121" r="18" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="55" y="118" textAnchor="middle" fill={color} fontSize="7" fontFamily="serif">YOUR</text>
          <text x="55" y="127" textAnchor="middle" fill={color} fontSize="7" fontFamily="serif">LOGO</text>
        </>
      )}

      {/* Label bottom strip */}
      <rect x="24" y="148" width="62" height="26" rx="0" ry="5" fill={color} />
      <rect x="24" y="148" width="62" height="8" fill={color} />
      <text x="55" y="163" textAnchor="middle" fill="white" fontSize="6.5" fontFamily="sans-serif">{label} · purified water</text>

      {/* Shine overlay */}
      <rect x="18" y="50" width="28" height="195" rx="10" ry="10" fill={`url(#shineGrad-${color.replace('#','')})`} />
    </svg>
  );
}
