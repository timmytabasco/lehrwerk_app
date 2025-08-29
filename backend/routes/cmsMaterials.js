// backend/routes/cmsMaterials.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Import basierend auf deiner Struktur
import { requireAuth } from '../middleware/requireAuth.js';
import db from '../db.js'; // deine MySQL Pool-Connection

const router = express.Router();

// Pfade definieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageDir = path.resolve(__dirname, '../storage/materials');

// Stelle sicher, dass der Ordner existiert
try {
  await fs.mkdir(storageDir, { recursive: true });
  console.log('📁 Materials storage directory ready:', storageDir);
} catch (err) {
  console.error('❌ Failed to create storage directory:', err);
}

// Multer-Konfiguration für Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    // Eindeutigen Filename generieren: timestamp_originalname
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Limit
  fileFilter: (req, file, cb) => {
    // Optional: Nur bestimmte Dateitypen erlauben
    const allowedTypes = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpg|jpeg|png|gif|webp|mp4|mp3|wav|zip|rar)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Dateityp nicht erlaubt'), false);
    }
  }
});

/**
 * GET /api/cms/materials
 * → Alle Materialien auflisten (für Admin)
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, course_id, title, path, created_at FROM materials ORDER BY created_at DESC'
    );
    res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('Error loading materials:', err);
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
    
    console.log('Upload attempt:', { course_id, title, file: req.file?.filename });
    
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Datei fehlt' });
    }
    
    if (!course_id || !title) {
      // Uploaded file wieder löschen bei Validierungsfehler
      try {
        await fs.unlink(path.join(storageDir, req.file.filename));
      } catch (e) { /* ignore */ }
      
      return res.status(400).json({ ok: false, message: 'course_id und title sind Pflicht' });
    }

    // WICHTIG: Pfad für Storage - konsistent mit deinem Static-Server
    const relPath = `materials/${req.file.filename}`; // Ohne führendes /storage/
    
    const [result] = await db.query(
      'INSERT INTO materials (course_id, title, path) VALUES (?, ?, ?)',
      [course_id, title, relPath]
    );

    console.log('Material uploaded successfully:', {
      id: result.insertId,
      course_id,
      title,
      path: relPath
    });

    res.json({ 
      ok: true, 
      item: { 
        id: result.insertId,
        course_id, 
        title, 
        path: relPath 
      } 
    });
  } catch (err) {
    console.error('Upload error:', err);
    
    // Bei Fehler uploaded file löschen
    if (req.file) {
      try {
        await fs.unlink(path.join(storageDir, req.file.filename));
      } catch (e) { /* ignore */ }
    }
    
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
    
    console.log('Delete material attempt:', id);
    
    const [rows] = await db.query('SELECT path FROM materials WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: 'Material nicht gefunden' });
    }
    
    const row = rows[0];
    
    // Datei physisch löschen
    const filename = path.basename(row.path);
    const absPath = path.join(storageDir, filename);
    
    try {
      await fs.unlink(absPath);
      console.log(`✅ Datei gelöscht: ${absPath}`);
    } catch (err) {
      console.warn(`⚠️ Datei konnte nicht gelöscht werden: ${absPath}`, err.message);
      // Trotzdem weitermachen und aus DB löschen
    }

    // Aus Datenbank löschen
    await db.query('DELETE FROM materials WHERE id = ?', [id]);

    console.log('✅ Material deleted from DB:', id);
    res.json({ ok: true, deleted: Number(id) });
  } catch (err) {
    console.error('Delete error:', err);
    next(err);
  }
});

export default router;