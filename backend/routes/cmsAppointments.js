import { Router } from 'express';
import db from '../db.js';

const router = Router();

/**
 * GET /api/cms/appointments
 * Query-Parameter: q, date_from, date_to, limit, offset
 * Antwort: { items: [...], total: number }
 */
router.get('/', async (req, res) => {
  try {
    const {
      q = '',
      date_from = null,
      date_to = null,
      limit = 20,
      offset = 0
    } = req.query;

    const params = [];
    let where = 'WHERE 1=1';

    if (q) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (date_from) {
      where += ' AND appointment_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      where += ' AND appointment_date <= ?';
      params.push(date_to);
    }

    const [rows] = await db.query(
      `SELECT id, name, email, appointment_date, appointment_time, created_at
       FROM appointments
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM appointments ${where}`,
      params
    );

    res.json({ items: rows, total });
  } catch (err) {
    console.error('cms appointments list error', err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

/**
 * DELETE /api/cms/appointments/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('cms appointments delete error', err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

export default router;
