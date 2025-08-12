import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.getAsync('SELECT * FROM users WHERE id = ? AND is_active = 1', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const logActivity = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log activity after successful response
    if (req.user && (req.method !== 'GET' || req.url.includes('/download'))) {
      db.run(
        'INSERT INTO logs (user_id, action, meta_json, ip_address) VALUES (?, ?, ?, ?)',
        [
          req.user.id,
          `${req.method} ${req.url}`,
          JSON.stringify({ body: req.body, params: req.params, query: req.query }),
          req.ip
        ]
      );
    }
    
    originalSend.call(this, data);
  };
  
  next();
};