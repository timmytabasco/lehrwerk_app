// backend/server.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';

import contactRouter from './routes/contacts.js';
import appointmentRouter from './routes/appointments.js';
import materialsRouter from './routes/materials.js';
import materialsAuthRouter from './routes/materialsAuth.js';
import authRouter from './routes/auth.js';
import cmsContentRouter from './routes/cmsContent.js';
import cmsMaterialsRouter from './routes/cmsMaterials.js';
import imagesRouter from './routes/images.js';



import spamGuard from './middleware/spamGuard.js';

const app = express();

/* ---------------------------------- Basics ---------------------------------- */

// CORS-Whitelist (mehrere Origins per Komma)
const ALLOWED = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://178.254.25.12,http://178.254.25.12:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({

  origin: (origin, cb) => {
    // allow non-browser clients (curl = origin null) und definierte Origins
    if (!origin) return cb(null, true);
    return cb(null, ALLOWED.includes(origin));
  },
  credentials: true
}));



app.use(express.json());
app.use(cookieParser());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", // Für Tailwind Config
        "https://cdn.tailwindcss.com" // Tailwind CDN
      ],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Für Tailwind Styles
        "https://cdn.tailwindcss.com"
      ],
      connectSrc: ["'self'"]
    }
  }
}));

// Echte IPs (falls hinter Nginx/Proxy) für Rate-Limits/Logs
app.set('trust proxy', 1);

/* ----------------------------- Static File Setup ---------------------------- */

// Projekt-Pfade
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Root für alle statischen Dateien, die öffentlich erreichbar sein sollen
// Struktur: backend/storage/<deine-unterordner> z.B. storage/materials/hello.pdf
const storageRoot = path.resolve(__dirname, './storage');
const materialsDir = path.join(storageRoot, 'materials');

if (!fs.existsSync(storageRoot)) fs.mkdirSync(storageRoot, { recursive: true });
if (!fs.existsSync(materialsDir)) fs.mkdirSync(materialsDir, { recursive: true });

console.log('🔗 Static /storage ->', storageRoot);
console.log('📁 Materials-Ordner ->', materialsDir);

// Alle öffentlichen Dateien unter /storage/... ausliefern
app.use('/storage', express.static(storageRoot, {
  fallthrough: true,
  maxAge: '1h',
  // setHeaders: (res, filePath) => { /* ggf. Cache/Headers anpassen */ }
}));

/* ----------------------------- Download Endpunkt ---------------------------- */
/**
 * /dl/:name – erzwingt "Speichern unter"
 * - NUR Basename erlaubt (sicher gegen Directory Traversal)
 * - Dateien werden aus storage/materials/<name> geladen
 */
app.get('/dl/:name', (req, res) => {
  const name = req.params.name;

  // Nur sichere Dateinamen erlauben
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    return res.status(400).send('Bad filename');
  }

  const abs = path.join(materialsDir, name);

  // Extra-Sicherheit: abs muss im materialsDir liegen
  if (!abs.startsWith(materialsDir)) {
    return res.status(400).send('Bad path');
  }

  // Prüfen ob Datei existiert
  fs.access(abs, fs.constants.R_OK, (err) => {
    if (err) {
      console.log(`File not found: ${abs}`);
      return res.status(404).send('File not found');
    }
    
    // Content-Type basierend auf Dateiendung setzen
    const ext = path.extname(name).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.txt': 'text/plain',
    };
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    res.download(abs, name, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
        'Cache-Control': 'no-cache'
      }
    }, (err2) => {
      if (err2) {
        console.error('Download error:', err2);
        if (!res.headersSent) {
          res.status(err2.statusCode || 500).send('Download fehlgeschlagen');
        }
      }
    });
  });
});
/* ------------------------------- Rate Limiting ------------------------------ */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
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

/* --------------------------------- API-Routen -------------------------------- */

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
// Bilder bearbeiten 
app.use('/api/images', imagesRouter);
app.use('/uploads', express.static(path.join(__dirname, 'storage', 'images')));

// Materialien (offene Liste)
app.use('/api/materials', materialsRouter);

// Materialien (ggf. geschützte Routen)
app.use('/api/materials-auth', materialsAuthRouter);

// CMS/Auth
app.use('/api/auth', authRouter);
app.use('/api/cms/content', cmsContentRouter);
app.use('/api/cms/materials', cmsMaterialsRouter);

/* ------------------------------ Public-Fallback ----------------------------- */

// Falls du statische Frontend-Builds ausliefern willst, hier das Verzeichnis anpassen.
// Aktuell: Projektroot (eine Ebene über backend/)
const publicDir = path.resolve(__dirname, '../');
app.use(express.static(publicDir));

/* --------------------------------- Startup --------------------------------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API läuft auf http://0.0.0.0:${PORT}`);
});

/* -------------------------------- Error-Handler ----------------------------- */

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: 'Server error' });
});
