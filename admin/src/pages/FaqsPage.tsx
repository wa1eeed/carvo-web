import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Faq {
  id?: number;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

const empty = (): Faq => ({
  question_en: '', question_ar: '', answer_en: '', answer_ar: '',
  category: 'general', sort_order: 0, is_active: true,
});

const FaqsPage: React.FC = () => {
  const [list, setList] = useState<Faq[]>([]);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get<Faq[]>('/api/faqs/admin/all').then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) await api.put(`/api/faqs/admin/${editing.id}`, editing);
      else await api.post('/api/faqs/admin', editing);
      setEditing(null);
      load();
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this FAQ?')) return;
    await api.del(`/api/faqs/admin/${id}`);
    load();
  };

  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(null)} className="text-sm text-zinc-500 hover:text-zinc-900 mb-6">← Back to FAQs</button>
        <h1 className="font-display text-4xl text-zinc-900 mb-8">{editing.id ? 'Edit FAQ' : 'New FAQ'}</h1>

        <div className="bg-white rounded-3xl border border-zinc-100 p-8 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label>Question (English)</Label>
              <input value={editing.question_en}
                onChange={(e) => setEditing({ ...editing, question_en: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl" />
            </div>
            <div>
              <Label>Question (العربية)</Label>
              <input dir="rtl" value={editing.question_ar}
                onChange={(e) => setEditing({ ...editing, question_ar: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <Label>Answer (English)</Label>
              <textarea rows={6} value={editing.answer_en}
                onChange={(e) => setEditing({ ...editing, answer_en: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl resize-y" />
            </div>
            <div>
              <Label>Answer (العربية)</Label>
              <textarea rows={6} dir="rtl" value={editing.answer_ar}
                onChange={(e) => setEditing({ ...editing, answer_ar: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl resize-y" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-5">
            <div>
              <Label>Category</Label>
              <input value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl" />
            </div>
            <div>
              <Label>Sort order</Label>
              <input type="number" value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer mt-7">
              <input type="checkbox" checked={editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                className="w-5 h-5" />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={save} disabled={saving} className="px-7 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save FAQ'}
            </button>
            <button onClick={() => setEditing(null)} className="px-7 py-3 border border-zinc-200 rounded-full font-bold text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-400 mb-2">Public FAQ + AI knowledge</div>
          <h1 className="font-display text-5xl text-zinc-900">FAQs</h1>
        </div>
        <button onClick={() => setEditing(empty())} className="px-6 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm">+ New FAQ</button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr className="text-left text-[10px] tracking-widest uppercase font-bold text-zinc-400">
              <th className="p-4">Question</th>
              <th className="p-4">Category</th>
              <th className="p-4">Order</th>
              <th className="p-4">Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className="border-t border-zinc-50">
                <td className="p-4 max-w-md">
                  <div className="font-bold text-zinc-900 truncate">{f.question_en}</div>
                  {f.question_ar && <div className="text-zinc-400 text-sm truncate" dir="rtl">{f.question_ar}</div>}
                </td>
                <td className="p-4 text-sm text-zinc-600">{f.category}</td>
                <td className="p-4 text-sm text-zinc-600">{f.sort_order}</td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${f.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-400'}`}>
                    {f.is_active ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(f)} className="text-sm font-bold text-zinc-700 hover:text-zinc-900 mr-4">Edit</button>
                  <button onClick={() => f.id && remove(f.id)} className="text-sm font-bold text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-2">{children}</label>
);

export default FaqsPage;
