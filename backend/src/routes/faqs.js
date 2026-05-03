import express from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM faqs WHERE is_active = 1 ORDER BY sort_order ASC, id ASC').all();
  res.json(rows.map(r => ({ ...r, is_active: !!r.is_active })));
});

router.get('/admin/all', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC, id ASC').all();
  res.json(rows.map(r => ({ ...r, is_active: !!r.is_active })));
});

router.post('/admin', requireAuth, requireAdmin, (req, res) => {
  const b = req.body || {};
  const result = db.prepare(`
    INSERT INTO faqs (question_en, question_ar, answer_en, answer_ar, category, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(b.question_en || '', b.question_ar || '', b.answer_en || '', b.answer_ar || '', b.category || '', b.sort_order ?? 0, b.is_active === false ? 0 : 1);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const b = req.body || {};
  db.prepare(`
    UPDATE faqs SET question_en=?, question_ar=?, answer_en=?, answer_ar=?,
      category=?, sort_order=?, is_active=? WHERE id=?
  `).run(
    b.question_en ?? existing.question_en,
    b.question_ar ?? existing.question_ar,
    b.answer_en ?? existing.answer_en,
    b.answer_ar ?? existing.answer_ar,
    b.category ?? existing.category,
    b.sort_order ?? existing.sort_order,
    b.is_active === undefined ? existing.is_active : (b.is_active ? 1 : 0),
    id
  );
  res.json({ ok: true });
});

router.delete('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM faqs WHERE id = ?').run(parseInt(req.params.id, 10));
  res.json({ ok: true });
});

export default router;
