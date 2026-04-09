import React from 'react';

interface HarshHRLogoProps {
  size?: number;      // icon square size in px
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg' | 'xl';
  theme?: 'dark' | 'light'; // 'dark' = colored text on white bg, 'light' = white text on dark bg
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
}: HarshHRLogoProps) {
  const half = size / 2;
  const r = Math.round(size * 0.25);  // corner radius

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
        {/* Background tile */}
        <rect width="40" height="40" rx={r} fill="url(#harshhr-grad)" />

        {/* Stylised "H" built from three blocks — left pillar, crossbar, right pillar */}
        {/* Left pillar */}
        <rect x="8" y="9" width="6" height="22" rx="2" fill="white" />
        {/* Right pillar */}
        <rect x="26" y="9" width="6" height="22" rx="2" fill="white" />
        {/* Crossbar */}
        <rect x="8" y="17" width="24" height="6" rx="2" fill="white" />

        {/* Small "spark" dot — top-right accent */}
        <circle cx="33" cy="8" r="3" fill="#FCD34D" />

        <defs>
          <linearGradient id="harshhr-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0891B2" />   {/* cyan-600 */}
            <stop offset="100%" stopColor="#0F766E" />  {/* teal-700 */}
          </linearGradient>
        </defs>
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <span className={`font-extrabold tracking-tight leading-none ${TEXT_SIZE[textSize]}`}>
          <span className={theme === 'dark' ? 'text-gray-900' : 'text-white'}>Harsh</span>
          <span className="text-cyan-600">HR</span>
        </span>
      )}
    </div>
  );
}
