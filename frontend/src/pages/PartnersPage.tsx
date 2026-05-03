import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { apiPost } from '../lib/api';

/* ─── Animated counter ──────────────────────────────────────────── */
const Counter: React.FC<{ to: number; suffix?: string; duration?: number }> = ({
  to, suffix = '', duration = 1800,
}) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
};

/* ─── Section observer hook ─────────────────────────────────────── */
function useVisible(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

/* ─── Partner types ──────────────────────────────────────────────── */
const PARTNER_TYPES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect x="4" y="20" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M30 26h12l4 8H30V26z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="12" cy="36" r="4" stroke="currentColor" strokeWidth="2.5"/>
        <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M8 20V12l8-4v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    en: { title: 'Towing & Recovery', desc: 'Fleet operators providing vehicle towing, roadside rescue, and breakdown response across the Kingdom.' },
    ar: { title: 'أساطيل السحب والإنقاذ', desc: 'شركات السحب وخدمات المساعدة على الطريق وفرق الإنقاذ في جميع مناطق المملكة.' },
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect x="6" y="8" width="36" height="32" rx="3" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M16 20h6M16 28h16M16 24h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="34" cy="20" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M34 18v4M32 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    en: { title: 'Auto Workshops', desc: 'Certified repair shops and body workshops ready to receive insured vehicles and process repair bids digitally.' },
    ar: { title: 'ورش الإصلاح والصيانة', desc: 'ورش معتمدة تستقبل المركبات المؤمنة وتستلم أعمال الإصلاح وتُدير دفعاتها بشكل رقمي.' },
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <path d="M24 4l20 10v10c0 12-8 20-20 24C12 44 4 36 4 24V14L24 4z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M16 24l6 6 10-12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    en: { title: 'Vehicle Inspection Centers', desc: 'Technical inspection specialists providing damage assessments, total-loss evaluations, and certified condition reports.' },
    ar: { title: 'مراكز الفحص الفني', desc: 'متخصصون في تقييم الأضرار وتحديد حالات الخسارة الكلية وإصدار تقارير الحالة المعتمدة.' },
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <path d="M6 18l18-12 18 12v22H6V18z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="14" y="28" width="10" height="12" stroke="currentColor" strokeWidth="2"/>
        <rect x="26" y="28" width="10" height="12" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 22h8M28 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    en: { title: 'Storage & Warehousing', desc: 'Secure vehicle storage facilities and yards managing salvage vehicles, pending assessments, and total-loss inventory.' },
    ar: { title: 'المستودعات والتخزين', desc: 'مرافق تخزين آمنة لإدارة المركبات المتضررة والمركبات في انتظار التقييم ومخزون الخسارة الكلية.' },
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M24 14v10l6 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M16 8l4 3M32 8l-4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    en: { title: 'Car Care & Detailing', desc: 'Wash, polish, detailing, and maintenance service providers ready to scale through our institutional demand pipeline.' },
    ar: { title: 'مراكز العناية بالسيارات', desc: 'مراكز الغسيل والتلميع والعناية والصيانة الخفيفة المستعدة للتوسع عبر مسار الطلب المؤسسي.' },
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect x="6" y="6" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M14 42h20M24 34v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M16 18h16M16 24h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="34" cy="24" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    en: { title: 'Spare Parts Suppliers', desc: 'Parts dealers and distributors integrated into the repair workflow — supplying verified components to our network workshops.' },
    ar: { title: 'موردو قطع الغيار', desc: 'تجار وموزعو قطع الغيار متكاملون مع سير عمل الإصلاح لتوريد مكونات معتمدة لورش شبكتنا.' },
  },
];

