import express from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// PUBLIC: get all key/value content
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_content').all();
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

// ADMIN: bulk upsert
router.put('/admin', requireAuth, requireAdmin, (req, res) => {
  const updates = req.body || {};
  const stmt = db.prepare(`
    INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);
  const tx = db.transaction((items) => {
    for (const [k, v] of Object.entries(items)) {
      stmt.run(k, v == null ? '' : String(v));
    }
  });
  tx(updates);
  res.json({ ok: true });
});

export default router;
