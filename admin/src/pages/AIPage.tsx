import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface AISettings {
  primary_language: string;
  accent: string;
  voice_name: string;
  chat_mode: string;
  company_overview: string;
  knowledge_base: string;
  persona_instructions: string;
  welcome_message_en: string;
  welcome_message_ar: string;
  enable_voice: boolean;
  enable_chat: boolean;
  model_chat: string;
  model_voice: string;
  gemini_api_key: string;
  gemini_key_source?: string;
}

interface ChatLog {
  id: number;
  session_id: string;
  user_message: string;
  ai_response: string;
  created_at: string;
}

const ACCENTS = [
  { v: 'saudi', l: 'سعودي (Saudi) — موصى به' },
  { v: 'gulf', l: 'خليجي (Gulf / Khaleeji)' },
  { v: 'msa', l: 'فصحى حديثة (MSA)' },
  { v: 'levantine', l: 'شامي (Levantine)' },
  { v: 'egyptian', l: 'مصري (Egyptian)' },
  { v: 'neutral', l: 'محايد / إنجليزي (Neutral)' },
];

const MODES = [
  { v: 'professional', l: 'احترافي — مختصر وواضح' },
  { v: 'friendly', l: 'ودود — دافئ ومقرّب' },
  { v: 'concise', l: 'مقتضب — أقصر إجابة ممكنة' },
  { v: 'detailed', l: 'مفصّل — شروحات كاملة' },
];

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Zephyr'];

const LANGS = [
  { v: 'auto', l: 'تلقائي — يرد بلغة المستخدم (موصى به)' },
  { v: 'ar', l: 'عربي بالأساس — Arabic primary' },
  { v: 'en', l: 'إنجليزي بالأساس — English primary' },
];

/* ─── Helper components ─────────────────────────────────────── */

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">{children}</h2>
);

const Toggle: React.FC<{
  label: string; labelAr: string;
  desc: string; descAr: string;
  checked: boolean; onChange: (v: boolean) => void;
}> = ({ label, labelAr, desc, descAr, checked, onChange }) => (
  <label className="flex items-start gap-4 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl cursor-pointer hover:bg-zinc-100/50 transition">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 w-5 h-5 shrink-0" />
    <div>
      <div className="font-bold text-zinc-900 text-sm">{labelAr} <span className="text-zinc-400 font-normal">— {label}</span></div>
      <div className="text-xs text-zinc-500 mt-0.5">{descAr}</div>
    </div>
  </label>
);

/* ─── Main Page ─────────────────────────────────────────────── */

