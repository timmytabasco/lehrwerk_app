import { Router } from 'express';

const router = Router();

router.post('/check-code', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ ok: false });

  if (code === process.env.MATERIALS_CODE) {
    return res.json({ ok: true });
  } else {
    return res.status(401).json({ ok: false });
  }
});

export default router;
