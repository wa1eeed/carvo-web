import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoLight, LogoDark } from './Logo';
import { useI18n } from '../context/I18nContext';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const links = [
    { en: 'Home',        ar: 'الرئيسية',    id: 'home' },
    { en: 'Services',    ar: 'خدماتنا',     id: 'services' },
    { en: 'For Business',ar: 'حلول الأعمال',id: 'b2b' },
    { en: 'How It Works',ar: 'آلية العمل',  id: 'process' },
    { en: 'Contact',     ar: 'تواصل معنا',  id: 'contact' },
  ];

  const goTo = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navBg = scrolled
    ? 'bg-white/95 backdrop-blur-2xl border-b border-zinc-100 shadow-sm'
    : 'bg-white/60 backdrop-blur-md';

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">

          {/* Logo — dark on white bg, light on transparent */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            {scrolled
              ? <LogoDark className="h-11 w-auto" />
              : <LogoDark className="h-11 w-auto" />
            }
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wide text-zinc-700">
            {links.map((l) => (
              <button key={l.id} onClick={() => goTo(l.id)}
                className="hover:text-zinc-900 transition-colors py-2 relative group whitespace-nowrap">
                {t(l.en, l.ar)}
                <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-zinc-900 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Lang toggle */}
            <div className="flex items-center bg-zinc-100 rounded-full p-1 text-xs font-black">
              <button onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-full transition-all ${lang === 'en' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>EN</button>
              <button onClick={() => setLang('ar')}
                className={`px-3 py-1.5 rounded-full transition-all ${lang === 'ar' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>ع</button>
            </div>
            {/* Partner CTA */}
            <Link to={`/${lang}/partners`}
              className="px-6 py-3 bg-zinc-900 text-white rounded-full font-black text-xs tracking-wide hover:bg-zinc-700 transition-all flex items-center gap-2 whitespace-nowrap">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('Become a Partner', 'انضم كشريك')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-zinc-900" aria-label="Toggle menu">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden absolute inset-x-0 bg-white border-t border-zinc-100 shadow-2xl transition-all duration-300 ease-out ${open ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-6 py-8 flex flex-col gap-1">
          {links.map((l) => (
            <button key={l.id} onClick={() => goTo(l.id)}
              className="text-left py-4 text-2xl font-black uppercase text-zinc-900 hover:text-zinc-500 transition-colors border-b border-zinc-50">
              {t(l.en, l.ar)}
            </button>
          ))}
          <div className="pt-6 flex items-center gap-3">
            <div className="flex items-center bg-zinc-100 rounded-full p-1 text-xs font-black">
              <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full ${lang === 'en' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>EN</button>
              <button onClick={() => setLang('ar')} className={`px-3 py-1.5 rounded-full ${lang === 'ar' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>ع</button>
            </div>
            <Link to={`/${lang}/partners`} className="flex-1 text-center py-4 bg-zinc-900 text-white rounded-full font-black text-sm">
              {t('Become a Partner', 'انضم كشريك')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
