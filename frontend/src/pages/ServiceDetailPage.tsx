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
              <div className="mb-8 rounded-2xl overflow-hidden bg-zinc-100">
                <img
                  src={service.cover_image}
                  alt={title}
                  className="w-full h-auto max-h-[400px] object-cover"
                  style={{ objectPosition: 'center' }}
                />
              </div>
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

            {/* Request form */}
            <div id="request" className="p-7 rounded-3xl border border-zinc-100 bg-white shadow-xl shadow-zinc-100/50">
              <h3 className="text-2xl font-black text-zinc-900 mb-2 leading-[1.3]">{t('Request this service', 'اطلب هذه الخدمة')}</h3>
              <p className="text-zinc-500 text-sm mb-6 font-light">
                {t('We respond within minutes during business hours.', 'نرد خلال دقائق ضمن ساعات العمل.')}
              </p>

              {requestSent ? (
                <div className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-sm">
                  {t('Got it. Our dispatch team will reach out shortly.', 'استلمنا طلبك. سيتواصل معك فريق الإرسال قريباً.')}
                </div>
              ) : (
                <form onSubmit={submitRequest} className="space-y-3">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('Full Name', 'الاسم الكامل')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t('Phone', 'الهاتف')} className="px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900" />
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder={t('Email', 'البريد')} className="px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900" />
                  </div>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t('Details (optional)', 'تفاصيل (اختياري)')} rows={3} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-none" />
                  <button type="submit" className="w-full py-4 brand-gradient rounded-full font-black text-xs tracking-wide uppercase hover:scale-[1.01] transition">
                    {ctaLabel}
                  </button>
                </form>
              )}
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
                <Link key={s.id} to={`/services/${s.slug}`} className="group p-6 rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition-all">
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
