// backend/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';                      // <- dein mysql2/promise Pool
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

function setAuthCookie(res, token) {
  res.cookie('auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
  });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok:false, message:'Bad payload' });

  // Nutzer laden
  const [rows] = await db.query(
    'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  if (rows.length === 0) return res.status(401).json({ ok:false, message:'Unauthorized' });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ ok:false, message:'Unauthorized' });

  // JWT erstellen 
  const token = jwt.sign(
    { uid: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  setAuthCookie(res, token);
  res.json({ ok:true });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (_req, res) => {
  res.clearCookie('auth');
  res.json({ ok:true });
});

/**
 * GET /api/auth/me
 * -> Session prüfen
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ ok:true, user: { uid: req.user.uid, email: req.user.email } });
});

/**
 * POST /api/auth/change-password
 * Body: { current, next }
 */
router.post('/change-password', requireAuth, async (req, res) => {
  const { current, next } = req.body || {};
  if (!current || !next) return res.status(400).json({ ok:false, message:'Bad payload' });
  if (next.length < 8)   return res.status(400).json({ ok:false, message:'Mind. 8 Zeichen' });

  // aktuellen Hash holen
  const [rows] = await db.query(
    'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
    [req.user.uid]
  );
  if (rows.length === 0) return res.status(404).json({ ok:false, message:'User not found' });

  const ok = await bcrypt.compare(current, rows[0].password_hash);
  if (!ok) return res.status(401).json({ ok:false, message:'Aktuelles Passwort falsch' });

  // neuen Hash speichern
  const newHash = await bcrypt.hash(next, 12);
  await db.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [newHash, req.user.uid]
  );

  // Session invalidieren
  res.clearCookie('auth');
  res.json({ ok:true, message:'Passwort geändert. Bitte neu einloggen.' });
});

export default router;
