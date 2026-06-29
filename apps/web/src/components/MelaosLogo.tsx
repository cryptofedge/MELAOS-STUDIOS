interface MelaosLogoProps {
  size?: number;
  showText?: boolean;
  textLayout?: 'horizontal' | 'stacked';
  className?: string;
}

export default function MelaosLogo({ size = 40, showText = true, textLayout = 'horizontal', className = '' }: MelaosLogoProps) {
  const s = size;

  const icon = (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* M body gradient: orange top → magenta bottom */}
        <linearGradient id="mFill" x1="50" y1="8" x2="50" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F28C28" />
          <stop offset="45%" stopColor="#E91E8C" />
          <stop offset="100%" stopColor="#AE06ED" />
        </linearGradient>
        {/* Orbital ring gradient: blue → purple → blue */}
        <linearGradient id="orbitGrad" x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#007AFF" />
          <stop offset="50%" stopColor="#AE06ED" />
          <stop offset="100%" stopColor="#007AFF" />
        </linearGradient>
        {/* Waveform left gradient */}
        <linearGradient id="waveLeft" x1="0" y1="0" x2="18" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F28C28" stopOpacity="0" />
          <stop offset="100%" stopColor="#F28C28" />
        </linearGradient>
        {/* Waveform right gradient */}
        <linearGradient id="waveRight" x1="82" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#AE06ED" />
          <stop offset="100%" stopColor="#AE06ED" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── M letterform ── */}
      {/* Outer M fill */}
      <path
        d="M18 88 L18 30 L50 62 L82 30 L82 88 L73 88 L73 50 L50 74 L27 50 L27 88 Z"
        fill="url(#mFill)"
      />
      {/* Inner contour line 1 */}
      <path
        d="M24 82 L24 40 L50 68 L76 40 L76 82"
        fill="none" stroke="#F28C28" strokeWidth="1" strokeOpacity="0.35"
      />
      {/* Inner contour line 2 */}
      <path
        d="M30 76 L30 50 L50 72 L70 50 L70 76"
        fill="none" stroke="#E91E8C" strokeWidth="0.8" strokeOpacity="0.3"
      />
      {/* Inner contour line 3 */}
      <path
        d="M36 70 L36 56 L50 70 L64 56 L64 70"
        fill="none" stroke="#AE06ED" strokeWidth="0.7" strokeOpacity="0.25"
      />
      {/* Top arch cap orange highlight */}
      <path
        d="M18 30 Q18 8 34 8 Q43 8 50 18 Q57 8 66 8 Q82 8 82 30 L73 30 Q73 18 66 14 Q58 10 50 22 Q42 10 34 14 Q27 18 27 30 Z"
        fill="#F28C28"
      />

      {/* ── Sound waveform bars (left side) ── */}
      {/* 6 bars, tallest near center, fading left */}
      <rect x="1"  y="47" width="2" height="6"  fill="url(#waveLeft)" rx="1" />
      <rect x="4"  y="43" width="2" height="14" fill="url(#waveLeft)" rx="1" />
      <rect x="7"  y="40" width="2" height="20" fill="url(#waveLeft)" rx="1" />
      <rect x="10" y="44" width="2" height="12" fill="url(#waveLeft)" rx="1" />
      <rect x="13" y="46" width="2" height="8"  fill="url(#waveLeft)" rx="1" />
      <rect x="16" y="48" width="1.5" height="4" fill="url(#waveLeft)" rx="1" />

      {/* ── Sound waveform bars (right side) ── */}
      <rect x="83"   y="48" width="1.5" height="4"  fill="url(#waveRight)" rx="1" />
      <rect x="85.5" y="46" width="2"   height="8"  fill="url(#waveRight)" rx="1" />
      <rect x="88.5" y="44" width="2"   height="12" fill="url(#waveRight)" rx="1" />
      <rect x="91.5" y="40" width="2"   height="20" fill="url(#waveRight)" rx="1" />
      <rect x="94.5" y="43" width="2"   height="14" fill="url(#waveRight)" rx="1" />
      <rect x="97.5" y="47" width="2"   height="6"  fill="url(#waveRight)" rx="1" />

      {/* ── Orbital ring ── */}
      {/* Bottom arc of ring (behind M) */}
      <ellipse
        cx="50" cy="72" rx="38" ry="11"
        fill="none"
        stroke="url(#orbitGrad)"
        strokeWidth="2.5"
        strokeDasharray="60 999"
        strokeDashoffset="-30"
        strokeOpacity="0.9"
      />
      {/* Top arc of ring (in front of M) */}
      <ellipse
        cx="50" cy="72" rx="38" ry="11"
        fill="none"
        stroke="url(#orbitGrad)"
        strokeWidth="2.5"
        strokeDasharray="60 999"
        strokeDashoffset="30"
        strokeOpacity="0.9"
      />
    </svg>
  );

  if (!showText) return icon;

  if (textLayout === 'stacked') {
    return (
      <div className="flex flex-col items-center gap-1">
        {icon}
        <div className="flex flex-col items-center leading-none">
          <span style={{ color: '#F28C28', fontWeight: 900, fontSize: s * 0.38, letterSpacing: '0.02em', fontFamily: 'Arial Black, sans-serif' }}>
            MELAOS
          </span>
          <span style={{ color: '#ccc', fontWeight: 300, fontSize: s * 0.18, letterSpacing: '0.35em', fontFamily: 'Arial, sans-serif' }}>
            STUDIOS
          </span>
        </div>
      </div>
    );
  }

  // horizontal
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex flex-col leading-none">
        <span style={{ color: '#F28C28', fontWeight: 900, fontSize: s * 0.38, letterSpacing: '0.02em', fontFamily: 'Arial Black, sans-serif', lineHeight: 1 }}>
          MELAOS
        </span>
        <span style={{ color: '#aaa', fontWeight: 300, fontSize: s * 0.17, letterSpacing: '0.32em', fontFamily: 'Arial, sans-serif', lineHeight: 1.2 }}>
          STUDIOS
        </span>
      </div>
    </div>
  );
}
