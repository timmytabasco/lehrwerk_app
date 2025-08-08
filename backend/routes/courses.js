import express from 'express';
import  db  from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM courses');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(results);
  } catch (err) {
    console.error('Fehler beim Abrufen der Kurse:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
