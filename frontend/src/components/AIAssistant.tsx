import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';
import { apiPost } from '../lib/api';
import { useI18n } from '../context/I18nContext';
import { useSiteData } from '../context/SiteDataContext';

type Mode = 'CLOSED' | 'SELECTION' | 'CHAT' | 'CALLING' | 'CONNECTED' | 'ENDED';
type Msg = { role: 'user' | 'model'; text: string };

// --- audio helpers ---
function encodeBytes(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function decodeBytes(b64: string): Uint8Array {
  const s = atob(b64);
  const a = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
}
async function decodePcm(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
  const i16 = new Int16Array(data.buffer);
  const buf = ctx.createBuffer(1, i16.length, sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < i16.length; i++) ch[i] = i16[i] / 32768;
  return buf;
}

const AIAssistant: React.FC = () => {
  const { t, lang } = useI18n();
  const { aiConfig } = useSiteData();
  const [mode, setMode] = useState<Mode>('CLOSED');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const [liveAi, setLiveAi] = useState('');
  const [liveUser, setLiveUser] = useState('');
  const liveAiRef = useRef('');
  const liveUserRef = useRef('');

  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const outCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, liveAi, liveUser, typing, mode]);

  // Welcome message when chat opens
  useEffect(() => {
    if (mode === 'CHAT' && messages.length === 0 && aiConfig) {
      const w = lang === 'ar' ? (aiConfig.welcome_message_ar || aiConfig.welcome_message_en) : (aiConfig.welcome_message_en || aiConfig.welcome_message_ar);
      if (w) setMessages([{ role: 'model', text: w }]);
    }
  }, [mode, aiConfig, lang]);

  if (!aiConfig) return null;
  if (!aiConfig.enable_chat && !aiConfig.enable_voice) return null;

  // ---- Chat (text) ----
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const userMsg: Msg = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, text: m.text }));
      const res = await apiPost<{ text: string }>('/api/ai/chat', {
        message: text,
        sessionId: sessionId.current,
        history: history.slice(-10),
      });
      setMessages((m) => [...m, { role: 'model', text: res.text }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'model', text: t('Sorry, I had trouble responding. Please try again.', 'عذراً، حدث خطأ. حاول مرة أخرى.') }]);
    } finally {
      setTyping(false);
    }
  };

  // ---- Voice (live) ----
  const startVoice = async () => {
    setMode('CALLING');
    try {
      const tokenRes = await apiPost<{ token: string; model: string; voice_name: string; system_instruction: string }>('/api/ai/voice-token', {});
      const ai = new GoogleGenAI({ apiKey: tokenRes.token });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      outCtxRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: tokenRes.model,
        callbacks: {
          onopen: () => {
            setMode('CONNECTED');
            const src = inputCtx.createMediaStreamSource(stream);
            const proc = inputCtx.createScriptProcessor(4096, 1, 1);
            proc.onaudioprocess = (e) => {
              const data = e.inputBuffer.getChannelData(0);
              const i16 = new Int16Array(data.length);
              for (let i = 0; i < data.length; i++) i16[i] = data[i] * 32768;
              const blob = { data: encodeBytes(new Uint8Array(i16.buffer)), mimeType: 'audio/pcm;rate=16000' as const };
              sessionPromise.then((s) => s.sendRealtimeInput({ media: blob }));
            };
            src.connect(proc);
            proc.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const sc = (msg as any).serverContent;
            const audio = sc?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && outCtxRef.current) {
              const ctx = outCtxRef.current;
              nextStartRef.current = Math.max(nextStartRef.current, ctx.currentTime);
              const buf = await decodePcm(decodeBytes(audio), ctx, 24000);
              const s = ctx.createBufferSource();
              s.buffer = buf;
              s.connect(ctx.destination);
              s.start(nextStartRef.current);
              nextStartRef.current += buf.duration;
              sourcesRef.current.add(s);
              s.onended = () => sourcesRef.current.delete(s);
            }
            if (sc?.outputTranscription) {
              liveAiRef.current += sc.outputTranscription.text;
              setLiveAi(liveAiRef.current);
            } else if (sc?.inputTranscription) {
              liveUserRef.current += sc.inputTranscription.text;
              setLiveUser(liveUserRef.current);
            }
            if (sc?.turnComplete) {
              const u = liveUserRef.current.trim();
              const a = liveAiRef.current.trim();
              setMessages((m) => {
                const next = [...m];
                if (u) next.push({ role: 'user', text: u });
                if (a) next.push({ role: 'model', text: a });
                return next;
              });
              liveUserRef.current = ''; liveAiRef.current = '';
              setLiveUser(''); setLiveAi('');
            }
          },
          onclose: () => endVoice(),
          onerror: () => endVoice(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: tokenRes.voice_name } } },
          systemInstruction: tokenRes.system_instruction,
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (e: any) {
      console.error('Voice error:', e);
      const errMsg = e?.message || '';
      if (errMsg.includes('getUserMedia') || errMsg.includes('Permission') || errMsg.includes('NotAllowed')) {
        setMessages((m) => [...m, { role: 'model', text: t('Microphone access denied. Please allow microphone access and try again.', 'تم رفض الوصول للمايكروفون. يرجى السماح بالوصول والمحاولة مجدداً.') }]);
      } else if (errMsg.includes('503') || errMsg.includes('Gemini') || errMsg.includes('API')) {
        setMessages((m) => [...m, { role: 'model', text: t('Voice service unavailable. Please check the Gemini API key in admin settings.', 'خدمة الصوت غير متاحة. يرجى التحقق من مفتاح Gemini API في إعدادات الأدمن.') }]);
      } else {
        setMessages((m) => [...m, { role: 'model', text: t('Voice connection failed. Switching to chat mode.', 'فشل الاتصال الصوتي. تم التحويل للدردشة.') }]);
      }
      setMode('CHAT');
    }
  };

  const endVoice = () => {
    try { sessionRef.current?.close(); } catch {}
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    sourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    sourcesRef.current.clear();
    setMode('ENDED');
    liveUserRef.current = ''; liveAiRef.current = '';
    setLiveUser(''); setLiveAi('');
    setTimeout(() => setMode('SELECTION'), 1200);
  };

  const close = () => {
    if (mode === 'CONNECTED' || mode === 'CALLING') endVoice();
    setMode('CLOSED');
  };

  // ---- UI ----
  if (mode === 'CLOSED') {
    return (
      <button
        onClick={() => setMode('SELECTION')}
        className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-40 group"
        aria-label="Open assistant"
      >
        <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-xl animate-glow" />
        <div className="relative px-4 py-3 brand-gradient rounded-2xl shadow-2xl flex flex-row items-center gap-2 hover:scale-[1.04] transition-transform" style={{direction:'ltr'}}>
          <svg className="w-5 h-5 text-zinc-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span className="live-dot shrink-0" />
          <span className="text-xs font-black tracking-wide uppercase text-zinc-900 whitespace-nowrap">
            {t('Ask CARVO', 'اسأل كارفو')}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 lg:p-8">
      <div className={`w-full h-full sm:h-auto sm:max-h-[88vh] ${mode === 'CONNECTED' ? 'max-w-5xl' : 'max-w-2xl'} bg-white sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all`}>
        {/* Header */}
        <header className="px-6 py-5 lg:px-8 lg:py-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center">
              <span className="font-display text-white text-sm">AI</span>
            </div>
            <div>
              <div className="font-display text-zinc-900 text-lg leading-none">CARVO Assistant</div>
              <div className="flex items-center gap-2 text-xs tracking-wide uppercase text-zinc-400 font-bold mt-1">
                <span className="live-dot scale-75" /> {t('Live', 'متصل')}
              </div>
            </div>
          </div>
          <button onClick={close} className="p-2 hover:bg-zinc-50 rounded-full transition" aria-label="Close">
            <svg className="w-6 h-6 text-zinc-400 hover:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {mode === 'SELECTION' && (
            <div className="flex-1 p-8 lg:p-14 flex flex-col justify-center gap-8 overflow-y-auto">
              <div className="text-center">
                <h3 className="font-display text-3xl lg:text-5xl text-zinc-900 mb-3 tracking-tight">
                  {t('How can we help?', 'كيف نقدر نساعدك؟')}
                </h3>
                <p className="text-zinc-500 font-light">
                  {t('Chat for diagnostics. Voice for emergencies.', 'دردشة للاستفسار. اتصال صوتي للطوارئ.')}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiConfig.enable_chat && (
                  <button
                    onClick={() => setMode('CHAT')}
                    className="group p-8 rounded-3xl border-2 border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50/50 transition-all flex flex-col items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center text-zinc-900 transition-all">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-lg tracking-widest uppercase text-zinc-900">{t('Chat', 'دردشة')}</div>
                      <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{t('Type to start', 'اكتب للبدء')}</div>
                    </div>
                  </button>
                )}
                {aiConfig.enable_voice && (
                  <button
                    onClick={startVoice}
                    className="group p-8 rounded-3xl border-2 border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50/50 transition-all flex flex-col items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 group-hover:bg-amber-400 group-hover:text-zinc-900 flex items-center justify-center text-zinc-900 transition-all">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-lg tracking-widest uppercase text-zinc-900">{t('Voice', 'صوت')}</div>
                      <div className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{t('Live conversation', 'محادثة مباشرة')}</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'CALLING' && (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping scale-150" />
                <div className="w-28 h-28 rounded-full brand-gradient flex items-center justify-center text-zinc-900 shadow-2xl relative z-10">
                  <svg className="w-12 h-12 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-display text-2xl text-zinc-900 mb-2">{t('Connecting…', 'جاري الاتصال…')}</h3>
              <p className="text-zinc-400 text-xs tracking-wide uppercase font-bold">{t('Secure CARVO Link', 'اتصال آمن')}</p>
            </div>
          )}

          {mode === 'CONNECTED' && (
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
              <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-6 lg:p-8 bg-zinc-50 border-b lg:border-b-0 lg:border-r border-zinc-100 shrink-0">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse scale-125" />
                  <div className="relative w-32 h-32 rounded-full brand-gradient flex items-center justify-center shadow-2xl ring-4 ring-white">
                    <svg className="w-14 h-14 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <div className="font-display text-xl text-zinc-900 mb-2">{t('Live Session', 'جلسة مباشرة')}</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    {t('Active', 'نشط')}
                  </div>
                </div>
                <div className="flex gap-1.5 h-8 items-end mb-8">
                  {[...Array(12)].map((_, i) => (
                    <div key={i}
                         className="w-1 bg-zinc-900 rounded-full"
                         style={{ height: `${30 + Math.sin(Date.now() / 200 + i) * 30 + Math.random() * 30}%`, opacity: 0.4 + Math.random() * 0.5 }} />
                  ))}
                </div>
                <button onClick={endVoice} className="px-7 py-3 bg-red-500 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-600 transition shadow-lg">
                  {t('End Call', 'إنهاء')}
                </button>
              </div>

              <div className="flex-1 flex flex-col bg-white min-h-0">
                <div className="px-5 py-4 border-b border-zinc-50 shrink-0">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{t('Transcript', 'النص')}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {messages.length === 0 && !liveAi && !liveUser && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-300 text-center">
                      <p className="italic text-sm font-light">{t('Standby for audio…', 'في انتظار الصوت…')}</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-800 border border-zinc-100'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {liveUser && (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] p-4 rounded-2xl text-sm bg-zinc-100 text-zinc-700 italic">{liveUser}</div>
                    </div>
                  )}
                  {liveAi && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-4 rounded-2xl text-sm bg-amber-50 text-zinc-800 border border-amber-100 italic">{liveAi}</div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>
          )}

          {mode === 'CHAT' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-5 py-4 border-b border-zinc-50 flex items-center gap-3 shrink-0">
                <button onClick={() => setMode('SELECTION')} className="p-2 hover:bg-zinc-100 rounded-full transition">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-black uppercase tracking-widest text-zinc-900">{t('Chat', 'الدردشة')}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-5 custom-scrollbar bg-white">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 lg:p-5 rounded-2xl text-sm lg:text-base leading-relaxed ${m.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-800 border border-zinc-100'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 p-4 rounded-2xl flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" style={{ animationDelay: '240ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 lg:p-6 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
                <div className="flex gap-3 bg-white p-2 rounded-2xl border-2 border-zinc-100 focus-within:border-zinc-900 transition-colors shadow-sm">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t('Describe what you need…', 'اكتب طلبك…')}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none px-4 py-3 text-sm lg:text-base"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={typing || !input.trim()}
                    className="w-11 h-11 brand-gradient rounded-full flex items-center justify-center hover:scale-105 transition disabled:opacity-50 shrink-0"
                  >
                    <svg className="w-5 h-5 text-zinc-900 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'ENDED' && (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="font-display text-2xl text-zinc-900 mb-2">{t('Session ended', 'انتهت الجلسة')}</div>
              <p className="text-zinc-400 text-xs tracking-wide uppercase font-bold">{t('Returning to menu…', 'العودة للقائمة…')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
