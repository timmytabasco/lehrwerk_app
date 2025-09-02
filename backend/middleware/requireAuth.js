import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) return res.status(401).json({ ok:false, message:'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { uid }
    next();
  } catch {
    return res.status(401).json({ ok:false, message:'Invalid or expired session' });
  }
}
export default requireAuth;

