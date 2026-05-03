import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Lead {
  id: number;
  type: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  service_slug: string;
  source: string;
  status: string;
  notes: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  'new':         { label: 'جديد',       color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-400' },
  'in-progress': { label: 'قيد المتابعة', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     dot: 'bg-blue-400' },
  'closed':      { label: 'مكتمل',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' },
  'archived':    { label: 'مؤرشف',      color: 'text-zinc-500',    bg: 'bg-zinc-100 border-zinc-200',     dot: 'bg-zinc-400' },
};

const TYPE_LABELS: Record<string, string> = {
  'b2b': 'شركة', 'general': 'عام', 'service': 'خدمة',
  'partner-application': 'شريك', 'individual': 'فرد',
};

const SOURCE_LABELS: Record<string, string> = {
  'website-contact': 'نموذج التواصل', 'partners-page': 'صفحة الشركاء',
  'service-request': 'طلب خدمة', 'ai-assistant': 'مساعد الذكاء',
};

const STATUSES = ['new', 'in-progress', 'closed', 'archived'];

const LeadsPage: React.FC = () => {
  const [list, setList]     = useState<Lead[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState<Lead | null>(null);
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);
  const [view, setView]     = useState<'grid' | 'table'>('grid');

  const load = () => api.get<Lead[]>('/api/leads/admin').then(r => setList(r)).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await api.put(`/api/leads/admin/${id}`, { status });
    load();
    if (open?.id === id) setOpen(prev => prev ? { ...prev, status } : null);
  };

  const saveNote = async () => {
    if (!open) return;
    setSaving(true);
    await api.put(`/api/leads/admin/${open.id}`, { notes: note });
    setSaving(false);
    load();
    setOpen(prev => prev ? { ...prev, notes: note } : null);
  };

  const remove = async (id: number) => {
    if (!confirm('هل تريد حذف هذا الطلب؟')) return;
    await api.del(`/api/leads/admin/${id}`);
    setOpen(null);
    load();
  };

  const openLead = (l: Lead) => { setOpen(l); setNote(l.notes || ''); };

  const filtered = list
    .filter(l => filter === 'all' || l.status === filter)
    .filter(l => !search || [l.name, l.email, l.phone, l.company, l.message]
      .some(f => f?.toLowerCase().includes(search.toLowerCase())));

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: list.filter(l => l.status === s).length }), {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-1">CRM</div>
              <h1 className="text-3xl font-black text-zinc-900">الطلبات الواردة</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setView(v => v === 'grid' ? 'table' : 'grid')}
                className="p-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-500">
                {view === 'grid'
                  ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18M3 18h18" /></svg>
                  : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                }
              </button>
              <button onClick={load}
                className="p-2.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-zinc-900 rounded-2xl p-4 text-white">
              <div className="text-3xl font-black mb-1">{list.length}</div>
              <div className="text-xs text-zinc-400 font-bold">إجمالي الطلبات</div>
            </div>
            {STATUSES.map(s => (
              <div key={s} className={`rounded-2xl p-4 border ${STATUS_CONFIG[s].bg}`}>
                <div className={`text-3xl font-black mb-1 ${STATUS_CONFIG[s].color}`}>{counts[s] || 0}</div>
                <div className="text-xs font-bold text-zinc-500">{STATUS_CONFIG[s].label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الجوال أو البريد..."
                className="w-full pl-4 pr-10 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-900 bg-white text-right" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', ...STATUSES].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all ${
                    filter === s ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-400'
                  }`}>
                  {s === 'all' ? `الكل (${list.length})` : `${STATUS_CONFIG[s].label} (${counts[s] || 0})`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {filtered.length === 0 && (
          <div className="text-center py-24 text-zinc-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-bold text-lg">لا توجد طلبات</p>
          </div>
        )}

        {/* Grid View */}
        {view === 'grid' && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(l => {
              const cfg = STATUS_CONFIG[l.status] || STATUS_CONFIG['new'];
              return (
                <button key={l.id} onClick={() => openLead(l)}
                  className="text-right bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-zinc-900 text-base">{l.name || '—'}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {new Date(l.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3 text-sm text-right">
                    {l.phone && (
                      <div className="flex items-center justify-end gap-2 text-zinc-600">
                        <span>{l.phone}</span>
                        <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                    )}
                    {l.email && (
                      <div className="flex items-center justify-end gap-2 text-zinc-600">
                        <span className="truncate max-w-[180px]">{l.email}</span>
                        <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    {l.company && <div className="text-zinc-500 text-xs">{l.company}</div>}
                  </div>

                  {l.message && <p className="text-xs text-zinc-400 line-clamp-2 text-right">{l.message}</p>}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                    <div className="flex gap-1.5 flex-wrap">
                      {l.service_slug && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{l.service_slug}</span>
                      )}
                      <span className="text-[10px] font-bold bg-zinc-50 text-zinc-500 px-2 py-0.5 rounded-full">
                        {TYPE_LABELS[l.type] || l.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-300 font-mono">#{l.id}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {view === 'table' && (
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  {['#', 'الاسم', 'التواصل', 'النوع', 'المصدر', 'الخدمة', 'الحالة', 'التاريخ'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-black text-zinc-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => {
                  const cfg = STATUS_CONFIG[l.status] || STATUS_CONFIG['new'];
                  return (
                    <tr key={l.id} onClick={() => openLead(l)}
                      className={`border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-50/50'}`}>
                      <td className="px-4 py-3 text-zinc-300 font-mono text-xs">#{l.id}</td>
                      <td className="px-4 py-3 font-bold text-zinc-900">{l.name || '—'}</td>
                      <td className="px-4 py-3 text-zinc-500">{l.phone || l.email || '—'}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-zinc-100 px-2 py-0.5 rounded-full font-bold text-zinc-600">{TYPE_LABELS[l.type] || l.type}</span></td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{SOURCE_LABELS[l.source] || l.source}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">{l.service_slug || '—'}</span></td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                        {new Date(l.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(null)}>
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-7 py-5 flex items-center justify-between rounded-t-3xl">
              <button onClick={() => setOpen(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-right">
                <div className="font-black text-xl text-zinc-900">{open.name || 'بدون اسم'}</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {new Date(open.created_at).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}
                  {new Date(open.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div className="p-7">
              {/* Status Bar */}
              <div className="flex items-center gap-2 mb-6 flex-wrap justify-end">
                <span className="text-xs font-bold text-zinc-400">الحالة:</span>
                {STATUSES.map(s => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button key={s} onClick={() => updateStatus(open.id, s)}
                      className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${
                        open.status === s ? `${cfg.bg} ${cfg.color} border-current` : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                      }`}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {/* Contact Info Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {open.phone && (
                  <a href={`tel:${open.phone}`}
                    className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors group">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400 font-bold">الجوال</div>
                      <div className="font-bold text-zinc-900">{open.phone}</div>
                    </div>
                  </a>
                )}
                {open.email && (
                  <a href={`mailto:${open.email}`}
                    className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors">
                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400 font-bold">البريد الإلكتروني</div>
                      <div className="font-bold text-zinc-900 text-sm">{open.email}</div>
                    </div>
                  </a>
                )}
                {open.company && (
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400 font-bold">الشركة</div>
                      <div className="font-bold text-zinc-900">{open.company}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400 font-bold">التصنيف</div>
                    <div className="font-bold text-zinc-900">{TYPE_LABELS[open.type] || open.type} · {SOURCE_LABELS[open.source] || open.source}</div>
                  </div>
                </div>
              </div>

              {/* Service tag */}
              {open.service_slug && (
                <div className="flex justify-end mb-4">
                  <span className="text-sm font-bold bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-200">
                    خدمة: {open.service_slug}
                  </span>
                </div>
              )}

              {/* Message */}
              {open.message && (
                <div className="bg-zinc-50 rounded-2xl p-5 mb-6 text-right">
                  <div className="text-xs font-black text-zinc-400 uppercase tracking-wide mb-3">الرسالة</div>
                  <p className="text-zinc-800 leading-relaxed whitespace-pre-line">{open.message}</p>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <div className="text-xs font-black text-zinc-400 uppercase tracking-wide mb-2 text-right">ملاحظات داخلية</div>
                <textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl resize-none focus:outline-none focus:border-zinc-900 text-right text-sm"
                  placeholder="أضف ملاحظة..." />
                <div className="flex justify-end mt-2">
                  <button onClick={saveNote} disabled={saving}
                    className="px-5 py-2 bg-zinc-900 text-white rounded-full text-xs font-black hover:bg-zinc-700 transition-colors disabled:opacity-50">
                    {saving ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-5 border-t border-zinc-100 flex items-center justify-between">
                <button onClick={() => remove(open.id)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  حذف الطلب
                </button>
                {open.phone && (
                  <a href={`https://wa.me/966${open.phone.replace(/^0/, '').replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-full text-sm font-black hover:bg-emerald-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a9.896 9.896 0 01-4.766-1.233L3 19l1.396-4.15A9.929 9.929 0 1112.03 18.88z"/>
                    </svg>
                    واتساب
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