/* ─── Benefits ───────────────────────────────────────────────────── */
const BENEFITS = [
  {
    en: { t: 'Guaranteed Revenue Stream', d: 'Receive a consistent flow of service requests from individuals, businesses, and fleet operators — no chasing clients, no empty days.' },
    ar: { t: 'تدفق إيرادات مضمون', d: 'استلم تدفقاً ثابتاً من طلبات الخدمة من الأفراد والشركات وأساطيل المركبات — بدون مطاردة عملاء، بدون أيام فارغة.' },
  },
  {
    en: { t: 'Digital Operations System', d: 'Replace manual WhatsApp coordination with a fully digital dispatch, tracking, invoicing, and payment collection system.' },
    ar: { t: 'نظام تشغيل رقمي', d: 'استبدل التنسيق اليدوي عبر واتساب بنظام رقمي متكامل للإرسال والتتبع والفوترة وتحصيل المدفوعات.' },
  },
  {
    en: { t: 'Fast & Reliable Payment', d: 'Automated payment clearance upon job completion. No disputes, no delays, no follow-ups with insurance accounting teams.' },
    ar: { t: 'دفع سريع وموثوق', d: 'تسوية مدفوعات تلقائية عند إتمام المهمة. بدون نزاعات ولا تأخيرات ولا متابعات مع أقسام المحاسبة.' },
  },
  {
    en: { t: 'Smart Job Routing', d: 'Jobs are dispatched to you based on proximity, capacity, and specialization — maximizing your fleet utilization.' },
    ar: { t: 'توجيه ذكي للمهام', d: 'توزيع المهام بناءً على الموقع والطاقة والتخصص — لتحقيق أعلى استثمار لأسطولك وطاقتك.' },
  },
  {
    en: { t: 'Build Your Reputation', d: 'Performance scores, customer ratings, and certification badges that open doors to premium insurance contracts.' },
    ar: { t: 'ابنِ سمعتك المهنية', d: 'درجات أداء وتقييمات عملاء وشارات اعتماد تفتح أبواب عقود التأمين المميزة.' },
  },
  {
    en: { t: 'National Network Access', d: 'Tap into demand from all 13 regions. Expand beyond your local market through the CARVO infrastructure.' },
    ar: { t: 'وصول لشبكة وطنية', d: 'استفد من الطلب في المناطق الـ13. توسع خارج سوقك المحلي من خلال بنية كارفو التحتية.' },
  },
];

/* ─── Steps ──────────────────────────────────────────────────────── */
const STEPS = [
  {
    en: { t: 'Apply Online', d: 'Fill out the partner application. Tell us about your services, coverage area, and capacity.' },
    ar: { t: 'تقدم إلكترونياً', d: 'أكمل طلب الانضمام. أخبرنا عن خدماتك ومناطق تغطيتك وطاقتك الاستيعابية.' },
  },
  {
    en: { t: 'Verification & Onboarding', d: 'Our team verifies your credentials, reviews your fleet or facility, and sets up your digital account.' },
    ar: { t: 'التحقق والتأهيل', d: 'يتحقق فريقنا من بياناتك ويراجع أسطولك أو منشأتك ويُعد حسابك الرقمي.' },
  },
  {
    en: { t: 'System Integration', d: 'Connect to the CARVO platform. Your team gets trained on the dispatch app, job management, and reporting tools.' },
    ar: { t: 'الربط بالمنظومة', d: 'اتصل بمنصة كارفو. يتدرب فريقك على تطبيق الإرسال وإدارة المهام وأدوات التقارير.' },
  },
  {
    en: { t: 'Start Receiving Jobs', d: 'Go live. Receive your first institutional job orders and start building your performance record on CARVO.' },
    ar: { t: 'ابدأ استقبال المهام', d: 'انطلق. استلم أولى أوامر العمل المؤسسية وابدأ ببناء سجل أدائك على كارفو.' },
  },
];

