// backend/routes/courses.js
import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// Kurse auflisten
router.get('/', requireAuth, async (_req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name FROM courses ORDER BY name ASC'
    );
    res.json({ ok: true, items: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
