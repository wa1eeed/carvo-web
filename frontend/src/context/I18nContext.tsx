import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type Lang = 'en' | 'ar';

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: 'ltr' | 'rtl';
  t: <T extends string | ReactNode>(en: T, ar: T) => T;
};

const Ctx = createContext<I18nCtx | null>(null);

// Extract lang from path: /ar/... => ar, /en/... => en, else default
function getLangFromPath(path: string): Lang | null {
  if (path.startsWith('/ar') && (path.length === 3 || path[3] === '/')) return 'ar';
  if (path.startsWith('/en') && (path.length === 3 || path[3] === '/')) return 'en';
  return null;
}

// Strip lang prefix from path
export function stripLangPrefix(path: string): string {
  if (path.startsWith('/ar') && (path.length === 3 || path[3] === '/')) return path.slice(3) || '/';
  if (path.startsWith('/en') && (path.length === 3 || path[3] === '/')) return path.slice(3) || '/';
  return path;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [lang, setLangState] = useState<Lang>(() => {
    const fromPath = getLangFromPath(location.pathname);
    if (fromPath) return fromPath;
    const saved = typeof window !== 'undefined' ? localStorage.getItem('carvo_lang') : null;
    return (saved as Lang) || 'ar';
  });

  // Sync lang from URL on navigation
  useEffect(() => {
    const fromPath = getLangFromPath(location.pathname);
    if (fromPath && fromPath !== lang) {
      setLangState(fromPath);
    }
  }, [location.pathname]);

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('carvo_lang', l); } catch {}
    // Navigate to same page with new lang prefix
    const bare = stripLangPrefix(location.pathname);
    navigate('/' + l + (bare === '/' ? '' : bare), { replace: true });
  };

  const t = <T extends string | ReactNode>(en: T, ar: T): T => (lang === 'ar' ? ar : en);

  return <Ctx.Provider value={{ lang, setLang, dir, t }}>{children}</Ctx.Provider>;
};

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside provider');
  return v;
}
