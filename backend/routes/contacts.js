import express from 'express';
import db from '../db.js';

const router = express.Router();


router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen.' });
  }

  try {
    await db.query(
      `INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)`,
      [name, email, phone || null, message]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fehler beim Speichern der Kontaktanfrage:', err);
    res.status(500).json({ error: 'Datenbankfehler.' });
  }
});

export default router;
