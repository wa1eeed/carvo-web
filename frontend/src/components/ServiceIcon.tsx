import React from 'react';

export const SERVICE_ICON_KEYS = [
  'towing-sos',
  'estimation',
  'inspection',
  'repair',
  'warehousing',
  'selling-auctions',
  'fleet',
  'insurance',
] as const;

export type ServiceIconKey = typeof SERVICE_ICON_KEYS[number];

const ICONS: Record<string, React.ReactNode> = {
  'towing-sos': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="34" width="40" height="22" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M48 40h16l8 16H48V40z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="22" cy="58" r="6" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="22" cy="58" r="2" fill="currentColor" />
      <circle cx="58" cy="58" r="6" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="58" cy="58" r="2" fill="currentColor" />
      <path d="M14 34V22l10-6v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 16l8 4v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 24c3-3 6-3 6 0s-3 3-6 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 20c5-5 12-5 12 0s-7 5-12 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),
  'estimation': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="8" width="36" height="52" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <rect x="22" y="14" width="24" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M26 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26" cy="34" r="2" fill="currentColor" />
      <circle cx="34" cy="34" r="2" fill="currentColor" />
      <circle cx="42" cy="34" r="2" fill="currentColor" />
      <circle cx="26" cy="42" r="2" fill="currentColor" />
      <circle cx="34" cy="42" r="2" fill="currentColor" />
      <circle cx="42" cy="42" r="2" fill="currentColor" />
      <circle cx="26" cy="50" r="2" fill="currentColor" />
      <circle cx="34" cy="50" r="2" fill="currentColor" />
      <circle cx="42" cy="50" r="2" fill="currentColor" />
      <path d="M54 60l8-12 6-4 6-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="74" cy="34" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  'inspection': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="14" width="36" height="50" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <rect x="24" y="8" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M22 30l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 28h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 44l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 42h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="50" r="10" stroke="currentColor" strokeWidth="2.5" />
      <path d="M67 57l5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M55 50l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'repair': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="14" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="40" cy="40" r="4" fill="currentColor" />
      <path d="M40 18v-8M40 70v-8M62 40h8M10 40h8M55 25l5-5M20 60l5-5M55 55l5 5M20 20l5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 12l4 4-6 6-4-4 6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  'warehousing': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32L40 14l32 18v36H8V32z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="20" y="44" width="16" height="14" stroke="currentColor" strokeWidth="2" />
      <rect x="44" y="44" width="16" height="14" stroke="currentColor" strokeWidth="2" />
      <path d="M28 44v14M52 44v14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="40" cy="26" r="3" fill="currentColor" />
      <path d="M14 36v32M66 36v32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  ),
  'selling-auctions': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 60h56v8H12z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 60V36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="22" y="16" width="36" height="14" rx="2" transform="rotate(-25 22 16)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 30l14-6M50 12l14-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="44" r="3" fill="currentColor" />
    </svg>
  ),
  'fleet': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="40" width="30" height="18" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <rect x="40" y="32" width="34" height="26" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="28" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="66" cy="60" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M44 38h26M44 46h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'insurance': (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 8l24 8v20c0 16-10 28-24 36-14-8-24-20-24-36V16l24-8z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 40l8 8 16-18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const FALLBACK = (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="2.5" />
    <path d="M30 40l8 8 16-18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ServiceIcon: React.FC<{ iconKey?: string; className?: string }> = ({ iconKey, className = "w-12 h-12" }) => {
  const node = (iconKey && ICONS[iconKey]) || FALLBACK;
  return <span className={className} style={{ display: 'inline-block' }}>{node}</span>;
};
