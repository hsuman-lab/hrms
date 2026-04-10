interface MyHRLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg' | 'xl';
  theme?: 'dark' | 'light';
}

const TEXT_SIZE: Record<string, string> = {
  sm:   'text-sm',
  base: 'text-base',
  lg:   'text-lg',
  xl:   'text-xl',
};

export default function HarshHRLogo({
  size = 36,
  showText = true,
  textSize = 'lg',
  theme = 'dark',
}: MyHRLogoProps) {
  const r = Math.round(size * 0.22);

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* ── SVG Icon ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size, flexShrink: 0 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="myhr-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#7C3AED" /> {/* violet-600 */}
            <stop offset="50%"  stopColor="#DB2777" /> {/* pink-600   */}
            <stop offset="100%" stopColor="#F59E0B" /> {/* amber-400  */}
          </linearGradient>
          <linearGradient id="myhr-spark" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Background tile */}
        <rect width="40" height="40" rx={r} fill="url(#myhr-bg)" />

        {/* "M" mark — two pillars + chevron peak */}
        {/* Left pillar */}
        <rect x="7" y="11" width="5" height="18" rx="1.5" fill="white" />
        {/* Right pillar */}
        <rect x="28" y="11" width="5" height="18" rx="1.5" fill="white" />
        {/* Left diagonal (M left arm) */}
        <path d="M12 11 L20 20 L12 29" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Right diagonal (M right arm) */}
        <path d="M28 11 L20 20 L28 29" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Spark dot top-right */}
        <circle cx="34" cy="7" r="3.5" fill="url(#myhr-spark)" />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <span className={`font-extrabold tracking-tight leading-none ${TEXT_SIZE[textSize]}`}>
          <span className={theme === 'dark' ? 'text-gray-900' : 'text-white'}>My</span>
          <span style={{ background: 'linear-gradient(90deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HR</span>
        </span>
      )}
    </div>
  );
}
