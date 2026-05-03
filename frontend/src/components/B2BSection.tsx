import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';

const B2BSection: React.FC = () => {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const tracks = [
    {
      titleEn: 'Insurance Companies', titleAr: 'شركات التأمين',
      descEn: 'From the first notice of loss to final claim closure. Full lifecycle orchestration with real-time visibility, automated SLA enforcement, and fraud reduction.',
      descAr: 'من أول إشعار بالخسارة حتى إغلاق المطالبة. إدارة كاملة لدورة حياة المطالبة مع رؤية فورية وتطبيق تلقائي لمستويات الخدمة وتقليص الاحتيال.',
      bullets: [
        ['Full claim lifecycle from FNOL to closure', 'إدارة كاملة من أول إشعار حتى إغلاق المطالبة'],
        ['Total loss and salvage auction management', 'إدارة الخسارة الكلية ومزادات الخردة'],
        ['Automated SLA tracking and fraud prevention', 'تتبع مستوى الخدمة وإيقاف الاحتيال تلقائياً'],
      ],
    },
    {
      titleEn: 'SOS & Roadside Providers', titleAr: 'مزودو خدمات المساعدة على الطريق',
      descEn: 'Plug into the largest towing and recovery network in the Kingdom. Smart routing fills your capacity, eliminates dead miles, and keeps your fleet fully utilized.',
      descAr: 'انضم إلى أكبر شبكة سحب واسترجاع في المملكة. التوجيه الذكي يملأ طاقتك ويلغي الرحلات الفارغة ويبقي أسطولك في حالة تشغيل مستمر.',
      bullets: [
        ['Smart dispatch and route optimization', 'إرسال ذكي وتحسين المسارات آلياً'],
        ['Zero idle time through overflow routing', 'صفر رحلات فارغة من خلال توجيه الفائض'],
        ['Guaranteed payment per completed job', 'دفع مضمون عند إتمام كل مهمة'],
      ],
    },
    {
      titleEn: 'Fleet & Enterprise', titleAr: 'أساطيل الشركات والمؤسسات',
      descEn: 'Inspection, maintenance, storage and repair for enterprise fleets at scale. One centralized portal, one consolidated invoice, one accountable partner.',
      descAr: 'فحص وصيانة وتخزين وإصلاح لأساطيل الشركات بأي حجم. بوابة مركزية واحدة وفاتورة موحدة وشريك مسؤول بمستويات خدمة محددة.',
      bullets: [
        ['Real-time fleet visibility dashboard', 'لوحة مراقبة فورية لكامل الأسطول'],
        ['Scheduled inspection and preventive maintenance', 'فحص دوري وصيانة وقائية مبرمجة'],
        ['Secure warehousing across 15 KSA locations', 'تخزين آمن في 15 موقع على مستوى المملكة'],
      ],
    },
  ];

  return (
    <section id="b2b" ref={ref} className="relative py-28 lg:py-36 bg-white border-y border-zinc-100 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.10), transparent 70%)' }} />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.04), transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className={`text-sm font-bold tracking-wide uppercase text-amber-700/80 mb-5 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {t('Enterprise Solutions', 'حلول المؤسسات والشركات')}
          </div>
          <h2 className={`font-display text-5xl md:text-7xl tracking-tight leading-[1.15] mb-6 text-zinc-900 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {t(
              <><span>STOP MANAGING VENDORS.</span><br /><span className="gold-text">START OWNING THE PROCESS.</span></>,
              <><span>توقف عن إدارة الموردين.</span><br /><span className="gold-text">امتلك العملية بالكامل.</span></>
            )}
          </h2>
          <p className={`text-zinc-500 text-lg leading-relaxed font-light transition-all duration-700 delay-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            {t(
              'The market does not need another service vendor. It needs a unifying infrastructure. CARVO is the operating system that connects insurers, towing providers, workshops, and warehouses on one platform.',
              'السوق لا يحتاج مزود خدمة آخر. يحتاج بنية تحتية موحدة. كارفو هو نظام التشغيل الذي يربط شركات التأمين ومزودي السحب وورش الإصلاح والمستودعات على منصة واحدة.'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tracks.map((tr, i) => (
            <div key={i} style={{ transitionDelay: `${i * 120}ms` }}
              className={`group relative p-8 lg:p-10 rounded-3xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              <div className="text-xs font-bold text-zinc-300 tracking-wide mb-6">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">
                {t(tr.titleEn, tr.titleAr)}
              </h3>
              <div className="w-10 h-[2px] gold-gradient rounded-full mb-6" />
              <p className="text-zinc-500 text-sm leading-relaxed font-light mb-8">
                {t(tr.descEn, tr.descAr)}
              </p>
              <ul className="space-y-3 mb-8">
                {tr.bullets.map((b, bi) => (
                  <li key={bi} className="flex items-start gap-3 text-sm text-zinc-700">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t(b[0], b[1])}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-zinc-100">
                <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 text-xs font-black tracking-wide uppercase text-zinc-900 hover:text-amber-600 transition-colors">
                  {t('Request a Demo', 'احجز عرضاً توضيحياً')}
                  <svg className="w-4 h-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default B2BSection;
