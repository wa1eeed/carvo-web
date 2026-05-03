import React from 'react';
import { useI18n } from '../context/I18nContext';
import { useSiteData } from '../context/SiteDataContext';

const StatsBand: React.FC = () => {
  const { t } = useI18n();
  const { content } = useSiteData();

  const stats = [
    { v: `${content.stats_uptime || '99.9'}%`, en: 'Uptime Reliability', ar: 'موثوقية التشغيل' },
    { v: `${content.stats_response_min || '30'}m`, en: 'Avg Response', ar: 'متوسط الاستجابة' },
    { v: `${content.stats_hubs || '15'}+`, en: 'National Hubs', ar: 'مركزاً وطنياً' },
    { v: `${content.stats_partners || '40'}+`, en: 'B2B Partners', ar: 'شريكاً للأعمال' },
  ];

  return (
    <section className="relative py-20 bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 grid-overlay-dark opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center md:border-r md:last:border-r-0 border-white/10 px-2">
              <div className="font-display text-5xl md:text-7xl gold-text mb-3 tracking-tight">
                {s.v}
              </div>
              <div className="text-xs tracking-wide uppercase text-white/50 font-bold">
                {t(s.en, s.ar)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBand;
