const jwt = require('jsonwebtoken');
const { db, logAuditEvent } = require('../data/database');

const JWT_SECRET = process.env.JWT_SECRET || 'kaushal_ai_sih_secret_key_2026';

/**
 * Middleware: Verify Bearer JWT Token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Authentication token is missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch fresh user record from database
    const user = db.prepare('SELECT id, email, full_name, role, center_id FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User session invalid or user no longer exists." });
    }

    req.user = user;

    // If candidate, attach candidate profile ID if found
    if (user.role === 'candidate') {
      const profile = db.prepare('SELECT id, trade_id FROM candidate_profiles WHERE user_id = ?').get(user.id);
      req.candidateProfile = profile || null;
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token. Please log in again." });
  }
}

/**
 * Optional Authentication: Attaches req.user if token is present, continues otherwise.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, full_name, role, center_id FROM users WHERE id = ?').get(decoded.id);
    if (user) {
      req.user = user;
      if (user.role === 'candidate') {
        const profile = db.prepare('SELECT id, trade_id FROM candidate_profiles WHERE user_id = ?').get(user.id);
        req.candidateProfile = profile || null;
      }
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Middleware: Role-Based Access Control (RBAC)
 * @param {string[]} allowedRoles Array of roles authorized for the endpoint
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        entityType: 'security',
        entityId: req.user.id,
        userId: req.user.id,
        userRole: req.user.role,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        details: { path: req.originalUrl, method: req.method, requiredRoles: allowedRoles },
        ipAddress: req.ip || req.connection.remoteAddress
      });

      return res.status(403).json({ 
        error: `Access forbidden: Role '${req.user.role}' is not authorized to perform this action.`,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}

/**
 * Generates JWT token for authenticated user
 */
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      full_name: user.full_name 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  generateToken,
  JWT_SECRET
};
