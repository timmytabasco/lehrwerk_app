// backend/routes/materials.js
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Beispiel: öffentliche Materials-Route
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.id,
        m.title,
        m.path,
        m.created_at,
        m.course_id,
        c.name AS course_name
      FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      ORDER BY m.created_at DESC
    `);

    res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('Error loading public materials:', err);
    next(err);
  }
});

export default router;