const AIPage: React.FC = () => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [tab, setTab] = useState<'knowledge' | 'persona' | 'voice' | 'api' | 'logs'>('knowledge');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    api.get<AISettings>('/api/ai/admin/settings').then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'logs') {
      api.get<ChatLog[]>('/api/ai/admin/logs').then(setLogs).catch(() => setLogs([]));
    }
  }, [tab]);

  const upd = <K extends keyof AISettings>(key: K, val: AISettings[K]) =>
    setSettings(prev => prev ? { ...prev, [key]: val } : prev);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.put('/api/ai/admin/settings', settings);
      setSavedAt(Date.now());
      setTimeout(() => setSavedAt(null), 3500);
    } catch (e: any) {
      alert(`فشل الحفظ: ${e.message}`);
    } finally { setSaving(false); }
  };

  if (!settings) return <div className="text-sm text-zinc-400 p-8">جاري التحميل...</div>;

  const TABS = [
    { id: 'knowledge', label: 'المعرفة والمحتوى' },
    { id: 'persona',   label: 'الشخصية والترحيب' },
    { id: 'voice',     label: 'الصوت واللغة' },
    { id: 'api',       label: 'إعدادات API' },
    { id: 'logs',      label: 'سجل المحادثات' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-1">مساعد الذكاء الاصطناعي</div>
          <h1 className="text-4xl font-black text-zinc-900">إعدادات AI</h1>
          <p className="text-zinc-500 mt-2 text-sm">تحكم في معرفة المساعد وشخصيته وطريقة رده. التغييرات تُطبّق فوراً.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              تم الحفظ
            </span>
          )}
          <button onClick={save} disabled={saving}
            className="px-7 py-3 bg-zinc-900 text-white rounded-full font-black text-sm hover:bg-zinc-700 disabled:opacity-50 transition-colors">
            {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wide whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 p-7 lg:p-9 max-w-5xl">

        {/* ── Knowledge ── */}
        {tab === 'knowledge' && (
          <div className="space-y-8">
            <div>
              <SectionTitle>نظرة عامة عن الشركة — Company Overview</SectionTitle>
              <p className="text-xs text-zinc-400 mb-3">
                وصف شامل لكارفو يُستخدم كسياق أساسي للمساعد. اكتب بالعربية والإنجليزية معاً للحصول على أفضل نتائج في كلا اللغتين.
              </p>
              <textarea rows={7} value={settings.company_overview}
                onChange={e => upd('company_overview', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-y"
                placeholder="اكتب هنا وصفاً شاملاً لكارفو بالعربية والإنجليزية..."
              />
            </div>

            <div>
              <SectionTitle>قاعدة المعرفة — Knowledge Base</SectionTitle>
              <p className="text-xs text-zinc-400 mb-3">
                معلومات إضافية: أسئلة متوقعة، أسعار تقريبية، مناطق التغطية، استثناءات، إجراءات داخلية. اكتب بالعربية والإنجليزية للإجابة في كلا اللغتين.
              </p>
              <textarea rows={16} value={settings.knowledge_base}
                onChange={e => upd('knowledge_base', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-y font-mono text-sm"
                placeholder={"س: ما مناطق التغطية؟\nج: جميع مناطق المملكة الـ13، مع تركيز في الرياض وجدة والدمام والخبر والمدينة.\n\nQ: Do you handle insurance claims?\nA: Yes — claim-ready digital reports for all major KSA insurers.\n\nملاحظات:\n- رسوم الوقت الإضافي: 15% بعد الساعة 22:00\n- ضريبة القيمة المضافة 15% على جميع الفواتير"}
              />
              <p className="text-xs text-zinc-400 mt-2">
                💡 لا تحتاج لتكرار بيانات الخدمات والأسئلة الشائعة — يتم إدراجها تلقائياً.
              </p>
            </div>
          </div>
        )}

        {/* ── Persona ── */}
        {tab === 'persona' && (
          <div className="space-y-8">
            <div>
              <SectionTitle>تعليمات الشخصية — Persona Instructions</SectionTitle>
              <p className="text-xs text-zinc-400 mb-3">
                كيف يجب أن يتصرف المساعد: الأسلوب، القيود، كيفية التعامل مع الطوارئ، متى يحيل للمبيعات.
              </p>
              <textarea rows={8} value={settings.persona_instructions}
                onChange={e => upd('persona_instructions', e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-y"
                placeholder="أنت مساعد كارفو الذكي. رد دائماً بلغة المستخدم. كن مختصراً ومهنياً. للطوارئ حوّل المستخدم للإرسال على 920012345. لا تذكر أسعاراً محددة — حوّلهم لفريق المبيعات..."
              />
            </div>

            <div>
              <SectionTitle>رسالة الترحيب — Welcome Message</SectionTitle>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                    بالعربية
                  </label>
                  <textarea rows={4} dir="rtl" value={settings.welcome_message_ar}
                    onChange={e => upd('welcome_message_ar', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-none"
                    placeholder="مرحباً بك في كارفو! كيف أقدر أساعدك اليوم؟"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                    بالإنجليزية — English
                  </label>
                  <textarea rows={4} value={settings.welcome_message_en}
                    onChange={e => upd('welcome_message_en', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 resize-none"
                    placeholder="Welcome to CARVO! How can I help you today?"
                  />
                </div>
              </div>
            </div>

            <div>
              <SectionTitle>تفعيل خيارات المساعد</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4">
                <Toggle
                  label="Enable text chat" labelAr="تفعيل الدردشة النصية"
                  desc="إظهار خيار الدردشة في واجهة المساعد"
                  descAr="إظهار خيار الدردشة النصية للزوار"
                  checked={settings.enable_chat}
                  onChange={v => upd('enable_chat', v)}
                />
                <Toggle
                  label="Enable live voice" labelAr="تفعيل المحادثة الصوتية"
                  desc="إظهار خيار الاتصال الصوتي (يستخدم Gemini Live)"
                  descAr="إظهار خيار الاتصال الصوتي المباشر"
                  checked={settings.enable_voice}
                  onChange={v => upd('enable_voice', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Voice & Language ── */}
        {tab === 'voice' && (
          <div className="space-y-8">
            <div>
              <SectionTitle>إعدادات اللغة والأسلوب</SectionTitle>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">اللغة الأساسية</label>
                  <select value={settings.primary_language} onChange={e => upd('primary_language', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 text-right" dir="rtl">
                    {LANGS.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">اللهجة</label>
                  <select value={settings.accent} onChange={e => upd('accent', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 text-right" dir="rtl">
                    {ACCENTS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">أسلوب الردود</label>
                  <select value={settings.chat_mode} onChange={e => upd('chat_mode', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900 text-right" dir="rtl">
                    {MODES.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">صوت المساعد (Gemini Live)</label>
                  <select value={settings.voice_name} onChange={e => upd('voice_name', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:outline-none focus:border-zinc-900">
                    {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <p className="text-xs text-zinc-400 mt-1">جرّب كل صوت للعثور على الأنسب</p>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle>نماذج الذكاء الاصطناعي — AI Models</SectionTitle>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">نموذج الدردشة النصية</label>
                  <input value={settings.model_chat} onChange={e => upd('model_chat', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-mono text-sm focus:outline-none focus:border-zinc-900" />
                  <p className="text-xs text-zinc-400 mt-1">الافتراضي: <code className="bg-zinc-100 px-1.5 py-0.5 rounded">gemini-2.0-flash</code></p>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">نموذج المحادثة الصوتية</label>
                  <input value={settings.model_voice} onChange={e => upd('model_voice', e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-mono text-sm focus:outline-none focus:border-zinc-900" />
                  <p className="text-xs text-zinc-400 mt-1">الافتراضي: <code className="bg-zinc-100 px-1.5 py-0.5 rounded">gemini-2.0-flash-live-001</code></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── API Settings ── */}
        {tab === 'api' && (
          <div className="space-y-8">
            <div>
              <SectionTitle>مفتاح Gemini API</SectionTitle>

              {/* Key source indicator */}
              <div className={`flex items-center gap-3 p-4 rounded-2xl mb-5 ${
                settings.gemini_key_source === 'database' ? 'bg-emerald-50 border border-emerald-200' :
                settings.gemini_key_source === 'environment' ? 'bg-blue-50 border border-blue-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className={`w-3 h-3 rounded-full shrink-0 ${
                  settings.gemini_key_source === 'database' ? 'bg-emerald-500' :
                  settings.gemini_key_source === 'environment' ? 'bg-blue-500' :
                  'bg-red-500'
                }`} />
                <div className="text-sm font-bold">
                  {settings.gemini_key_source === 'database' && 'المفتاح محفوظ في قاعدة البيانات ✓'}
                  {settings.gemini_key_source === 'environment' && 'المفتاح مُعيَّن في متغيرات البيئة (Coolify) — يعمل بشكل طبيعي'}
                  {settings.gemini_key_source === 'not-set' && '⚠️ لم يُعيَّن مفتاح API — المساعد لن يعمل'}
                </div>
              </div>

              <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
                يمكنك حفظ مفتاح Gemini API مباشرة هنا. إذا تركته فارغاً، يُستخدم المفتاح المُعيَّن في متغيرات البيئة على Coolify.
                <br />
                <span className="text-zinc-400 text-xs mt-1 block">
                  للحصول على مفتاح: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">aistudio.google.com/app/apikey</a>
                </span>
              </p>

              <div className="relative">
                <label className="block text-xs font-black uppercase tracking-widests text-zinc-400 mb-2">Gemini API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.gemini_api_key}
                    onChange={e => upd('gemini_api_key', e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl font-mono text-sm focus:outline-none focus:border-zinc-900"
                  />
                  <button type="button" onClick={() => setShowKey(v => !v)}
                    className="px-4 py-3 bg-zinc-100 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors whitespace-nowrap">
                    {showKey ? '🙈 إخفاء' : '👁 إظهار'}
                  </button>
                  {settings.gemini_api_key && (
                    <button type="button" onClick={() => upd('gemini_api_key', '')}
                      className="px-4 py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                      مسح
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  المفتاح مخزن بشكل آمن في قاعدة البيانات ولا يظهر في الـ logs
                </p>
              </div>
            </div>

            <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
              <h3 className="font-black text-sm text-zinc-900 mb-3">كيف يعمل النظام</h3>
              <div className="space-y-2 text-xs text-zinc-500">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  <span>المساعد يقرأ المعرفة من قسم "المعرفة والمحتوى" + بيانات الخدمات + الأسئلة الشائعة تلقائياً</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  <span>يرد باللغة التي يكتب بها الزائر تلقائياً (إذا اخترت "تلقائي")</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  <span>المحادثة الصوتية تستخدم Gemini Live وتعمل في الوقت الفعلي</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-zinc-900 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">4</span>
                  <span>جميع المحادثات مسجّلة في "سجل المحادثات" لمراجعة جودة الردود</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Logs ── */}
        {tab === 'logs' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-zinc-500">آخر 100 محادثة — راجعها لتحسين قاعدة المعرفة</p>
              <button onClick={() => api.get<ChatLog[]>('/api/ai/admin/logs').then(setLogs).catch(() => {})}
                className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-colors">
                تحديث
              </button>
            </div>
            {logs.length === 0 && (
              <div className="text-center py-12 text-zinc-400 text-sm">لا توجد محادثات بعد.</div>
            )}
            <div className="space-y-3">
              {logs.map(l => (
                <div key={l.id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="font-mono text-xs text-zinc-400 bg-white px-2 py-0.5 rounded border border-zinc-100">{l.session_id.slice(0,16)}...</span>
                    <span className="text-xs text-zinc-400">
                      {new Date(l.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(l.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-0.5 bg-zinc-900 text-white rounded-full text-[10px] font-bold tracking-widest uppercase ml-2 mb-1">زائر</span>
                    <p className="text-sm text-zinc-800 mt-1">{l.user_message}</p>
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold tracking-widest uppercase ml-2 mb-1">كارفو AI</span>
                    <p className="text-sm text-zinc-600 mt-1 leading-relaxed">{l.ai_response}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIPage;
