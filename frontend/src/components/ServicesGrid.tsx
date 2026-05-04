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
    <section id="services" ref={sectionRef} className="relative py-24 lg:py-32 px-5 overflow-hidden">

      {/* Video background — very subtle, light overlay on top */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLVideoElement).style.display='none'; }}>
          <source src="https://cdn.pixabay.com/video/2023/09/25/182015-868017678_large.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2016/12/30/6975-197634410_large.mp4" type="video/mp4" />
        </video>
        {/* Light white overlay — keeps section bright, video barely visible */}
        <div className="absolute inset-0" style={{background: 'rgba(248,248,248,0.82)'}} />
      </div>

      {/* Subtle gold radial accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none z-0"
        style={{background: 'radial-gradient(circle at 0% 0%, rgba(201,169,110,0.06) 0%, transparent 65%)'}} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none z-0"
        style={{background: 'radial-gradient(circle at 100% 100%, rgba(201,169,110,0.06) 0%, transparent 65%)'}} />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="grid md:grid-cols-12 gap-8 mb-20 items-end">
          <div className="md:col-span-7">
            <div className={`text-zinc-400 font-mono text-xs tracking-wide uppercase mb-5 flex items-center gap-3 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              <span className="inline-block w-8 h-px bg-zinc-300" />
              {t('Capabilities · 06', 'خدماتنا · ٠٦')}
            </div>
            <h2 className={`font-black leading-[1.15] text-zinc-900 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${lang === 'ar' ? 'font-arabic text-4xl md:text-6xl' : 'font-display text-5xl md:text-7xl tracking-tight'}`}>
              {t(
                <><span>END-TO-END VEHICLE</span><br /><span className="gold-text">LOGISTICS STACK</span></>,
                <><span>منظومة متكاملة</span><br /><span className="gold-text">لخدمات المركبات</span></>
              )}
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className={`text-base md:text-lg text-zinc-500 leading-relaxed font-light transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
              {t(
                'Each capability is engineered for B2B integration — direct dispatch APIs for insurance partners, fleet portals for enterprise clients, and a public app for individuals.',
                'كل خدمة مصممة للتكامل مع قطاع الأعمال — واجهات برمجية لشركات التأمين، وبوابات متخصصة لأساطيل الشركات، وتطبيق للأفراد.'
              )}
            </p>
          </div>
        </div>

        {services.length === 0 && (
          <div className="text-center text-zinc-400 py-20">
            <div className="font-mono text-xs tracking-widest uppercase">{t('Loading services…', 'جاري تحميل الخدمات…')}</div>
          </div>
        )}

        {/* Cards — fully light, clean white */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, idx) => {
            const title = lang === 'ar' && s.title_ar ? s.title_ar : s.title_en;
            const desc = lang === 'ar' && s.short_description_ar ? s.short_description_ar : s.short_description_en;
            return (
              <Link to={`/${lang}/services/${s.slug}`} key={s.id}
                style={{ transitionDelay: `${idx * 80}ms` }}
                className={`group relative flex flex-col h-full overflow-hidden rounded-3xl bg-white border border-zinc-100 shadow-sm hover:shadow-xl hover:border-[#c9a96e]/30 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                {/* Gold top line on hover */}
                <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)'}} />

                <div className="p-8 flex flex-col flex-1">
                  {/* Icon + number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)'}}>
                      <ServiceIcon iconKey={s.icon_key || s.slug} className="w-8 h-8 text-[#8a6f3d]" />
                    </div>
                    <span className="font-mono text-xs text-zinc-300 tracking-widest">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="mb-2">
                    <span className="text-[10px] font-black tracking-widest uppercase text-zinc-400">{s.category}</span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-black mb-3 text-zinc-900 group-hover:text-[#8a6f3d] transition-colors ${lang === 'ar' ? 'font-arabic' : 'tracking-tight'}`}>
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-500 leading-relaxed font-light text-sm flex-1 mb-5">{desc}</p>

                  {/* Highlights */}
                  {s.highlights?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {s.highlights.slice(0, 3).map((h, i) => (
                        <span key={i} className="text-[11px] font-bold text-zinc-500 px-2.5 py-1 bg-zinc-50 rounded-full border border-zinc-100">{h}</span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-zinc-100">
                    <span className={`text-xs font-black uppercase tracking-wide text-zinc-400 group-hover:text-[#8a6f3d] transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}>
                      {t('View Service', 'تفاصيل الخدمة')}
                    </span>
                    <span className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:border-[#c9a96e] group-hover:text-[#8a6f3d] group-hover:bg-[#c9a96e]/10 transition-all duration-300">
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
