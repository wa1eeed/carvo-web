import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';

const ProcessSection: React.FC = () => {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const steps = [
    {
      en: { t: 'Request', d: 'A request is created via app, web, partner API, or call center.' },
      ar: { t: 'تقديم الطلب', d: 'يُرسَل الطلب عبر التطبيق أو الموقع أو الواجهة البرمجية للشركاء أو مركز الاتصال.' },
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    },
    {
      en: { t: 'Match', d: 'AI dispatch selects the closest qualified operator and equipment.' },
      ar: { t: 'المطابقة الذكية', d: 'يختار نظام الإرسال الذكي أقرب فريق مؤهل بالمعدات المناسبة لطبيعة الطلب.' },
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
    },
    {
      en: { t: 'Execute', d: 'Certified team performs the service with photo & GPS verification.' },
      ar: { t: 'التنفيذ الميداني', d: 'فريق معتمد ينفذ الخدمة مع توثيق كامل بالصور وتحديد الموقع الجغرافي.' },
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    },
    {
      en: { t: 'Report', d: 'Digital report delivered with full audit trail and timestamps.' },
      ar: { t: 'التقرير الرقمي', d: 'تقرير رقمي شامل يتضمن سجل توثيق كامل مع التوقيت الدقيق لكل خطوة.' },
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    },
  ];

  return (
    <section id="process" ref={ref} className="relative py-28 lg:py-36 px-5 bg-zinc-50 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className={`text-sm font-bold text-zinc-400 mb-5 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <span className="inline-block w-8 h-px bg-zinc-300 align-middle mr-3" />
            {t('How CARVO Works', 'كيف تعمل كارفو')}
          </div>
          <h2 className={`text-5xl md:text-7xl font-black leading-tight text-zinc-900 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {t('FOUR STEPS. ZERO FRICTION.', 'أربع خطوات. بدون تعقيد.')}
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent pointer-events-none" />

          {steps.map((s, i) => (
            <div key={i}
              style={{ transitionDelay: `${i * 150}ms` }}
              className={`group p-8 rounded-3xl bg-white border border-zinc-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              {/* Icon + Number side by side no overlap */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-200 shrink-0">
                  <svg className="w-6 h-6 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    {s.icon}
                  </svg>
                </div>
                <span className="text-5xl font-black text-zinc-100 group-hover:text-amber-200 transition-colors leading-tight select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-3">
                {t(s.en.t, s.ar.t)}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-light">
                {t(s.en.d, s.ar.d)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
