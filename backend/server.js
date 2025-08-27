// backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';

import contactRouter from './routes/contacts.js';
import appointmentRouter from './routes/appointments.js';
import materialsRouter from './routes/materials.js';
import materialsAuthRouter from './routes/materialsAuth.js';
import spamGuard from './middleware/spamGuard.js';

const app = express();

// ——— Basics
app.use(cors());
app.use(express.json());

// (optional) wenn hinter Proxy/Reverse-Proxy (Nginx) → echte IPs fürs Rate-Limit
app.set('trust proxy', 1);

// ——— Static-Files: /materials -> <project-root>/storage/materials
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const filesDir   = path.resolve(__dirname, '../storage/materials');
console.log('🔗 Static /materials ->', filesDir);

app.use('/materials', express.static(filesDir, { fallthrough: false }));

// (falls du geschützte Datei-APIs hast)
app.use('/api/materials-auth', materialsAuthRouter);

// ——— Download-Route: erzwingt "Speichern unter"
app.get('/dl/:name', (req, res) => {
  const name = req.params.name;                 // z.B. "hello.txt"
  const abs  = path.resolve(filesDir, name);    // sicherer absoluter Pfad
  if (!abs.startsWith(filesDir)) return res.status(400).send('Bad path');
  if (!fs.existsSync(abs))     return res.status(404).send('Not found');

  res.download(abs, name, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(err.statusCode || 500).send('Download fehlgeschlagen');
    }
  });
});

// ——— Rate Limits (lightweight)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Min
  limit: 200,               // 200 Requests / 15 Min / IP
  standardHeaders: 'draft-8',
  legacyHeaders: false
});
app.use(globalLimiter);

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Min
  limit: 10                 // 10 Kontakt-Anfragen / 10 Min / IP
});

const appointmentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 Min
  limit: 6                  // 6 Termin-Requests (inkl. /available) / 10 Min / IP
});

// ——— API-Routen mit Anti-Spam-Guard davor
// Kontaktformular: Pflichtfelder name, email, message
app.use(
  '/api/contact',
  contactLimiter,
  (req, res, next) => spamGuard(['name', 'email', 'message'])(req, res, next),
  contactRouter
);

// Terminbuchung: Für POST Pflichtfelder name, email, date, time
// (GET /available bleibt ohne spamGuard, hat aber Rate-Limit)
app.use(
  '/api/appointments',
  appointmentLimiter,
  (req, res, next) => {
    if (req.method === 'POST') {
      return spamGuard(['name', 'email', 'date', 'time'])(req, res, next);
    }
    return next();
  },
  appointmentRouter
);

// (andere APIs unverändert)
app.use('/api/materials', materialsRouter);

// ——— Start (extern erreichbar)
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API läuft auf http://0.0.0.0:${PORT}`);
});
