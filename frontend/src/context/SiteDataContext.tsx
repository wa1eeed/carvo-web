import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import type { Service, SiteContent, Faq, AIConfig } from '../lib/types';

type SiteDataCtx = {
  services: Service[];
  content: SiteContent;
  faqs: Faq[];
  aiConfig: AIConfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const Ctx = createContext<SiteDataCtx | null>(null);

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [content, setContent] = useState<SiteContent>({});
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [svc, ctn, fqs, cfg] = await Promise.all([
        apiGet<Service[]>('/api/services').catch(() => []),
        apiGet<SiteContent>('/api/content').catch(() => ({})),
        apiGet<Faq[]>('/api/faqs').catch(() => []),
        apiGet<AIConfig>('/api/ai/config').catch(() => null),
      ]);
      setServices(svc);
      setContent(ctn);
      setFaqs(fqs);
      setAiConfig(cfg);
    } catch (e: any) {
      setError(e?.message || 'Failed to load site data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Ctx.Provider value={{ services, content, faqs, aiConfig, loading, error, refresh: load }}>
      {children}
    </Ctx.Provider>
  );
};

export function useSiteData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSiteData outside provider');
  return v;
}
