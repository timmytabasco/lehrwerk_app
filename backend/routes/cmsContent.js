import express from 'express';
import fs from 'fs';  
import path from 'path';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();
const CONTENT_DIR = '/home/timmy/webdev/lehrwerk_app/public/data';
const ALLOWED = new Set([
  'faq.json', 'kurse.json', 'kursvorschau.json', 'modals.json', 'rechtliches.json', 'ueberuns.json'
]);

// GET /api/cms/content 
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const files = Array.from(ALLOWED).map(name => ({
      name,
      path: `/api/cms/content/${name}`
    }));
    
    res.json({ 
      ok: true, 
      files,
      count: files.length,
      directory: CONTENT_DIR 
    });
  } catch (e) { next(e); }
});

router.get('/:name', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED.has(name)) {
      return res.status(400).json({ ok: false, message: 'Not allowed' });
    }
    
    const filePath = path.join(CONTENT_DIR, name);
    const txt = fs.readFileSync(filePath, 'utf-8');
    
    res.json({ 
      ok: true, 
      name, 
      data: JSON.parse(txt)  // ← "data" nicht "content"!
    });
  } catch (e) { 
    console.error('Error reading file:', e);
    if (e.code === 'ENOENT') {
      return res.status(404).json({ ok: false, message: 'File not found', path: filePath });
    }
    next(e); 
  }
});

router.put('/:name', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!ALLOWED.has(name)) {
      return res.status(400).json({ ok: false, message: 'Not allowed' });
    }
    
    if (typeof req.body !== 'object') {
      return res.status(400).json({ ok: false, message: 'Body must be JSON' });
    }

    const jsonStr = JSON.stringify(req.body, null, 2);
    const filePath = path.join(CONTENT_DIR, name);
    const tmpPath = filePath + '.tmp';

    fs.writeFileSync(tmpPath, jsonStr, 'utf-8');
    fs.renameSync(tmpPath, filePath);

    res.json({ 
      ok: true, 
      saved: name,
      message: 'File saved successfully'
    });
  } catch (e) { 
    console.error('Error saving file:', e);
    next(e); 
  }
});

export default router;