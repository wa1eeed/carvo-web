import React, { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';

interface Service {
  id: number;
  slug: string;
  category: string;
  title_en: string;
  title_ar: string;
  short_description_en: string;
  short_description_ar: string;
  long_description_en: string;
  long_description_ar: string;
  icon_key: string;
  cover_image: string;
  highlights: string[];
  process_steps: { title: string; desc: string }[];
  sort_order: number;
  is_active: boolean;
}

const BLANK: Service = {
  id: 0, slug: '', category: '', title_en: '', title_ar: '',
  short_description_en: '', short_description_ar: '',
  long_description_en: '', long_description_ar: '',
  icon_key: '', cover_image: '', highlights: [], process_steps: [],
  sort_order: 0, is_active: true,
};

const ICON_KEYS = ['towing-sos','estimation','inspection','repair','warehousing','selling-auctions'];

/* ─── Sub-components defined OUTSIDE parent to prevent re-mount on every keystroke ─── */

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-2">{children}</label>
);

const Field: React.FC<{
  label: string; value: string;
  onChange: (v: string) => void;
  dir?: string; required?: boolean; mono?: boolean;
}> = ({ label, value, onChange, dir, required, mono }) => (
  <div>
    <Label>{label}{required && ' *'}</Label>
    <input
      dir={dir} value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 ${mono ? 'font-mono text-sm' : ''}`}
    />
  </div>
);

const TextareaField: React.FC<{
  label: string; value: string;
  onChange: (v: string) => void;
  rows?: number; dir?: string; mono?: boolean;
  placeholder?: string; hint?: string;
}> = ({ label, value, onChange, rows = 3, dir, mono, placeholder, hint }) => (
  <div>
    <Label>{label}</Label>
    {hint && <p className="text-xs text-zinc-400 mb-2">{hint}</p>}
    <textarea
      dir={dir} rows={rows} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-none ${mono ? 'font-mono text-sm' : ''}`}
    />
  </div>
);

const CoverImageUploader: React.FC<{
  value: string;
  onChange: (url: string) => void;
}> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError('الحجم الأقصى 8MB'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const token = localStorage.getItem('carvo_admin_token');
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (data.url) onChange(data.url);
      else setError(data.error || 'فشل الرفع');
    } catch { setError('فشل الرفع'); }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative rounded-2xl overflow-hidden bg-zinc-100 aspect-video">
          <img src={value} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 text-sm font-bold">✕</button>
        </div>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all">
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-sm font-bold">جاري الرفع...</span>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto mb-2 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm font-bold text-zinc-500">اسحب الصورة هنا أو <span className="text-zinc-900 underline">اختر من الجهاز</span></p>
            <p className="text-xs text-zinc-400 mt-1">JPG, PNG, WEBP — حد أقصى 8MB</p>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <input type="url" value={value} onChange={e => onChange(e.target.value)}
          placeholder="أو أدخل رابط الصورة مباشرة..."
          className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:border-zinc-900" />
        {value && (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2.5 bg-zinc-100 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors whitespace-nowrap">معاينة</a>
        )}
      </div>
      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
    </div>
  );
};

/* ─── Main Page ─────────────────────────────────────────────── */

