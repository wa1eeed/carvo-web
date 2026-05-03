import React from 'react';
import { useI18n } from '../context/I18nContext';

const PartnerMarquee: React.FC = () => {
  const { t } = useI18n();

  // Generic stylized partner identifiers admins can replace these with logos later.
  const partners = [
    'TAWUNIYA', 'BUPA ARABIA', 'WALAA', 'MEDGULF', 'RSA', 'SAICO',
    'AL RAJHI TAKAFUL', 'GULF UNION', 'SOLIDARITY', 'ACIG', 'ALLIANZ SF', 'MALATH',
    'AXA COOPERATIVE', 'WATANIYA', 'ALINMA TOKIO', 'ARABIA INSURANCE',
  ];

  const Row = ({ items, reverse = false }: { items: string[]; reverse?: boolean }) => (
    <div className={`flex gap-12 ${reverse ? 'animate-marquee-rev' : 'animate-marquee'} whitespace-nowrap`}>
      {[...items, ...items].map((p, i) => (
        <div key={i} className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-md border border-zinc-200 bg-white flex items-center justify-center">
            <div className="w-3 h-3 rounded-sm brand-gradient" />
          </div>
          <span className="font-display text-xl text-zinc-400 tracking-wider">{p}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-12 bg-white border-y border-zinc-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-8">
          <div className="text-xs font-black tracking-wide uppercase text-zinc-400">
            {t('Trusted by Leading KSA Insurance Companies', 'موثوقون من كبرى شركات التأمين في المملكة')}
          </div>
        </div>
        <div className="marquee-mask">
          <Row items={partners} />
        </div>
      </div>
    </section>
  );
};

export default PartnerMarquee;
