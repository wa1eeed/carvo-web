import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Bootstrap: create default admin if none exists
const adminCount = db.prepare('SELECT COUNT(*) as c FROM users WHERE role = ?').get('admin').c;
if (adminCount === 0) {
  const email = process.env.ADMIN_DEFAULT_EMAIL || 'admin@carvo.sa';
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMe123!';
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(email, hash, 'CARVO Admin', 'admin');
  console.log(`[auth] Bootstrap admin created: ${email} / ${password}  -- CHANGE THIS IMMEDIATELY`);
}

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user });
});

router.post('/change-password', requireAuth, (req, res) => {
  const { current, next: newPassword } = req.body || {};
  if (!current || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Current password and new password (min 8 chars) required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user || !bcrypt.compareSync(current, user.password_hash)) {
    return res.status(401).json({ error: 'Current password incorrect' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ ok: true });
});

export default router;
