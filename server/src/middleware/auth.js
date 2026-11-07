import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'feedvault-secret-key-change-in-production';

/**
 * Authenticate a request by verifying the JWT in the Authorization header.
 * Attaches { id, email, role } to req.user on success.
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional authentication — same as authenticate but does NOT return 401.
 * If a valid token is present req.user is set; otherwise req.user is null.
 */
export function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}

/**
 * Require the authenticated user to have the 'admin' role.
 * Must be used AFTER authenticate.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export { JWT_SECRET };
