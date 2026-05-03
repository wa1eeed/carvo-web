import express from 'express';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function parseService(row) {
  if (!row) return null;
  return {
    ...row,
    highlights: row.highlights ? JSON.parse(row.highlights) : [],
    process_steps: row.process_steps ? JSON.parse(row.process_steps) : [],
    faq: row.faq ? JSON.parse(row.faq) : [],
    is_active: !!row.is_active,
  };
}

// PUBLIC: list active services
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC
  `).all();
  res.json(rows.map(parseService));
});

// PUBLIC: get a single service by slug
router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM services WHERE slug = ? AND is_active = 1').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Service not found' });
  res.json(parseService(row));
});

// ---- ADMIN routes ----
router.get('/admin/all', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC').all();
  res.json(rows.map(parseService));
});

router.post('/admin', requireAuth, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.slug || !b.title_en) return res.status(400).json({ error: 'slug and title_en required' });

  try {
    const result = db.prepare(`
      INSERT INTO services (
        slug, title_en, title_ar, category,
        short_description_en, short_description_ar,
        long_description_en, long_description_ar,
        icon_key, cover_image,
        highlights, process_steps, faq,
        cta_label_en, cta_label_ar,
        sort_order, is_active, seo_title, seo_description
      ) VALUES (
        @slug, @title_en, @title_ar, @category,
        @short_description_en, @short_description_ar,
        @long_description_en, @long_description_ar,
        @icon_key, @cover_image,
        @highlights, @process_steps, @faq,
        @cta_label_en, @cta_label_ar,
        @sort_order, @is_active, @seo_title, @seo_description
      )
    `).run({
      slug: b.slug,
      title_en: b.title_en,
      title_ar: b.title_ar || '',
      category: b.category || 'General',
      short_description_en: b.short_description_en || '',
      short_description_ar: b.short_description_ar || '',
      long_description_en: b.long_description_en || '',
      long_description_ar: b.long_description_ar || '',
      icon_key: b.icon_key || '',
      cover_image: b.cover_image || '',
      highlights: JSON.stringify(b.highlights || []),
      process_steps: JSON.stringify(b.process_steps || []),
      faq: JSON.stringify(b.faq || []),
      cta_label_en: b.cta_label_en || 'Request Service',
      cta_label_ar: b.cta_label_ar || 'اطلب الخدمة',
      sort_order: b.sort_order ?? 0,
      is_active: b.is_active === false ? 0 : 1,
      seo_title: b.seo_title || '',
      seo_description: b.seo_description || '',
    });
    const row = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(parseService(row));
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const b = req.body || {};
  db.prepare(`
    UPDATE services SET
      slug = @slug, title_en = @title_en, title_ar = @title_ar, category = @category,
      short_description_en = @short_description_en, short_description_ar = @short_description_ar,
      long_description_en = @long_description_en, long_description_ar = @long_description_ar,
      icon_key = @icon_key, cover_image = @cover_image,
      highlights = @highlights, process_steps = @process_steps, faq = @faq,
      cta_label_en = @cta_label_en, cta_label_ar = @cta_label_ar,
      sort_order = @sort_order, is_active = @is_active,
      seo_title = @seo_title, seo_description = @seo_description,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({
    id,
    slug: b.slug ?? existing.slug,
    title_en: b.title_en ?? existing.title_en,
    title_ar: b.title_ar ?? existing.title_ar,
    category: b.category ?? existing.category,
    short_description_en: b.short_description_en ?? existing.short_description_en,
    short_description_ar: b.short_description_ar ?? existing.short_description_ar,
    long_description_en: b.long_description_en ?? existing.long_description_en,
    long_description_ar: b.long_description_ar ?? existing.long_description_ar,
    icon_key: b.icon_key ?? existing.icon_key,
    cover_image: b.cover_image ?? existing.cover_image,
    highlights: JSON.stringify(b.highlights ?? (existing.highlights ? JSON.parse(existing.highlights) : [])),
    process_steps: JSON.stringify(b.process_steps ?? (existing.process_steps ? JSON.parse(existing.process_steps) : [])),
    faq: JSON.stringify(b.faq ?? (existing.faq ? JSON.parse(existing.faq) : [])),
    cta_label_en: b.cta_label_en ?? existing.cta_label_en,
    cta_label_ar: b.cta_label_ar ?? existing.cta_label_ar,
    sort_order: b.sort_order ?? existing.sort_order,
    is_active: b.is_active === undefined ? existing.is_active : (b.is_active ? 1 : 0),
    seo_title: b.seo_title ?? existing.seo_title,
    seo_description: b.seo_description ?? existing.seo_description,
  });
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  res.json(parseService(row));
});

router.delete('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
