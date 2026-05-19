export default function MountainBg() {
  return (
    <svg
      viewBox="0 0 1440 300"
      width="100%"
      height="300"
      preserveAspectRatio="none"
      style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.12, pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mtn3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ecfbf" />
          <stop offset="100%" stopColor="#3ecfbf" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Back mountain */}
      <path d="M0 300 L200 80 L400 300 Z" fill="url(#mtn1)" />
      {/* Mid mountain */}
      <path d="M300 300 L600 30 L900 300 Z" fill="url(#mtn2)" />
      {/* Front mountain (center-right) */}
      <path d="M700 300 L1050 10 L1400 300 Z" fill="url(#mtn3)" />
    </svg>
  );
}
