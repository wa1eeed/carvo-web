import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useSiteData } from '../context/SiteDataContext';

const FaqSection: React.FC = () => {
  const { t, lang } = useI18n();
  const { faqs } = useSiteData();
  const [openId, setOpenId] = useState<number | null>(null);

  if (!faqs.length) return null;

  return (
    <section id="faq" className="py-24 px-5 bg-white border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-sm font-bold tracking-wide uppercase text-zinc-400 mb-5">
            <span className="inline-block w-8 h-px bg-zinc-300 align-middle mr-3" />
            {t('Frequently Asked', 'الأسئلة الشائعة')}
          </div>
          <h2 className="text-4xl md:text-6xl font-black leading-tight text-zinc-900">
            {t('CLEAR ANSWERS, FAST.', 'إجابات واضحة وسريعة.')}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f) => {
            const open = openId === f.id;
            const q = lang === 'ar' && f.question_ar ? f.question_ar : f.question_en;
            const a = lang === 'ar' && f.answer_ar ? f.answer_ar : f.answer_en;
            return (
              <div key={f.id} className="border border-zinc-100 rounded-2xl bg-zinc-50/50 overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : f.id)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-white transition-colors"
                >
                  <span className="font-bold text-zinc-900 text-base lg:text-lg">{q}</span>
                  <span className={`shrink-0 w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center transition-transform ${open ? 'rotate-45' : ''}`}>
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </span>
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                  <p className="text-zinc-500 leading-relaxed font-light">{a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
