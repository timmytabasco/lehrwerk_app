// backend/server.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';

// --- Routen (öffentliche) ---
import contactRouter from './routes/contacts.js';         // /api/contact   (public, POST)
import appointmentRouter from './routes/appointments.js'; // /api/appointments (public, GET/POST)

// --- Routen (sonstige public/utility) ---
import imagesRouter from './routes/images.js';            // /api/images
import materialsRouter from './routes/materials.js';      // /api/materials (offen)
import materialsAuthRouter from './routes/materialsAuth.js'; // /api/materials-auth (falls nötig)
import coursesRouter from './routes/courses.js';          // /api/courses

// --- Routen (CMS/Auth, geschützt) ---
import authRouter from './routes/auth.js';                // /api/auth
import cmsContentRouter from './routes/cmsContent.js';    // /api/cms/content
import cmsMaterialsRouter from './routes/cmsMaterials.js';// /api/cms/materials
import cmsAppointments from './routes/cmsAppointments.js';// /api/cms/appointments
import cmsContacts from './routes/cmsContacts.js';        // /api/cms/contacts

// --- Middleware ---
import requireAuth from './middleware/requireAuth.js';
import spamGuard from './middleware/spamGuard.js';

const app = express();

/* ---------------------------------- Basics ---------------------------------- */

// CORS-Whitelist (mehrere Origins per Komma getrennt)
// Beispiel .env: CORS_ORIGIN=http://localhost:5173,http://178.254.25.12,http://178.254.25.12:5173
const ALLOWED = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://178.254.25.12,http://178.254.25.12:80,http://178.254.25.12:3000,http://178.254.25.12:5173')
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

// Helmet mit gelockerter CSP für Tailwind-CDN (falls im Admin-Frontend genutzt)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",             // z.B. für Tailwind Config
        "https://cdn.tailwindcss.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.tailwindcss.com"
      ],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Echte IPs (falls hinter Nginx/Proxy) für Rate-Limits/Logs
app.set('trust proxy', 1);

/* ----------------------------- Static File Setup ---------------------------- */

// Projekt-Pfade
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Root für alle statischen Dateien, die öffentlich erreichbar sein sollen
// Struktur: backend/storage/<...> z.B. storage/materials/hello.pdf
const storageRoot = path.resolve(__dirname, './storage');
const materialsDir = path.join(storageRoot, 'materials');
const imagesDir = path.join(storageRoot, 'images');

if (!fs.existsSync(storageRoot)) fs.mkdirSync(storageRoot, { recursive: true });
if (!fs.existsSync(materialsDir)) fs.mkdirSync(materialsDir, { recursive: true });
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

console.log('🔗 Static /storage ->', storageRoot);
console.log('📁 Materials-Ordner ->', materialsDir);

// Alle öffentlichen Dateien unter /storage/... ausliefern
app.use('/storage', express.static(storageRoot, {
  fallthrough: true,
  maxAge: '1h'
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
      '.pdf':  'application/pdf',
      '.doc':  'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls':  'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
      '.txt':  'text/plain',
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

/* --------------------------------- API-Routen ------------------------------- */

// Kontaktformular (PUBLIC): Pflichtfelder name, email, message
app.use(
  '/api/contact',
  contactLimiter,
  (req, res, next) => spamGuard(['name', 'email', 'message'])(req, res, next),
  contactRouter
);

// Terminbuchung (PUBLIC):
//  - GET (z.B. /available) ohne Spamguard
//  - POST mit Pflichtfeldern name, email, date, time
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

// Bilder (PUBLIC)
app.use('/api/images', imagesRouter);
app.use('/uploads', express.static(imagesDir));

// Materialien (öffentliche Liste)
app.use('/api/materials', materialsRouter);

// Materialien (ggf. geschützte Routen — eigener Router)
app.use('/api/materials-auth', materialsAuthRouter);

// Auth + CMS (geschützt)
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);

// CMS-Content (je nach Router intern bereits geschützt oder hier)
// Hier: geschützte Materialien, Kontakte, Termine
app.use('/api/cms/content', cmsContentRouter);
app.use('/api/cms/materials', requireAuth, cmsMaterialsRouter);
app.use('/api/cms/contacts', requireAuth, cmsContacts);
app.use('/api/cms/appointments', requireAuth, cmsAppointments);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

/* ------------------------------ Public-Fallback ----------------------------- */

app.use('/api', express.json());

/* --------------------------------- Startup --------------------------------- */

const PORT = process.env.PORT || 3000;  
const server = app.listen(PORT, '0.0.0.0', () => {  
  console.log(`✅ API läuft auf http://0.0.0.0:${PORT}`);
});

/* -------------------------------- Error-Handler ----------------------------- */

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

/* ---------------------- Keep Alive & Graceful Shutdown --------------------- */


process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Keep the process alive
process.stdin.resume();

// Log alle 30 Minuten, dass der Server läuft 
setInterval(() => {
  console.log(`✅ Server läuft seit ${process.uptime()} Sekunden`);
}, 30 * 60 * 1000);

// Export für Tests
export default app;
