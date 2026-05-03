import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useSiteData } from '../context/SiteDataContext';
import { ServiceIcon } from './ServiceIcon';

const ServicesGrid: React.FC = () => {
  const { t, lang } = useI18n();
  const { services } = useSiteData();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="relative py-24 lg:py-32 px-5 overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-25">
          <source src="https://carvo.sico.sa/hero-carvo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        <div className="absolute inset-0 grid-overlay-dark opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 mb-20 items-end">
          <div className="md:col-span-7">
            <div className={`text-amber-400/80 font-mono text-xs tracking-wide uppercase mb-5 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              <span className="inline-block w-8 h-px bg-amber-400/60 align-middle mr-3" />
              {t('Capabilities · 06', 'خدماتنا · ٠٦')}
            </div>
            <h2 className={`font-display text-5xl md:text-7xl tracking-tight leading-[1.15] transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {t(
                <><span>END-TO-END VEHICLE</span><br /><span className="gold-text">LOGISTICS STACK</span></>,
                <><span>منظومة متكاملة</span><br /><span className="gold-text">لخدمات المركبات</span></>
              )}
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className={`text-base md:text-lg text-white/60 leading-relaxed font-light transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {t(
                'Each capability is engineered for B2B integration direct dispatch APIs for insurance partners, fleet portals for enterprise clients, and a public app for individuals.',
                'كل خدمة مصممة للتكامل مع قطاع الأعمال واجهات برمجية مباشرة لشركات التأمين، وبوابات متخصصة لأساطيل الشركات، وتطبيق للأفراد.'
              )}
            </p>
          </div>
        </div>

        {services.length === 0 && (
          <div className="text-center text-white/40 py-20">
            <div className="font-mono text-xs tracking-widest uppercase">{t('Loading services…', 'جاري تحميل الخدمات…')}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, idx) => {
            const title = lang === 'ar' && s.title_ar ? s.title_ar : s.title_en;
            const desc = lang === 'ar' && s.short_description_ar ? s.short_description_ar : s.short_description_en;
            return (
              <Link to={`/services/${s.slug}`} key={s.id}
                style={{ transitionDelay: `${idx * 80}ms` }}
                className={`group relative flex flex-col h-full overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400/90 group-hover:bg-amber-400/10 group-hover:border-amber-400/30 transition-all shrink-0">
                      <ServiceIcon iconKey={s.icon_key || s.slug} className="w-9 h-9" />
                    </div>
                    <span className="font-mono text-xs text-white/20 tracking-widest">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-bold tracking-wide uppercase text-white/40">{s.category}</span>
                  </div>
                  <h3 className={`text-2xl font-black mb-3 tracking-tight text-white group-hover:text-amber-200 transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {title}
                  </h3>
                  <p className="text-white/50 leading-relaxed font-light text-sm flex-1 mb-6">{desc}</p>
                  {s.highlights?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {s.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-xs font-bold text-white/60 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">{h}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                    <span className="text-xs font-black uppercase tracking-wide text-white/40 group-hover:text-amber-300 transition-colors">
                      {t('View Service', 'تفاصيل الخدمة')}
                    </span>
                    <span className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-amber-400 group-hover:border-amber-400 group-hover:text-zinc-900 text-white/40 transition-all">
                      <svg className="w-4 h-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
