// backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import contactRouter from './routes/contacts.js';
import appointmentRouter from './routes/appointments.js';
import materialsRouter from './routes/materials.js';
import materialsAuthRouter from './routes/materialsAuth.js';


const app = express();
app.use(cors());
app.use(express.json());

// === Static-Files: /materials -> <project-root>/storage/materials ===
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
// zeigt auf: <root>/storage/materials  (eine Ebene über /backend)
const filesDir   = path.resolve(__dirname, '../storage/materials');
console.log('🔗 Static /materials ->', filesDir);

// Dateien im Browser ansehen:
app.use('/materials', express.static(filesDir, { fallthrough: false }));
app.use('/api/materials-auth', materialsAuthRouter);


// === Download-Route: erzwingt "Speichern unter" ===
app.get('/dl/:name', (req, res) => {
  const name = req.params.name;                  // z.B. "hello.txt"
  const abs  = path.resolve(filesDir, name);     // sicherer absoluter Pfad
  if (!abs.startsWith(filesDir)) return res.status(400).send('Bad path');
  if (!fs.existsSync(abs))     return res.status(404).send('Not found');

  // Content-Disposition: attachment -> Browser lädt herunter
  res.download(abs, name, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(err.statusCode || 500).send('Download fehlgeschlagen');
    }
  });
});

// === API-Routen ===

app.use('/api/contact', contactRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/materials', materialsRouter);

// === Start (extern erreichbar) ===
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API läuft auf http://0.0.0.0:${PORT}`);
});
