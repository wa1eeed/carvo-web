import React from 'react';
import { Link } from 'react-router-dom';
import { LogoLight } from './Logo';
import { useI18n } from '../context/I18nContext';
import { useSiteData } from '../context/SiteDataContext';

const Footer: React.FC = () => {
  const { t, lang } = useI18n();
  const { services, content } = useSiteData();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-4">
            <div className="mb-6">
              <LogoLight className="h-12 w-auto" />
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm font-light">
              {t(
                "Saudi Arabia's premier ecosystem for vehicle logistics, recovery, and B2B integration with insurance and SOS providers.",
                'منظومة المملكة الرائدة في لوجستيات المركبات والاسترجاع والتكامل مع شركات التأمين ومزودي خدمات الطريق.'
              )}
            </p>
            <div className="flex gap-3">
              {['twitter', 'instagram', 'linkedin'].map((s) => (
                <a key={s} href="#" aria-label={s}
                   className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all">
                  <span className="text-xs font-bold uppercase">{s.slice(0, 2)}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-black tracking-wide uppercase mb-6 text-white">
              {t('Services', 'الخدمات')}
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              {services.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link to={`/services/${s.slug}`} className="hover:text-white transition-colors">
                    {lang === 'ar' && s.title_ar ? s.title_ar : s.title_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-black tracking-wide uppercase mb-6 text-white">
              {t('Company', 'الشركة')}
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><a href="#b2b" className="hover:text-white transition-colors">{t('For Business', 'للأعمال')}</a></li>
              <li><a href="#process" className="hover:text-white transition-colors">{t('Process', 'الآلية')}</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">{t('FAQ', 'الأسئلة الشائعة')}</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">{t('Contact', 'تواصل')}</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs font-black tracking-wide uppercase mb-6 text-white">
              {t('Headquarters', 'مقر الشركة')}
            </h4>
            <div className="space-y-4 text-sm text-white/50">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{lang === 'ar' ? (content.address_ar || 'الرياض، المملكة العربية السعودية') : (content.address_en || 'Riyadh, Saudi Arabia')}</span>
              </div>
              <a href={`tel:${(content.phone || '920012345').replace(/\s/g,'')}`} className="flex items-center gap-3 hover:text-white transition-colors">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{content.phone || '9200 12345'}</span>
              </a>
              <a href={`mailto:${content.email || 'info@carvo.sa'}`} className="flex items-center gap-3 hover:text-white transition-colors">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{content.email || 'info@carvo.sa'}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs tracking-wide uppercase font-bold">
            © {year} CARVO. {t('All Rights Reserved.', 'جميع الحقوق محفوظة.')}
          </p>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-white">{t('Terms', 'الشروط')}</a>
            <a href="#" className="hover:text-white">{t('Privacy', 'الخصوصية')}</a>
            <a href="#" className="hover:text-white">{t('Cookies', 'الكوكيز')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
