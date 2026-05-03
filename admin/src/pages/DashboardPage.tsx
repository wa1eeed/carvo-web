import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const DashboardPage: React.FC = () => {
  const [counts, setCounts] = useState({ services: 0, leads: 0, faqs: 0 });

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/api/services/admin/all').catch(() => []),
      api.get<any[]>('/api/leads/admin').catch(() => []),
      api.get<any[]>('/api/faqs/admin/all').catch(() => []),
    ]).then(([s, l, f]) => setCounts({ services: s.length, leads: l.length, faqs: f.length }));
  }, []);

  const tiles = [
    { label: 'Services', value: counts.services, to: '/services', desc: 'Manage service cards & landing pages' },
    { label: 'Leads', value: counts.leads, to: '/leads', desc: 'Inbound contact and service requests' },
    { label: 'FAQs', value: counts.faqs, to: '/faqs', desc: 'Public FAQ + AI knowledge' },
  ];

  return (
    <div>
      <div className="mb-10">
        <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-400 mb-2">Overview</div>
        <h1 className="font-display text-5xl text-zinc-900">Dashboard</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="group p-7 bg-white rounded-3xl border border-zinc-100 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 mb-3">{t.label}</div>
            <div className="font-display text-5xl text-zinc-900 mb-3">{t.value}</div>
            <div className="text-sm text-zinc-500">{t.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Link to="/ai" className="p-7 bg-zinc-900 text-white rounded-3xl hover:bg-zinc-800 transition-all">
          <div className="text-[10px] tracking-widest uppercase font-bold text-amber-400/80 mb-3">AI Knowledge Base</div>
          <div className="font-display text-3xl mb-2">Train your assistant</div>
          <p className="text-white/60 text-sm">Edit company overview, FAQs, persona, language and voice for the chat & live voice assistant.</p>
        </Link>
        <Link to="/content" className="p-7 bg-white rounded-3xl border border-zinc-100 hover:shadow-lg transition-all">
          <div className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 mb-3">Site Content</div>
          <div className="font-display text-3xl mb-2 text-zinc-900">Edit hero, contact, stats</div>
          <p className="text-zinc-500 text-sm">Tweak copy that appears on the public website without redeploying.</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
