import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../lib/api';
import type { Service } from '../lib/types';
import { useI18n } from '../context/I18nContext';
import { useSiteData } from '../context/SiteDataContext';
import { ServiceIcon } from '../components/ServiceIcon';

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const { services } = useSiteData();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    apiGet<Service>(`/api/services/${slug}`)
      .then(setService)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    if (service) {
      const title = lang === 'ar' && service.title_ar ? service.title_ar : service.title_en;
      document.title = `${title} — CARVO`;
    }
  }, [service, lang]);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name && !form.phone && !form.email) return;
    try {
      await apiPost('/api/leads', {
        ...form,
        type: 'service-request',
        service_slug: slug,
        source: 'service-detail',
      });
      setRequestSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (e) {
      // ignore for now
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="font-mono text-xs tracking-widest uppercase text-zinc-400">{t('Loading…', 'جاري التحميل…')}</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-5">
        <div className="text-5xl font-black text-zinc-900 mb-4">404</div>
        <p className="text-zinc-500 mb-8">{t('Service not found.', 'الخدمة غير موجودة.')}</p>
        <Link to="/" className="px-6 py-3 brand-gradient rounded-full font-black text-xs tracking-widest uppercase">
          {t('Back Home', 'العودة للرئيسية')}
        </Link>
      </div>
    );
  }

  const title = lang === 'ar' && service.title_ar ? service.title_ar : service.title_en;
  const longDesc = lang === 'ar' && service.long_description_ar ? service.long_description_ar : service.long_description_en;
  const shortDesc = lang === 'ar' && service.short_description_ar ? service.short_description_ar : service.short_description_en;
  const ctaLabel = lang === 'ar' && service.cta_label_ar ? service.cta_label_ar : (service.cta_label_en || 'Request Service');

  return (
    <article className="bg-white">
      {/* Hero */}
      <header className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          {service.cover_image ? (
            <img src={service.cover_image} alt="" className="w-full h-full object-cover opacity-30" onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
          ) : (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
              <source src="https://carvo.sico.sa/gps.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/85 to-zinc-950" />
          <div className="absolute inset-0 grid-overlay-dark opacity-30" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5">
          <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-wide uppercase font-bold text-white/40 hover:text-amber-300 transition mb-10">
            <svg className="w-4 h-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('All Services', 'كل الخدمات')}
          </Link>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 md:items-end">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
              <ServiceIcon iconKey={service.icon_key || service.slug} className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <div className="font-mono text-xs text-amber-400/80 tracking-widest uppercase mb-3">
                {service.category}
              </div>
              <h1 className={`text-5xl lg:text-7xl font-black leading-[1.2] mb-6 ${lang === 'ar' ? 'font-arabic' : 'font-display tracking-tight'}`}>
                {title}
              </h1>
              <p className="text-white/60 text-lg max-w-2xl font-light leading-relaxed">{shortDesc}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Body grid */}
      <div className="max-w-6xl mx-auto px-5 py-20 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left: long content */}
          <div className="lg:col-span-7">
            <div className="text-xs font-mono tracking-widest uppercase text-zinc-400 mb-5">
              <span className="inline-block w-8 h-px bg-zinc-300 align-middle mr-3" />
              {t('Overview', 'نظرة عامة')}
            </div>

            {/* Service cover image — shown above description if provided */}
            {service.cover_image && (
              <img
                src={service.cover_image}
                alt={title}
                className="w-full h-auto max-h-[480px] object-cover mb-8"
                style={{ objectPosition: 'center' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
              />
            )}

            <div className="prose prose-zinc max-w-none">
              <p className="text-lg text-zinc-700 font-light leading-relaxed whitespace-pre-line">
                {longDesc || shortDesc}
              </p>
            </div>

            {service.process_steps && service.process_steps.length > 0 && (
              <div className="mt-16">
                <div className="text-xs font-mono tracking-widest uppercase text-zinc-400 mb-5">
                  <span className="inline-block w-8 h-px bg-zinc-300 align-middle mr-3" />
                  {t('Process', 'الآلية')}
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-zinc-900 mb-10 leading-[1.3]">
                  {t('How it works', 'كيف تعمل')}
                </h2>
                <div className="space-y-4">
                  {service.process_steps.map((step, i) => (
                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <div className="w-12 h-12 rounded-xl brand-gradient flex items-center justify-center font-black text-xl text-zinc-900 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-zinc-900 text-lg mb-1">{step.title}</div>
                        <p className="text-zinc-500 text-sm leading-relaxed font-light">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: highlights + request form */}
          <div className="lg:col-span-5">
            {service.highlights && service.highlights.length > 0 && (
              <div className="mb-8 p-7 rounded-3xl bg-zinc-950 text-white">
                <div className="text-xs font-mono tracking-widest uppercase text-amber-400/80 mb-5">
                  {t('Key Highlights', 'أبرز المزايا')}
                </div>
                <ul className="space-y-3">
                  {service.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mt-0.5 shrink-0">
                        <svg className="w-3 h-3 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-white/85">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* App Download Box */}
            <div id="request" className="rounded-3xl overflow-hidden border border-[#c9a96e]/20" style={{background: 'linear-gradient(145deg, #1a1408 0%, #0f0c05 60%, #1c1203 100%)'}}>
              {/* Top accent line */}
              <div className="h-px w-full" style={{background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)'}} />

              {/* Header */}
              <div className="px-7 pt-6 pb-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background: '#c9a96e'}}>
                    <svg className="w-4 h-4 text-zinc-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 2H7C5.9 2 5 2.9 5 4v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V4h10v12z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{color: '#c9a96e'}}>
                    {t('CARVO APP', 'تطبيق كارفو')}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white leading-[1.3] mb-2">
                  {t('Request via CARVO App', 'اطلب الخدمة عبر تطبيق كارفو')}
                </h3>
                <p className="text-sm font-light leading-relaxed" style={{color: 'rgba(201,169,110,0.6)'}}>
                  {t('Scan the QR code or download the app to request this service instantly.', 'امسح الرمز أو حمّل التطبيق لطلب الخدمة فوراً.')}
                </p>
              </div>

              {/* QR Code */}
              <div className="mx-7 mb-5 rounded-2xl p-5 flex items-center justify-center border border-[#c9a96e]/15" style={{background: 'rgba(201,169,110,0.06)'}}>
                <div className="bg-white rounded-xl p-3">
                  <svg viewBox="0 0 200 200" className="w-36 h-36" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="10" width="60" height="60" rx="6" fill="#111" />
                    <rect x="18" y="18" width="44" height="44" rx="4" fill="white" />
                    <rect x="26" y="26" width="28" height="28" rx="2" fill="#111" />
                    <rect x="130" y="10" width="60" height="60" rx="6" fill="#111" />
                    <rect x="138" y="18" width="44" height="44" rx="4" fill="white" />
                    <rect x="146" y="26" width="28" height="28" rx="2" fill="#111" />
                    <rect x="10" y="130" width="60" height="60" rx="6" fill="#111" />
                    <rect x="18" y="138" width="44" height="44" rx="4" fill="white" />
                    <rect x="26" y="146" width="28" height="28" rx="2" fill="#111" />
                    <rect x="80" y="80" width="6" height="6" fill="#111"/><rect x="96" y="80" width="6" height="6" fill="#111"/><rect x="112" y="80" width="6" height="6" fill="#111"/>
                    <rect x="88" y="88" width="6" height="6" fill="#111"/><rect x="104" y="88" width="6" height="6" fill="#111"/>
                    <rect x="80" y="96" width="6" height="6" fill="#111"/><rect x="96" y="96" width="6" height="6" fill="#111"/><rect x="112" y="96" width="6" height="6" fill="#111"/>
                    <rect x="88" y="104" width="6" height="6" fill="#111"/><rect x="80" y="112" width="6" height="6" fill="#111"/><rect x="112" y="112" width="6" height="6" fill="#111"/>
                    <rect x="80" y="130" width="6" height="6" fill="#111"/><rect x="96" y="138" width="6" height="6" fill="#111"/><rect x="112" y="130" width="6" height="6" fill="#111"/>
                    <rect x="80" y="146" width="6" height="6" fill="#111"/><rect x="104" y="154" width="6" height="6" fill="#111"/><rect x="88" y="162" width="6" height="6" fill="#111"/>
                    <rect x="130" y="80" width="6" height="6" fill="#111"/><rect x="146" y="80" width="6" height="6" fill="#111"/><rect x="162" y="88" width="6" height="6" fill="#111"/>
                    <rect x="138" y="96" width="6" height="6" fill="#111"/><rect x="154" y="104" width="6" height="6" fill="#111"/><rect x="130" y="112" width="6" height="6" fill="#111"/>
                    <rect x="88" y="88" width="24" height="24" rx="4" fill="#c9a96e" />
                    <text x="100" y="104" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a1408">C</text>
                  </svg>
                </div>
              </div>

              {/* Download buttons */}
              <div className="px-7 pb-7 grid grid-cols-2 gap-3">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all hover:opacity-90 border border-[#c9a96e]/20"
                  style={{background: 'rgba(201,169,110,0.1)'}}
                >
                  <svg className="w-6 h-6 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <div className="text-[9px] leading-none" style={{color: 'rgba(201,169,110,0.6)'}}>{t('Download on the', 'حمّل من')}</div>
                    <div className="text-sm font-black leading-tight text-white">App Store</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all hover:opacity-90 border border-[#c9a96e]/20"
                  style={{background: 'rgba(201,169,110,0.1)'}}
                >
                  <svg className="w-6 h-6 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.3.17.64.21.96.13l11.37-11.37L12.1 9.11 3.18 23.76zm17.14-12.09c.42-.35.68-.86.68-1.44s-.26-1.09-.68-1.44L18.1 7.5 14.62 11l3.48 3.48 2.22-2.81zM3.14.24C2.82.16 2.48.2 2.18.37.83 1.13.83 2.87.83 2.87v18.26s0 1.74 1.35 2.5c.3.17.64.21.96.13L15.51 12 3.14.24z"/>
                  </svg>
                  <div>
                    <div className="text-[9px] leading-none" style={{color: 'rgba(201,169,110,0.6)'}}>{t('Get it on', 'حمّل من')}</div>
                    <div className="text-sm font-black leading-tight text-white">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Other services */}
        {services.length > 1 && (
          <div className="mt-24 pt-16 border-t border-zinc-100">
            <h3 className="text-3xl lg:text-4xl font-black text-zinc-900 mb-10 leading-[1.3]">
              {t('Other capabilities', 'خدمات أخرى')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.filter((s) => s.slug !== service.slug).slice(0, 3).map((s) => (
                <Link key={s.id} to={`/${lang}/services/${s.slug}`} className="group p-6 rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 mb-4 group-hover:bg-zinc-900 group-hover:text-white transition">
                    <ServiceIcon iconKey={s.icon_key || s.slug} className="w-7 h-7" />
                  </div>
                  <div className="font-bold text-zinc-900">{lang === 'ar' && s.title_ar ? s.title_ar : s.title_en}</div>
                  <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{lang === 'ar' && s.short_description_ar ? s.short_description_ar : s.short_description_en}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default ServiceDetailPage;
