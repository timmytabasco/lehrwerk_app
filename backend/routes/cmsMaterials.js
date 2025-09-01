// backend/routes/cmsMaterials.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

import { requireAuth } from '../middleware/requireAuth.js';
import db from '../db.js';

const router = express.Router();

// ------------------ Pfade & Setup ------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '../storage/materials');

try {
  await fs.mkdir(storageDir, { recursive: true });
  console.log('📁 Materials storage directory ready:', storageDir);
} catch (err) {
  console.error('❌ Failed to create storage directory:', err);
}

// ------------------ Multer Config ------------------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, storageDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|docx?|xlsx?|pptx?|txt|jpg|jpeg|png|gif|webp|mp4|mp3|wav|zip|rar)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error('Dateityp nicht erlaubt'));
  }
});

// ------------------ Routen ------------------

/**
 * GET /api/cms/materials
 * Alle Materialien + Kursname
 */
// GET /api/cms/materials
// backend/routes/cmsMaterials.js
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, m.course_id, c.name AS course_name,
             m.title, m.path, m.created_at
      FROM materials m
      LEFT JOIN courses c ON c.id = m.course_id
      ORDER BY m.created_at DESC
    `);
    res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('Error loading materials:', err);
    next(err);
  }
});

   

/**
 * POST /api/cms/materials
 * Neues Material hochladen
 */
router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { course_id, title } = req.body || {};

    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Datei fehlt' });
    }
    if (!title) {
      await fs.unlink(path.join(storageDir, req.file.filename));
      return res.status(400).json({ ok: false, message: 'Titel fehlt' });
    }

    const relPath = `materials/${req.file.filename}`;

    const [result] = await db.query(
      'INSERT INTO materials (course_id, title, path) VALUES (?, ?, ?)',
      [course_id || null, title, relPath]
    );

    res.json({
      ok: true,
      item: {
        id: result.insertId,
        course_id: course_id || null,
        title,
        path: relPath
      }
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    if (req.file) {
      try { await fs.unlink(path.join(storageDir, req.file.filename)); } catch {}
    }
    next(err);
  }
});

/**
 * DELETE /api/cms/materials/:id
 * Material löschen
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT path FROM materials WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Material nicht gefunden' });

    const row = rows[0];
    const absPath = path.join(storageDir, path.basename(row.path));

    try {
      await fs.unlink(absPath);
      console.log(`✅ Datei gelöscht: ${absPath}`);
    } catch (err) {
      console.warn(`⚠️ Datei nicht löschbar: ${absPath}`, err.message);
    }

    await db.query('DELETE FROM materials WHERE id = ?', [id]);
    res.json({ ok: true, deleted: Number(id) });
  } catch (err) {
    console.error('❌ Delete error:', err);
    next(err);
  }
});

export default router;
