import React from 'react';

// Light version (silver) — use on dark backgrounds (Hero, Footer, dark Navbar)
export const LogoLight: React.FC<{ className?: string }> = ({ className = 'h-10 w-auto' }) => (
  <img
    src="/logo-light.png"
    alt="CARVO"
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Dark version (black) — use on light backgrounds (Navbar on white)
export const LogoDark: React.FC<{ className?: string }> = ({ className = 'h-10 w-auto' }) => (
  <img
    src="/logo-dark.png"
    alt="CARVO"
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

// Auto version — switches based on prop
export const Logo: React.FC<{ dark?: boolean; className?: string }> = ({ dark = false, className = 'h-10 w-auto' }) => (
  dark ? <LogoDark className={className} /> : <LogoLight className={className} />
);

// Keep WingsIcon for backward compatibility — now uses actual logo
export const WingsIcon: React.FC<{ className?: string }> = ({ className }) => {
  // Parse size from className (w-16, w-20, etc.)
  const sizeMap: Record<string, string> = {
    'w-9': 'h-8', 'w-10': 'h-9', 'w-16': 'h-12', 'w-20': 'h-14',
  };
  const match = className?.match(/w-(\d+)/);
  const heightClass = match ? sizeMap[`w-${match[1]}`] || 'h-10' : 'h-10';
  return <LogoLight className={`${heightClass} w-auto`} />;
};

export default Logo;
