// backend/routes/images.js
import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'storage', 'images');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ storage });

const router = Router();

// Upload
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// Liste
router.get('/', async (_req, res) => {
  try {
    const files = await fsp.readdir(uploadDir);
    res.json(files.map(name => ({ filename: name, url: `/uploads/${name}` })));
  } catch (e) {
    res.status(500).json({ error: 'Konnte Bilder nicht lesen' });
  }
});

// Delete
router.delete('/:filename', async (req, res) => {
  try {
    await fsp.unlink(path.join(uploadDir, req.params.filename));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
