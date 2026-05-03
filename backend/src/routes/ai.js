import express from 'express';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const VOICE_OPTIONS = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede'];
const ACCENT_OPTIONS = ['saudi', 'gulf', 'msa', 'levantine', 'egyptian', 'neutral'];
const MODE_OPTIONS = ['professional', 'friendly', 'concise', 'detailed'];
const LANGUAGE_OPTIONS = ['ar', 'en', 'auto'];

function getSettings() {
  return db.prepare('SELECT * FROM ai_settings WHERE id = 1').get();
}

// PUBLIC: just the safe configuration the frontend needs (NOT the full knowledge base)
router.get('/config', (req, res) => {
  const s = getSettings() || {};
  res.json({
    primary_language: s.primary_language || 'ar',
    accent: s.accent || 'saudi',
    chat_mode: s.chat_mode || 'professional',
    voice_name: s.voice_name || 'Kore',
    welcome_message_en: s.welcome_message_en || '',
    welcome_message_ar: s.welcome_message_ar || '',
    enable_voice: !!s.enable_voice,
    enable_chat: !!s.enable_chat,
  });
});

// PUBLIC: ephemeral voice token (avoids exposing API key directly)
// Returns the API key only if voice is enabled — for client-side @google/genai live SDK use.
// In production, replace with proper ephemeral token API once GA.
router.post('/voice-token', (req, res) => {
  const s = getSettings();
  if (!s || !s.enable_voice) return res.status(403).json({ error: 'Voice disabled' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Gemini not configured' });
  res.json({
    token: process.env.GEMINI_API_KEY,
    model: s.model_voice || 'gemini-2.0-flash-live-001',
    voice_name: s.voice_name || 'Kore',
    system_instruction: buildSystemInstruction(s),
    expires_in: 600,
  });
});

// ADMIN: get full settings
router.get('/admin/settings', requireAuth, requireAdmin, (req, res) => {
  const s = getSettings();
  // Use env var as fallback for key
  const effectiveKey = s.gemini_api_key || process.env.GEMINI_API_KEY || '';
  res.json({
    ...s,
    enable_voice: !!s.enable_voice,
    enable_chat: !!s.enable_chat,
    gemini_api_key: s.gemini_api_key || '',  // never expose env key directly
    gemini_key_source: s.gemini_api_key ? 'database' : (process.env.GEMINI_API_KEY ? 'environment' : 'not-set'),
    options: {
      voice: VOICE_OPTIONS,
      accent: ACCENT_OPTIONS,
      mode: MODE_OPTIONS,
      language: LANGUAGE_OPTIONS,
    }
  });
});

// ADMIN: update settings
router.put('/admin/settings', requireAuth, requireAdmin, (req, res) => {
  const b = req.body || {};
  const cur = getSettings();
  db.prepare(`
    UPDATE ai_settings SET
      company_overview = ?, knowledge_base = ?, persona_instructions = ?,
      primary_language = ?, accent = ?, voice_name = ?, chat_mode = ?,
      welcome_message_en = ?, welcome_message_ar = ?,
      enable_voice = ?, enable_chat = ?,
      model_chat = ?, model_voice = ?,
      gemini_api_key = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).run(
    b.company_overview ?? cur.company_overview,
    b.knowledge_base ?? cur.knowledge_base,
    b.persona_instructions ?? cur.persona_instructions,
    b.primary_language ?? cur.primary_language,
    b.accent ?? cur.accent,
    b.voice_name ?? cur.voice_name,
    b.chat_mode ?? cur.chat_mode,
    b.welcome_message_en ?? cur.welcome_message_en,
    b.welcome_message_ar ?? cur.welcome_message_ar,
    b.enable_voice === undefined ? cur.enable_voice : (b.enable_voice ? 1 : 0),
    b.enable_chat === undefined ? cur.enable_chat : (b.enable_chat ? 1 : 0),
    b.model_chat ?? cur.model_chat,
    b.model_voice ?? cur.model_voice,
    b.gemini_api_key !== undefined ? b.gemini_api_key : cur.gemini_api_key,
  );
  res.json({ ok: true });
});

// Build the full system instruction from DB knowledge.
function buildSystemInstruction(s) {
  // Pull active services + active FAQs to enrich knowledge dynamically.
  const services = db.prepare(`
    SELECT title_en, title_ar, category, short_description_en, short_description_ar, long_description_en
    FROM services WHERE is_active = 1 ORDER BY sort_order ASC
  `).all();

  const faqs = db.prepare(`
    SELECT question_en, question_ar, answer_en, answer_ar
    FROM faqs WHERE is_active = 1 ORDER BY sort_order ASC
  `).all();

  const lang = s.primary_language || 'ar';
  const accent = s.accent || 'saudi';
  const mode = s.chat_mode || 'professional';

  const langMap = {
    ar: 'Arabic',
    en: 'English',
    auto: 'auto-detect from the user message and reply in the same language'
  };
  const accentMap = {
    saudi: 'a clean, modern Saudi white dialect (لهجة سعودية بيضاء حديثة)',
    gulf: 'a Gulf Arabic dialect',
    msa: 'Modern Standard Arabic (الفصحى)',
    levantine: 'a Levantine Arabic dialect',
    egyptian: 'an Egyptian Arabic dialect',
    neutral: 'a neutral conversational tone',
  };
  const modeMap = {
    professional: 'Be concise, polished, and professional. Prioritize clarity.',
    friendly: 'Be warm, conversational, and welcoming, while staying credible.',
    concise: 'Use the shortest possible answers. Bullet only when necessary.',
    detailed: 'Provide thorough, well-structured answers with specifics.',
  };

  const servicesBlock = services.map(sv =>
    `- ${sv.title_en} (${sv.title_ar || ''}) [${sv.category}]: ${sv.short_description_en || ''}`
  ).join('\n');

  const faqBlock = faqs.map(f =>
    `Q: ${f.question_en || f.question_ar}\nA: ${f.answer_en || f.answer_ar}`
  ).join('\n\n');

  return `You are CARVO's official AI assistant.

PRIMARY LANGUAGE: ${langMap[lang] || 'Arabic'}.
TONE: Speak in ${accentMap[accent] || accentMap.saudi}. ${modeMap[mode] || modeMap.professional}

PERSONA & RULES:
${s.persona_instructions || ''}

COMPANY OVERVIEW:
${s.company_overview || ''}

KNOWLEDGE BASE:
${s.knowledge_base || ''}

LIVE SERVICE CATALOG:
${servicesBlock}

FREQUENTLY ASKED QUESTIONS:
${faqBlock}

CRITICAL RULES:
- Never invent prices. Route pricing to a human agent.
- For emergencies, prioritize dispatch instructions and offer to capture name + phone + location.
- Stay strictly on-topic for CARVO services. Politely redirect off-topic questions back to logistics.
- If the user asks for a specific service detail, summarize from the LIVE SERVICE CATALOG and offer to open its dedicated page.`;
}

// PUBLIC: chat proxy
const chatLimiter = rateLimit({ windowMs: 60_000, max: 30 });

router.post('/chat', chatLimiter, async (req, res) => {
  const { message, sessionId, history } = req.body || {};
  if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message required' });
  const s = getSettings();
  if (!s || !s.enable_chat) return res.status(403).json({ error: 'Chat disabled' });
  const s3 = getSettings();
  const apiKey3 = s3.gemini_api_key || process.env.GEMINI_API_KEY;
  if (!apiKey3) return res.status(503).json({ error: 'Gemini not configured' });

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey3 });
    const contents = [];
    if (Array.isArray(history)) {
      for (const m of history.slice(-12)) {
        if (m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string') {
          contents.push({ role: m.role, parts: [{ text: m.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: s.model_chat || 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: buildSystemInstruction(s),
        temperature: 0.7,
      }
    });

    const text = response.text || '...';

    // log
    try {
      const sid = sessionId || `s_${Date.now()}`;
      db.prepare('INSERT INTO chat_logs (session_id, role, content, mode) VALUES (?, ?, ?, ?)')
        .run(sid, 'user', message, 'chat');
      db.prepare('INSERT INTO chat_logs (session_id, role, content, mode) VALUES (?, ?, ?, ?)')
        .run(sid, 'model', text, 'chat');
    } catch (_) { /* logging is best-effort */ }

    res.json({ text });
  } catch (e) {
    console.error('Chat error', e);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// ADMIN: chat logs viewer
router.get('/admin/logs', requireAuth, requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const rows = db.prepare('SELECT * FROM chat_logs ORDER BY id DESC LIMIT ?').all(limit);
  res.json(rows);
});

export default router;
