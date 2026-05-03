import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { apiPost } from '../lib/api';

const ContactSection: React.FC = () => {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '', type: 'general' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name && !form.phone && !form.email) {
      setStatus('error');
      setErrorMsg(t('Please provide name, email, or phone.', 'يرجى تعبئة الاسم أو البريد الإلكتروني أو رقم الجوال.'));
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      await apiPost('/api/leads', { ...form, source: 'website-contact' });
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', company: '', message: '', type: 'b2b' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(t('Submission failed. Please try again.', 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.'));
    }
  };

  const Field = (props: { label: string; name: keyof typeof form; type?: string; required?: boolean }) => (
    <div>
      <label className="block text-xs font-black tracking-wide uppercase text-zinc-400 mb-2">
        {props.label}{props.required && ' *'}
      </label>
      <input type={props.type || 'text'} value={form[props.name]}
        onChange={(e) => setForm({ ...form, [props.name]: e.target.value })}
        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors" />
    </div>
  );

  return (
    <section id="contact" className="py-28 lg:py-36 px-5 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left */}
          <div className="lg:col-span-5">
            <div className="text-sm font-bold tracking-wide uppercase text-zinc-400 mb-5">
              <span className="inline-block w-8 h-px bg-zinc-300 align-middle mr-3" />
              {t('Get In Touch', 'تواصل معنا')}
            </div>
            <h2 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.15] text-zinc-900 mb-6">
              {t(
                <><span>GET IN TOUCH</span><br /><span className="gold-text">WITH CARVO.</span></>,
                <><span>نحن هنا</span><br /><span className="gold-text">لخدمتك.</span></>
              )}
            </h2>
            <p className="text-zinc-500 text-lg font-light leading-relaxed mb-10">
              {t(
                'Whether you need a vehicle service, want to join our partner network, or have a business inquiry — we respond within one business day.',
                'سواء كنت تحتاج خدمة لسيارتك، أو تريد الانضمام كشريك، أو لديك استفسار — فريقنا يرد خلال يوم عمل واحد.'
              )}
            </p>

            <div className="space-y-5">
              <a href="tel:920012345" className="flex items-center gap-4 p-5 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors group">
                <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-zinc-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-zinc-400">{t('Call Us', 'اتصل بنا')}</div>
                  <div className="font-bold text-zinc-900 text-lg group-hover:text-amber-700 transition-colors">9200 12345</div>
                </div>
              </a>
              <a href="mailto:partners@carvo.sa" className="flex items-center gap-4 p-5 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors group">
                <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center text-zinc-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-zinc-400">{t('Partnerships', 'الشراكات')}</div>
                  <div className="font-bold text-zinc-900 text-lg group-hover:text-amber-700 transition-colors">partners@carvo.sa</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            <form onSubmit={submit} className="p-8 lg:p-10 rounded-3xl bg-zinc-50 border border-zinc-100">
              <div className="flex gap-2 mb-8">
                {[
                  { id: 'b2b', en: 'For Business', ar: 'للأعمال' },
                  { id: 'individual', en: 'Individual', ar: 'للأفراد' },
                  { id: 'support', en: 'Support', ar: 'الدعم الفني' },
                ].map((tab) => (
                  <button key={tab.id} type="button" onClick={() => setForm({ ...form, type: tab.id })}
                    className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all ${form.type === tab.id ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200'}`}>
                    {t(tab.en, tab.ar)}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label={t('Full Name', 'الاسم الكامل')} name="name" required />
                <Field label={t('Company', 'اسم الشركة')} name="company" />
                <Field label={t('Email', 'البريد الإلكتروني')} name="email" type="email" />
                <Field label={t('Phone', 'رقم الجوال')} name="phone" type="tel" />
                <div className="md:col-span-2">
                  <label className="block text-xs font-black tracking-wide uppercase text-zinc-400 mb-2">
                    {t('How can we help?', 'كيف يمكننا خدمتك؟')}
                  </label>
                  <textarea rows={4} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors resize-none" />
                </div>
              </div>

              {status === 'error' && errorMsg && (
                <div className="mt-5 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">{errorMsg}</div>
              )}
              {status === 'sent' && (
                <div className="mt-5 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm rounded-xl">
                  {t('Thanks! Our team will be in touch shortly.', 'شكراً لتواصلك! سيتواصل معك فريقنا قريباً.')}
                </div>
              )}

              <button type="submit" disabled={status === 'sending'}
                className="w-full mt-7 py-4 brand-gradient rounded-full text-zinc-900 font-black text-sm uppercase hover:scale-[1.01] transition-all shadow-xl shadow-zinc-200/50 disabled:opacity-50">
                {status === 'sending' ? t('Sending…', 'جاري الإرسال…') : t('Submit Inquiry', 'أرسل طلبك')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
