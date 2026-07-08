import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  if (!config.supabaseJwtSecret) return res.status(500).json({ error: 'Missing SUPABASE_JWT_SECRET' });

  try {
    const decoded = jwt.verify(token, config.supabaseJwtSecret);
    req.user = {
      id: decoded.sub,
      email: decoded.email || null,
      role: decoded.role || 'authenticated'
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
      }
