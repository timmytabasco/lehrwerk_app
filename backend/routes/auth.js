import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Missing credentials' });
    }

    const normalized = String(email).trim().toLowerCase();

    const [rows] = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [normalized]
    );
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ ok: false, message: 'Invalid email or password' });
    }

    // Token nur mit user.id, keine Rolle mehr
    const token = jwt.sign({ uid: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '2h'
    });

    res.cookie('auth', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // bei HTTPS = true setzen
      maxAge: 1000 * 60 * 60 * 2
    });

    res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth');
  res.json({ ok: true });
});

export default router;