/* ─── Main Page ──────────────────────────────────────────────────── */
const PartnersPage: React.FC = () => {
  const { t, lang } = useI18n();
  const hero = useVisible(0.05);
  const types = useVisible();
  const benefits = useVisible();
  const steps = useVisible();
  const form = useVisible();

  const [application, setApplication] = useState({
    name: '', company: '', type: '', city: '', phone: '', email: '', capacity: '', message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submitApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application.name || !application.phone) return;
    setFormStatus('sending');
    try {
      await apiPost('/api/leads', {
        ...application,
        type: 'partner-application',
        source: 'partners-page',
        message: `Type: ${application.type} | City: ${application.city} | Capacity: ${application.capacity} | ${application.message}`,
      });
      setFormStatus('sent');
    } catch {
      setFormStatus('error');
    }
  };

  const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Khobar', 'Abha', 'Tabuk', 'Other'];

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        ref={hero.ref as React.RefObject<HTMLElement>}
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-zinc-950 text-white"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30">
            <source src="https://carvo.sico.sa/gps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/80 to-zinc-950" />
          <div className="absolute inset-0 grid-overlay-dark opacity-30" />
          {/* Gold spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh]"
               style={{ background: 'radial-gradient(ellipse at top, rgba(201,169,110,0.12) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-32 text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-3 px-5 py-2.5 mb-10 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-sm font-bold tracking-wide transition-all duration-700 ${hero.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('CARVO Partner Network', 'شبكة شركاء كارفو')}
          </div>

          {/* Headline */}
          <h1 className={`font-black leading-tight mb-6 transition-all duration-700 delay-100 ${hero.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${lang === 'ar' ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-5xl sm:text-6xl md:text-7xl tracking-tight'}`}>
            {lang === 'ar' ? (
              <>
                <span className="block text-white">توقف عن البحث</span>
                <span className="block text-white">عن العملاء.</span>
                <span className="block gold-text mt-2">دعهم يجدونك.</span>
              </>
            ) : (
              <>
                <span className="font-display block text-white">STOP CHASING</span>
                <span className="font-display block text-white">CLIENTS.</span>
                <span className="font-display block gold-text mt-2">LET THEM FIND YOU.</span>
              </>
            )}
          </h1>

          <p className={`text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto mb-12 transition-all duration-700 delay-200 ${hero.vis ? 'opacity-100' : 'opacity-0'}`}>
            {t(
              'Join the platform that connects vehicle service providers to thousands of daily service requests across Saudi Arabia — from individuals needing roadside help to businesses managing fleets.',
              'انضم إلى المنصة التي تربط مزودي خدمات السيارات بآلاف الطلبات اليومية في المملكة — من أفراد يحتاجون مساعدة على الطريق إلى شركات تدير أساطيلها.'
            )}
          </p>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-14 transition-all duration-700 delay-300 ${hero.vis ? 'opacity-100' : 'opacity-0'}`}>
            {[
              { v: 40, s: '+', en: 'Business Clients', ar: 'عميل مؤسسي' },
              { v: 15, s: '+', en: 'KSA Coverage Hubs', ar: 'مركز تغطية' },
              { v: 99, s: '%', en: 'On-time Payment', ar: 'دفع في الموعد' },
              { v: 24, s: '/7', en: 'Live Dispatch', ar: 'إرسال مباشر' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="font-display text-4xl text-amber-400 mb-1">
                  <Counter to={s.v} suffix={s.s} />
                </div>
                <div className="text-xs text-white/50 font-semibold">{t(s.en, s.ar)}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-400 ${hero.vis ? 'opacity-100' : 'opacity-0'}`}>
            <a href="#apply"
               className="px-10 py-4 brand-gradient rounded-full text-zinc-900 font-black text-sm shadow-2xl hover:scale-[1.03] transition-all">
              {t('Apply Now', 'قدم طلبك الآن')}
            </a>
            <a href="#how-it-works"
               className="px-10 py-4 border border-white/20 bg-white/5 rounded-full text-white font-black text-sm hover:bg-white/10 transition-all">
              {t('How It Works', 'كيف تعمل؟')}
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── PROBLEM / OPPORTUNITY ──────────────────────────────────── */}
      <section className="py-24 bg-zinc-950 text-white border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 mb-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
            {t('The Problem Today', 'المشكلة اليوم')}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
            {t(
              <>The vehicle service market is<br /><span className="text-red-400">fragmented and disconnected.</span></>,
              <>مزودو خدمات السيارات يواجهون<br /><span className="text-red-400">تحديات يومية.</span></>
            )}
          </h2>
          <div className="grid md:grid-cols-3 gap-5 mt-12 text-left">
            {[
              {
                en: { t: 'No Stable Demand', d: 'You rely on word of mouth, brokers, and random walk-ins. Revenue is unpredictable.' },
                ar: { t: 'لا طلب مستقر', d: 'تعتمد على السمعة والوسطاء والعملاء العشوائيين. الإيراد غير قابل للتنبؤ.' },
                color: 'border-red-500/30 bg-red-500/5',
              },
              {
                en: { t: 'Cash Flow Problems', d: 'Insurance companies and corporate clients delay payments for 60-90 days. Operations suffer.' },
                ar: { t: 'مشاكل في التدفق النقدي', d: 'شركات التأمين والعملاء المؤسسيون يؤخرون الدفع لـ 60-90 يوماً. العمليات تتأثر.' },
                color: 'border-orange-500/30 bg-orange-500/5',
              },
              {
                en: { t: 'Manual Everything', d: 'Coordination by phone, invoices in Excel, disputes over job details. Time wasted every day.' },
                ar: { t: 'كل شيء يدوي', d: 'تنسيق هاتفي وفواتير في إكسيل ونزاعات على تفاصيل المهام. إهدار يومي للوقت.' },
                color: 'border-yellow-500/30 bg-yellow-500/5',
              },
            ].map((p, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${p.color}`}>
                <div className="text-lg font-black text-white mb-2">{t(p.en.t, p.ar.t)}</div>
                <p className="text-white/50 text-sm leading-relaxed">{t(p.en.d, p.ar.d)}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 rounded-2xl bg-amber-400/10 border border-amber-400/30">
            <p className="text-amber-300 font-bold text-lg">
              {t(
                '→ CARVO solves all three. One platform connecting you to individuals, businesses, and fleet operators across Saudi Arabia.',
                '← كارفو يحل الثلاثة. منصة واحدة تربطك بالأفراد والشركات وأساطيل المركبات في المملكة.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── WHO CAN JOIN ──────────────────────────────────────────── */}
      <section ref={types.ref as React.RefObject<HTMLElement>} className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <div className={`text-sm font-bold uppercase text-amber-700/70 mb-4 transition-all duration-700 ${types.vis ? 'opacity-100' : 'opacity-0'}`}>
              {t('Who Can Join', 'من يمكنه الانضمام')}
            </div>
            <h2 className={`text-4xl md:text-6xl font-black text-zinc-900 leading-tight mb-4 transition-all duration-700 delay-100 ${types.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {t('If You Work With Vehicles,', 'إذا كنت تعمل في مجال السيارات,')}
              <br />
              <span className="gold-text">{t('You Belong Here.', 'فمكانك هنا.')}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PARTNER_TYPES.map((p, i) => (
              <div key={i}
                style={{ transitionDelay: `${i * 80}ms` }}
                className={`group p-7 rounded-3xl bg-zinc-50 border border-zinc-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-400 ${types.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-amber-400 flex items-center justify-center mb-5 group-hover:bg-amber-400 group-hover:text-zinc-900 transition-all">
                  {p.icon}
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-2">
                  {t(p.en.title, p.ar.title)}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {t(p.en.desc, p.ar.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────── */}
      <section ref={benefits.ref as React.RefObject<HTMLElement>} className="py-24 lg:py-32 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <div className={`text-sm font-bold uppercase text-amber-400/70 mb-4 transition-all duration-700 ${benefits.vis ? 'opacity-100' : 'opacity-0'}`}>
              {t('Why Partner With CARVO', 'لماذا تنضم لكارفو')}
            </div>
            <h2 className={`text-4xl md:text-6xl font-black leading-tight mb-4 transition-all duration-700 delay-100 ${benefits.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {t('The Unfair Advantage', 'الميزة التنافسية')}
              <br />
              <span className="gold-text">{t('For Our Partners.', 'لشركائنا.')}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <div key={i}
                style={{ transitionDelay: `${i * 80}ms` }}
                className={`group p-7 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-400 ${benefits.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center mb-5 shrink-0">
                  <svg className="w-5 h-5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-white mb-2">{t(b.en.t, b.ar.t)}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{t(b.en.d, b.ar.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" ref={steps.ref as React.RefObject<HTMLElement>} className="py-24 lg:py-32 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <div className={`text-sm font-bold uppercase text-zinc-400 mb-4 transition-all duration-700 ${steps.vis ? 'opacity-100' : 'opacity-0'}`}>
              {t('Onboarding Process', 'عملية الانضمام')}
            </div>
            <h2 className={`text-4xl md:text-6xl font-black text-zinc-900 leading-tight transition-all duration-700 delay-100 ${steps.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {t('Live in 4 Steps.', 'انطلق في 4 خطوات.')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={i}
                style={{ transitionDelay: `${i * 120}ms` }}
                className={`group p-7 rounded-3xl bg-white border border-zinc-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-400 ${steps.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center font-black text-lg text-zinc-900">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {i < STEPS.length - 1 && (
                    <svg className="w-5 h-5 text-zinc-200 hidden lg:block flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-black text-zinc-900 mb-2">{t(s.en.t, s.ar.t)}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{t(s.en.d, s.ar.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ─────────────────────────────────────── */}
      <section id="apply" ref={form.ref as React.RefObject<HTMLElement>} className="py-24 lg:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left pitch */}
            <div className={`transition-all duration-700 ${form.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="text-sm font-bold uppercase text-amber-700/70 mb-4">
                {t('Join the Network', 'انضم للشبكة')}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight mb-6">
                {t('Ready to Grow?', 'مستعد للنمو؟')}
                <br />
                <span className="gold-text">{t("Let's Talk.", 'تحدث معنا.')}</span>
              </h2>
              <p className="text-zinc-500 text-lg font-light leading-relaxed mb-8">
                {t(
                  'Submit your application and our partner onboarding team will reach out within one business day to walk you through the next steps.',
                  'أرسل طلبك وسيتواصل معك فريق تأهيل الشركاء خلال يوم عمل واحد لإرشادك خلال الخطوات التالية.'
                )}
              </p>

              <div className="space-y-4">
                {[
                  { en: 'No sign-up fees or hidden costs', ar: 'لا رسوم تسجيل أو تكاليف خفية' },
                  { en: 'Flexible partnership models', ar: 'نماذج شراكة مرنة تناسب حجمك' },
                  { en: 'Dedicated partner support team', ar: 'فريق دعم مخصص للشركاء' },
                  { en: 'Training and certification included', ar: 'التدريب والاعتماد مشمولان' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-700">
                    <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">{t(item.en, item.ar)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <div className={`transition-all duration-700 delay-200 ${form.vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {formStatus === 'sent' ? (
                <div className="p-10 rounded-3xl bg-emerald-50 border border-emerald-100 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mb-2">
                    {t('Application Received!', 'استلمنا طلبك!')}
                  </h3>
                  <p className="text-zinc-500">
                    {t('Our partner team will reach out within 1 business day.', 'سيتواصل معك فريق الشركاء خلال يوم عمل واحد.')}
                  </p>
                </div>
              ) : (
                <form onSubmit={submitApp} className="space-y-4 p-8 rounded-3xl bg-zinc-50 border border-zinc-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label>{t('Full Name', 'الاسم الكامل')} *</Label>
                      <Input value={application.name} onChange={v => setApplication({...application, name: v})} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label>{t('Company Name', 'اسم الشركة')}</Label>
                      <Input value={application.company} onChange={v => setApplication({...application, company: v})} />
                    </div>
                  </div>

                  <div>
                    <Label>{t('Service Type', 'نوع الخدمة')} *</Label>
                    <select value={application.type}
                      onChange={e => setApplication({...application, type: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-zinc-900">
                      <option value="">{t('Select type...', 'اختر النوع...')}</option>
                      <option value="towing">{t('Towing & Recovery', 'سحب وإنقاذ')}</option>
                      <option value="workshop">{t('Auto Workshop', 'ورشة إصلاح')}</option>
                      <option value="inspection">{t('Inspection Center', 'مركز فحص')}</option>
                      <option value="storage">{t('Storage & Warehouse', 'تخزين ومستودع')}</option>
                      <option value="carcare">{t('Car Care Center', 'مركز العناية بالسيارات')}</option>
                      <option value="parts">{t('Spare Parts Supplier', 'مورد قطع غيار')}</option>
                      <option value="other">{t('Other', 'أخرى')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('City', 'المدينة')} *</Label>
                      <select value={application.city}
                        onChange={e => setApplication({...application, city: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-zinc-900">
                        <option value="">{t('Select...', 'اختر...')}</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>{t('Fleet / Unit Size', 'حجم الأسطول')}</Label>
                      <select value={application.capacity}
                        onChange={e => setApplication({...application, capacity: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-zinc-900">
                        <option value="">{t('Select...', 'اختر...')}</option>
                        <option value="1-5">1-5</option>
                        <option value="6-20">6-20</option>
                        <option value="21-50">21-50</option>
                        <option value="50+">50+</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('Phone', 'رقم الجوال')} *</Label>
                      <Input type="tel" value={application.phone} onChange={v => setApplication({...application, phone: v})} />
                    </div>
                    <div>
                      <Label>{t('Email', 'البريد الإلكتروني')}</Label>
                      <Input type="email" value={application.email} onChange={v => setApplication({...application, email: v})} />
                    </div>
                  </div>

                  <div>
                    <Label>{t('Additional notes', 'ملاحظات إضافية')}</Label>
                    <textarea rows={3} value={application.message}
                      onChange={e => setApplication({...application, message: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 resize-none" />
                  </div>

                  {formStatus === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                      {t('Submission failed. Please try again.', 'فشل الإرسال. حاول مرة أخرى.')}
                    </div>
                  )}

                  <button type="submit" disabled={formStatus === 'sending' || !application.name || !application.phone}
                    className="w-full py-4 brand-gradient rounded-full font-black text-sm text-zinc-900 hover:scale-[1.01] transition-all shadow-lg disabled:opacity-50">
                    {formStatus === 'sending'
                      ? t('Sending...', 'جاري الإرسال...')
                      : t('Submit Partner Application', 'أرسل طلب الانضمام')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-bold tracking-wide uppercase text-zinc-400 mb-1.5">{children}</label>
);
const Input: React.FC<{ value: string; onChange: (v: string) => void; type?: string }> = ({ value, onChange, type = 'text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)}
    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 text-zinc-900" />
);

export default PartnersPage;
