import express from 'express';
import db from '../db.js';

const router = express.Router();

// POST /api/appointments
router.post('/', async (req, res) => {
  const { name, email, date, time } = req.body;

  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen.' });
  }

  try {
    await db.query(
      `INSERT INTO appointments (name, email, appointment_date, appointment_time) VALUES (?, ?, ?, ?)`,
      [name, email, date, time]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("POST Fehler:", err);
    res.status(500).json({ error: 'Fehler beim Speichern.' });
  }
});

// GET /api/appointments/available?date=YYYY-MM-DD
router.get('/available', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Datum fehlt." });
  }

  const allSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", 
  ];

  try {
    const [results] = await db.query(
      `SELECT appointment_time FROM appointments WHERE appointment_date = ?`,
      [date]
    );

    const booked = results.map(r => r.appointment_time.slice(0, 5));
    const available = allSlots.filter(slot => !booked.includes(slot));

    res.json(available);
  } catch (err) {
    console.error("GET Fehler:", err);
    res.status(500).json({ error: "Fehler beim Laden verfügbarer Zeiten." });
  }
});

export default router;