const ServicesPage: React.FC = () => {
  const [list, setList] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [stepsRaw, setStepsRaw] = useState('');

  const load = () => api.get<Service[]>('/api/services/admin/all').then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const startEdit = (s: Service) => {
    setEditing(s);
    setStepsRaw(JSON.stringify(s.process_steps || [], null, 2));
  };

  const startNew = () => {
    setEditing({ ...BLANK });
    setStepsRaw('[]');
  };

  // Stable field updaters to avoid re-renders
  const upd = useCallback(<K extends keyof Service>(key: K, val: Service[K]) => {
    setEditing(prev => prev ? { ...prev, [key]: val } : prev);
  }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let steps = editing.process_steps;
      try { steps = JSON.parse(stepsRaw); } catch {}
      const payload = { ...editing, process_steps: steps };
      if (editing.id) {
        await api.put(`/api/services/admin/${editing.id}`, payload);
      } else {
        await api.post('/api/services/admin', payload);
      }
      await load();
      setEditing(null);
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    await api.del(`/api/services/admin/${id}`);
    load();
  };

  /* ── Edit Form ── */
  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(null)} className="text-sm text-zinc-500 hover:text-zinc-900 mb-6 flex items-center gap-2">
          ← العودة للخدمات
        </button>
        <h1 className="text-4xl font-black text-zinc-900 mb-8">
          {editing.id ? 'تعديل الخدمة' : 'خدمة جديدة'}
        </h1>

        <div className="bg-white rounded-3xl border border-zinc-100 p-8 max-w-4xl space-y-8">

          {/* ── Basic Info ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">معلومات أساسية</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Slug (URL key)" value={editing.slug} onChange={v => upd('slug', v)} required mono />
              <Field label="Category / الفئة" value={editing.category} onChange={v => upd('category', v)} />
              <Field label="عنوان الخدمة — English" value={editing.title_en} onChange={v => upd('title_en', v)} required />
              <Field label="عنوان الخدمة — العربية" value={editing.title_ar} onChange={v => upd('title_ar', v)} dir="rtl" />
            </div>
          </section>

          {/* ── Short Description ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">الوصف المختصر (يظهر في كروت الخدمات)</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <TextareaField label="Short description — English" value={editing.short_description_en} onChange={v => upd('short_description_en', v)} />
              <TextareaField label="الوصف المختصر — العربية" value={editing.short_description_ar} onChange={v => upd('short_description_ar', v)} dir="rtl" />
            </div>
          </section>

          {/* ── Long Description ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">الوصف التفصيلي (يظهر في صفحة الخدمة)</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <TextareaField label="Long description — English" rows={6} value={editing.long_description_en} onChange={v => upd('long_description_en', v)} />
              <TextareaField label="الوصف التفصيلي — العربية" rows={6} value={editing.long_description_ar} onChange={v => upd('long_description_ar', v)} dir="rtl" />
            </div>
          </section>

          {/* ── Highlights ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">أبرز المزايا — Key Highlights</h2>
            <p className="text-xs text-zinc-400 mb-3">سطر لكل ميزة — اكتب بالعربية (ستظهر في كلا اللغتين) أو اكتب نسختين بفصل كل ميزة في سطر</p>
            <textarea
              rows={5} dir="rtl"
              value={editing.highlights.join('\n')}
              onChange={(e) => upd('highlights', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-none text-right"
              placeholder={"متاح ٢٤/٧\nفريق معتمد\nتقرير رقمي فوري"}
            />
          </section>

          {/* ── Process Steps ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">خطوات الخدمة — Process Steps</h2>
            <p className="text-xs text-zinc-400 mb-3">
              مصفوفة JSON — كل عنصر: <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">{`{"title": "عنوان الخطوة", "desc": "وصف الخطوة"}`}</code>
            </p>
            <textarea
              rows={10} dir="ltr"
              value={stepsRaw}
              onChange={(e) => setStepsRaw(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-none font-mono text-sm"
            />
            <div className="mt-2 text-xs text-zinc-400">
              {(() => { try { JSON.parse(stepsRaw); return '✓ JSON صحيح'; } catch(e: any) { return `✗ خطأ في JSON: ${e.message}`; } })()}
            </div>
          </section>

          {/* ── Cover Image ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">صورة الخدمة — Cover Image</h2>
            <p className="text-xs text-zinc-400 mb-3">تظهر فوق وصف الخدمة في صفحة التفاصيل. يمكن رفعها من الجهاز أو إدخال رابط مباشر.</p>
            <CoverImageUploader value={editing.cover_image} onChange={v => upd('cover_image', v)} />
          </section>

          {/* ── Settings ── */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">إعدادات</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>Icon key</Label>
                <select value={editing.icon_key} onChange={(e) => upd('icon_key', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                  <option value="">— بدون أيقونة —</option>
                  {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <Label>ترتيب الظهور — Sort order</Label>
                <input type="number" value={editing.sort_order}
                  onChange={(e) => upd('sort_order', parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl" />
              </div>
              <label className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl cursor-pointer col-span-full md:col-span-1">
                <input type="checkbox" checked={editing.is_active}
                  onChange={(e) => upd('is_active', e.target.checked)}
                  className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-zinc-900">الخدمة مفعّلة — Active</div>
                  <div className="text-xs text-zinc-400">تظهر في الموقع للزوار</div>
                </div>
              </label>
            </div>
          </section>

          {/* ── Save ── */}
          <div className="flex gap-3 pt-4 border-t border-zinc-100">
            <button onClick={save} disabled={saving}
              className="px-8 py-3.5 bg-zinc-900 text-white rounded-full font-black text-sm hover:bg-zinc-700 disabled:opacity-50 transition-colors">
              {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
            </button>
            <button onClick={() => setEditing(null)}
              className="px-6 py-3.5 border border-zinc-200 rounded-full font-bold text-sm hover:bg-zinc-50 transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── List View ── */
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-1">إدارة المحتوى</div>
          <h1 className="text-4xl font-black text-zinc-900">الخدمات</h1>
        </div>
        <button onClick={startNew}
          className="px-6 py-3 bg-zinc-900 text-white rounded-full font-black text-sm hover:bg-zinc-700 transition-colors">
          + خدمة جديدة
        </button>
      </div>

      <div className="grid gap-3">
        {list.map((s) => (
          <div key={s.id}
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-zinc-100 hover:shadow-md transition-shadow">
            {s.cover_image && (
              <img src={s.cover_image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-zinc-100" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-black text-zinc-900">{s.title_ar || s.title_en}</span>
                {s.title_en && s.title_ar && (
                  <span className="text-zinc-400 text-sm">· {s.title_en}</span>
                )}
                {!s.is_active && (
                  <span className="text-xs bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full font-bold">مخفية</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                <span className="font-mono">{s.slug}</span>
                {s.category && <span>· {s.category}</span>}
                {s.highlights?.length > 0 && <span>· {s.highlights.length} مزايا</span>}
                {s.process_steps?.length > 0 && <span>· {s.process_steps.length} خطوات</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => startEdit(s)}
                className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors">
                تعديل
              </button>
              <button onClick={() => remove(s.id)}
                className="px-4 py-2 border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">
                حذف
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center py-16 text-zinc-400 text-sm">لا توجد خدمات. اضغط "+ خدمة جديدة" للبدء.</div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
