import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

const KEY_GROUPS: { title: string; keys: { key: string; label: string; type?: 'text' | 'textarea' | 'url'; dir?: string }[] }[] = [
  {
    title: 'Hero',
    keys: [
      { key: 'hero_video_url', label: 'Hero video URL (mp4)', type: 'url' },
      { key: 'hero_eyebrow_en', label: 'Eyebrow (English)' },
      { key: 'hero_eyebrow_ar', label: 'Eyebrow (Arabic)', dir: 'rtl' },
      { key: 'hero_title_en', label: 'Title (English)' },
      { key: 'hero_title_ar', label: 'Title (Arabic)', dir: 'rtl' },
      { key: 'hero_subtitle_en', label: 'Subtitle (English)', type: 'textarea' },
      { key: 'hero_subtitle_ar', label: 'Subtitle (Arabic)', type: 'textarea', dir: 'rtl' },
    ]
  },
  {
    title: 'Stats',
    keys: [
      { key: 'stats_uptime', label: 'Uptime %' },
      { key: 'stats_response_min', label: 'Avg response (minutes)' },
      { key: 'stats_hubs', label: 'National hubs' },
      { key: 'stats_partners', label: 'B2B partners' },
    ]
  },
  {
    title: 'Contact',
    keys: [
      { key: 'phone', label: 'Phone (display)' },
      { key: 'email', label: 'Email' },
      { key: 'address_en', label: 'Address (English)' },
      { key: 'address_ar', label: 'Address (Arabic)', dir: 'rtl' },
    ]
  },
];

const ContentPage: React.FC = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [extra, setExtra] = useState<{ k: string; v: string }>({ k: '', v: '' });

  useEffect(() => {
    api.get<Record<string, string>>('/api/content').then(setContent).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setContent({ ...content, [k]: v });

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/content/admin', content);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 3500);
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addCustom = () => {
    if (!extra.k.trim()) return;
    setContent({ ...content, [extra.k.trim()]: extra.v });
    setExtra({ k: '', v: '' });
  };

  const knownKeys = new Set(KEY_GROUPS.flatMap((g) => g.keys.map((k) => k.key)));
  const customKeys = Object.keys(content).filter((k) => !knownKeys.has(k));

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-400 mb-2">Public copy</div>
          <h1 className="font-display text-5xl text-zinc-900">Site Content</h1>
          <p className="text-zinc-500 mt-2 max-w-xl">Edit the words on the public website. Changes go live immediately.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-emerald-600 text-sm font-bold">✓ Saved</span>}
          <button onClick={save} disabled={saving} className="px-7 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl">
        {KEY_GROUPS.map((g) => (
          <div key={g.title} className="bg-white rounded-3xl border border-zinc-100 p-7 lg:p-9">
            <h2 className="font-display text-2xl text-zinc-900 mb-6">{g.title}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {g.keys.map((k) => (
                <div key={k.key} className={k.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <Label>{k.label}</Label>
                  <div className="text-[10px] font-mono text-zinc-300 mb-1">{k.key}</div>
                  {k.type === 'textarea' ? (
                    <textarea
                      rows={3} dir={k.dir}
                      value={content[k.key] || ''}
                      onChange={(e) => set(k.key, e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl resize-y"
                    />
                  ) : (
                    <input
                      type={k.type === 'url' ? 'url' : 'text'} dir={k.dir}
                      value={content[k.key] || ''}
                      onChange={(e) => set(k.key, e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Custom keys */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-7 lg:p-9">
          <h2 className="font-display text-2xl text-zinc-900 mb-2">Custom keys</h2>
          <p className="text-sm text-zinc-500 mb-6">Any other content keys stored in the database.</p>
          {customKeys.length > 0 && (
            <div className="space-y-3 mb-6">
              {customKeys.map((k) => (
                <div key={k} className="flex gap-3 items-start">
                  <div className="font-mono text-xs text-zinc-500 bg-zinc-100 px-3 py-3 rounded-xl shrink-0 min-w-[180px]">{k}</div>
                  <textarea
                    rows={2} value={content[k] || ''}
                    onChange={(e) => set(k, e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl resize-y text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="pt-6 border-t border-zinc-100">
            <Label>Add a new key</Label>
            <div className="flex gap-3">
              <input placeholder="key_name" value={extra.k}
                onChange={(e) => setExtra({ ...extra, k: e.target.value })}
                className="px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-mono text-sm flex-1" />
              <input placeholder="value" value={extra.v}
                onChange={(e) => setExtra({ ...extra, v: e.target.value })}
                className="px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl flex-1" />
              <button onClick={addCustom} className="px-5 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold">Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-2">{children}</label>
);

export default ContentPage;
