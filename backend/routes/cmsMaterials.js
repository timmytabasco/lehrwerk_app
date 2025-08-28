import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import pool from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Upload-Ordner aus ENV oder Fallback
const UPLOAD_DIR = process.env.UPLOAD_DIR || './storage/materials';

// Multer-Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${ts}_${safe}`);
  }
});
const upload = multer({ storage });

/**
 * GET /api/cms/materials
 * → Liste aller Materialien
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, course_id, title, path FROM materials ORDER BY id DESC');
    res.json({ ok: true, items: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cms/materials
 * → Neues Material hochladen
 */
router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { course_id, title } = req.body || {};
    if (!req.file) return res.status(400).json({ ok: false, message: 'Datei fehlt' });
    if (!course_id || !title) return res.status(400).json({ ok: false, message: 'course_id und title sind Pflicht' });

    const relPath = path.join('/materials', req.file.filename); // so erreichst du es über /materials/…

    await pool.query(
      'INSERT INTO materials (course_id, title, path) VALUES (?,?,?)',
      [course_id, title, relPath]
    );

    res.json({ ok: true, item: { course_id, title, path: relPath } });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cms/materials/:id
 * → Material löschen
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query('SELECT path FROM materials WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ ok: false, message: 'Nicht gefunden' });

    // Datei löschen (falls existiert)
    const absPath = path.resolve('.', row.path.startsWith('/materials') ? 'storage' + row.path : row.path);
    try { await fs.unlink(absPath); } catch (e) { /* falls Datei schon weg */ }

    await pool.query('DELETE FROM materials WHERE id = ?', [id]);

    res.json({ ok: true, deleted: Number(id) });
  } catch (err) {
    next(err);
  }
});

export default router;
