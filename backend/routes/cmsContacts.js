import { Router } from 'express';
import db from '../db.js';

const router = Router();

/**
 * GET /api/cms/contacts
 * Query: q, limit, offset
 * Resp: { items: [...], total }
 */
router.get('/', async (req, res) => {
  try {
    const { q = '', limit = 20, offset = 0 } = req.query;

    const params = [];
    let where = 'WHERE 1=1';

    if (q) {
      where += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    const [rows] = await db.query(
      `SELECT id, name, email, phone, message, created_at
       FROM contacts
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM contacts ${where}`,
      params
    );

    res.json({ items: rows, total });
  } catch (err) {
    console.error('cms contacts list error', err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

/**
 * DELETE /api/cms/contacts/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.query('DELETE FROM contacts WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('cms contacts delete error', err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Mehrere per ID löschen
router.post('/bulk-delete', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0) return res.status(400).json({ ok:false, message:'Keine IDs' });

    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.query(`DELETE FROM contacts WHERE id IN (${placeholders})`, ids);

    res.json({ ok:true, deleted: result.affectedRows || 0 });
  } catch (err) {
    console.error('cms contacts bulk-delete error', err);
    res.status(500).json({ ok:false, message:'Serverfehler' });
  }
});

// Alles löschen nach aktuellem Filter (q)
router.delete('/purge', async (req, res) => {
  try {
    const { q = '' } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (q) {
      where += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    const [result] = await db.query(`DELETE FROM contacts ${where}`, params);
    res.json({ ok:true, deleted: result.affectedRows || 0 });
  } catch (err) {
    console.error('cms contacts purge error', err);
    res.status(500).json({ ok:false, message:'Serverfehler' });
  }
});


export default router;
