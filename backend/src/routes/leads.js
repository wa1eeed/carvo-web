import express from 'express';
import db from '../db.js';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const submitLimiter = rateLimit({ windowMs: 60_000, max: 6 });

router.post('/', submitLimiter, (req, res) => {
  const b = req.body || {};
  if (!b.name && !b.phone && !b.email) return res.status(400).json({ error: 'Provide at least name, phone, or email' });
  const result = db.prepare(`
    INSERT INTO leads (name, email, phone, company, service_slug, message, type, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    (b.name || '').slice(0, 200),
    (b.email || '').slice(0, 200),
    (b.phone || '').slice(0, 50),
    (b.company || '').slice(0, 200),
    (b.service_slug || '').slice(0, 100),
    (b.message || '').slice(0, 2000),
    (b.type || 'contact').slice(0, 40),
    (b.source || 'website').slice(0, 100),
  );
  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/admin', requireAuth, requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const rows = db.prepare('SELECT * FROM leads ORDER BY id DESC LIMIT ?').all(limit);
  res.json(rows);
});

// Support both PUT /admin/:id and PUT /admin/:id/status
router.put('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const b = req.body || {};
  if (b.notes !== undefined) {
    db.prepare('UPDATE leads SET notes = ? WHERE id = ?').run((b.notes || '').slice(0, 5000), id);
  }
  if (b.status !== undefined) {
    db.prepare('UPDATE leads SET status = ? WHERE id = ?').run((b.status || 'new').slice(0, 30), id);
  }
  res.json({ ok: true });
});

router.put('/admin/:id/status', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const status = (req.body?.status || 'new').slice(0, 30);
  db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, id);
  res.json({ ok: true });
});

router.delete('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM leads WHERE id = ?').run(parseInt(req.params.id, 10));
  res.json({ ok: true });
});

export default router;
