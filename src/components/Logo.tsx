import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'color';
}

export default function Logo({ className = '', size = 40, variant = 'color' }: LogoProps) {
  // Determine colors based on variant
  const primaryColor = variant === 'light' ? '#FFFFFF' : '#0D2B52';
  const secondaryColor = variant === 'light' ? '#FFFFFF' : '#22B8B5';
  const accentColor = variant === 'light' ? '#FFFFFF' : '#2ECC71';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Heart Outline / Body */}
        <path
          d="M50 82C48 82 18 58.5 18 38C18 24.5 28.5 14 42 14C45.5 14 48 15 50 16.5C52 15 54.5 14 58 14C71.5 14 82 24.5 82 38C82 58.5 52 82 50 82Z"
          fill={variant === 'light' ? 'rgba(255,255,255,0.1)' : 'rgba(34, 184, 181, 0.08)'}
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bridge Arch */}
        <path
          d="M15 62C30 52 70 52 85 62"
          stroke={secondaryColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Bridge Pillars */}
        <path d="M35 56.5V64" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M50 55V65" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M65 56.5V64" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" />

        {/* Medical Cross */}
        <path
          d="M50 25V45M40 35H60"
          stroke={variant === 'color' ? accentColor : secondaryColor}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col select-none">
        <span 
          className="font-display font-bold tracking-tight leading-none text-xl md:text-2xl"
          style={{ color: primaryColor }}
        >
          Care<span style={{ color: secondaryColor }}>Bridge</span>
        </span>
        <span 
          className="font-mono text-[9px] uppercase tracking-widest leading-none mt-1 font-semibold opacity-80"
          style={{ color: secondaryColor }}
        >
          Hospital
        </span>
      </div>
    </div>
  );
}
