import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('Materials route called!'); // Das hier hinzufügen
  try {
    const [rows] = await db.query(`
      SELECT id, course_id, title, path, access_level
      FROM materials
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err); // Und das hier ändern
    res.status(500).json({ error: 'Fehler beim Laden der Materialien' });
  }
});

export default router;
