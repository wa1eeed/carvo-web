import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

import db from './db.js';
import authRoutes from './routes/auth.js';
import servicesRoutes from './routes/services.js';
import contentRoutes from './routes/content.js';
import faqsRoutes from './routes/faqs.js';
import aiRoutes from './routes/ai.js';
import leadsRoutes from './routes/leads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = (process.env.CORS_ORIGINS || 'https://www.carvo.sa,https://carvo.sa,https://admin.carvo.sa,http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// Static uploads
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/uploads', express.static(UPLOADS_DIR));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, 'img-' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg', 'image/svg+xml', 'image/avif', 'image/heic', 'image/heif', 'image/bmp', 'image/tiff'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leads', leadsRoutes);

// Image upload endpoint — must be BEFORE the 404 catch-all
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No valid image uploaded' });
  res.json({ url: '/api/uploads/' + req.file.filename });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`[carvo-backend] listening on http://localhost:${PORT}`);
  console.log(`[carvo-backend] DB: ${process.env.DB_PATH || './data/carvo.db'}`);
  console.log(`[carvo-backend] Allowed origins: ${allowedOrigins.join(', ')}`);
});
