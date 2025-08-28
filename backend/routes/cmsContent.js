import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
const CONTENT_DIR = process.env.CONTENT_DIR || './public/data';
const ALLOWED = new Set([
  'faq.json', 'kurse.json', 'kursvorschau.json', 'modals.json', 'rechtliches.json', 'ueberuns.json'
]);

router.get('/:name', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED.has(name)) return res.status(400).json({ ok:false, message:'Not allowed' });
    const filePath = path.join(CONTENT_DIR, name);
    const txt = await fs.readFile(filePath, 'utf-8');
    res.json({ ok:true, name, data: JSON.parse(txt) });
  } catch (e) { next(e); }
});

router.put('/:name', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED.has(name)) return res.status(400).json({ ok:false, message:'Not allowed' });
    if (typeof req.body !== 'object') return res.status(400).json({ ok:false, message:'Body must be JSON' });

    // (optional) simple validation je Datei hier ergänzen
    const jsonStr = JSON.stringify(req.body, null, 2);

    const filePath = path.join(CONTENT_DIR, name);
    const tmpPath  = filePath + '.tmp';

    await fs.writeFile(tmpPath, jsonStr, 'utf-8');
    await fs.rename(tmpPath, filePath);

    res.json({ ok:true, saved: name });
  } catch (e) { next(e); }
});

export default router;
