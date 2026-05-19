export default function MoonMountainIllustration() {
  const stars = [
    [30,20],[60,10],[90,30],[130,15],[170,8],[210,25],[250,12],[290,35],[310,18],
    [40,50],[80,45],[140,40],[200,48],[260,42],[300,55],[20,60],[100,65],[180,58],
  ];

  return (
    <svg viewBox="0 0 320 260" width="320" height="260" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04101f" />
          <stop offset="100%" stopColor="#081b35" />
        </linearGradient>
        <linearGradient id="mtnLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a8a80" />
          <stop offset="100%" stopColor="#0b2244" />
        </linearGradient>
        <linearGradient id="mtnRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0b2244" />
        </linearGradient>
        <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3ecfbf" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#3ecfbf" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect width="320" height="260" fill="url(#skyGrad)" rx="16" />

      {/* Stars */}
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 1} fill="white" fillOpacity={0.4 + (i % 4) * 0.15} />
      ))}

      {/* Crescent moon */}
      <circle cx="255" cy="45" r="22" fill="#c8a44a" fillOpacity="0.9" />
      <circle cx="265" cy="40" r="18" fill="#04101f" />

      {/* Back mountain */}
      <path d="M0 260 L60 90 L130 260 Z" fill="url(#mtnLeft)" />

      {/* Front mountain (main peak) */}
      <path d="M80 260 L180 55 L280 260 Z" fill="url(#mtnRight)" />

      {/* Snow caps */}
      <path d="M60 90 L75 115 L45 115 Z" fill="white" fillOpacity="0.8" />
      <path d="M180 55 L200 90 L160 90 Z" fill="white" fillOpacity="0.9" />

      {/* River */}
      <path
        d="M0 230 Q40 220 80 228 Q130 238 180 225 Q230 215 280 228 Q305 234 320 230 L320 260 L0 260 Z"
        fill="url(#riverGrad)"
      />

      {/* River highlight */}
      <path
        d="M40 235 Q90 228 140 234 Q190 240 240 232"
        fill="none"
        stroke="#3ecfbf"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
