import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'ar';

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  dir: 'ltr' | 'rtl';
  t: <T extends string | ReactNode>(en: T, ar: T) => T;
};



const Ctx = createContext<I18nCtx | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('carvo_lang') : null;
    return (saved as Lang) || 'en';
  });

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('carvo_lang', l); } catch {}
  };

  const t = <T extends string | ReactNode>(en: T, ar: T): T => (lang === 'ar' ? ar : en);

  return <Ctx.Provider value={{ lang, setLang, dir, t }}>{children}</Ctx.Provider>;
};

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside provider');
  return v;
}
