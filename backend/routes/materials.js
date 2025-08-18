// backend/routes/materials.js
import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  console.log('GET /api/materials');
  try {
    const [rows] = await db.query(`
      SELECT id, course_id, title, path
      FROM materials
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Materialien' });
  }
});

export default router;
