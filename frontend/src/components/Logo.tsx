import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSlogan = true, className = '' }) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Geometric SVG Legal AI Logo */}
      <div
        className={`${iconDimensions} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-1.5 shadow-md shadow-teal-950/20 border border-teal-500/30 group hover:border-teal-400/60 transition-all`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform transition-transform group-hover:scale-105 duration-200"
        >
          <defs>
            <linearGradient id="logo-beam-gradient" x1="4" y1="12" x2="36" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
            <linearGradient id="logo-core-gradient" x1="15" y1="6" x2="25" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Central Vertical Pillar & Trace Path */}
          <line x1="20" y1="8" x2="20" y2="33" stroke="url(#logo-core-gradient)" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Base Foundation Arch */}
          <path d="M13 33H27" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Horizontal Balance Beam */}
          <path d="M8 14H32" stroke="url(#logo-beam-gradient)" strokeWidth="2" strokeLinecap="round" />

          {/* Fulcrum Pivot Diamond */}
          <polygon points="20,10.5 23.5,14 20,17.5 16.5,14" fill="#2DD4BF" filter="url(#glow)" />

          {/* Left Pan Strings & Tray */}
          <path d="M10 14L6.5 24M10 14L13.5 24" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M5 24C5 26.5 15 26.5 15 24H5Z" fill="#0D9488" fillOpacity="0.4" stroke="#2DD4BF" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Right Pan Strings & Tray */}
          <path d="M30 14L26.5 24M30 14L33.5 24" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <path d="M25 24C25 26.5 35 26.5 35 24H25Z" fill="#0D9488" fillOpacity="0.4" stroke="#2DD4BF" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Dynamic AI Trace Accent Node */}
          <circle cx="20" cy="14" r="2" fill="#FFFFFF" />
          <circle cx="20" cy="23" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* Brand Identity */}
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-slate-900 ${textSizes}`}>
            Lex<span className="text-teal-700">Trace</span>
          </span>
          <span className="bg-gradient-to-r from-teal-700 to-teal-800 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs tracking-wider uppercase">
            AI
          </span>
        </div>
        {showSlogan && (
          <p className="text-[11px] text-slate-500 font-medium tracking-tight hidden sm:block">
            Trace the clause. Understand the risk. Know what to ask.
          </p>
        )}
      </div>
    </div>
  );
};
