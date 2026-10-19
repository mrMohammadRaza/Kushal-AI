const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { db } = require('./data/database');
const authRoute = require('./routes/auth');
const candidatesRoute = require('./routes/candidates');
const tradesRoute = require('./routes/trades');
const assessmentsRoute = require('./routes/assessments');
const reportsRoute = require('./routes/reports');
const digilockerRoute = require('./routes/digilocker');
const assessmentTemplatesRoute = require('./routes/assessmentTemplates');
const { chatCopilot } = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const { authenticateToken, requireRole } = require('./middleware/auth');

// Explicit Trusted Origins & CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'https://kushal-ai.vercel.app'
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS access denied: origin not in trusted list.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  credentials: true
}));

// Standard Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Lightweight In-Memory Rate Limiter for Sensitive Endpoints
const rateLimitMap = new Map();
function rateLimiter({ windowMs = 60000, max = 60, message = "Too many requests. Please try again shortly." } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientRecord.resetTime) {
      clientRecord.count = 1;
      clientRecord.resetTime = now + windowMs;
    } else {
      clientRecord.count++;
    }

    rateLimitMap.set(ip, clientRecord);

    if (clientRecord.count > max) {
      return res.status(429).json({ error: message, retryAfterSeconds: Math.ceil((clientRecord.resetTime - now) / 1000) });
    }

    next();
  };
}

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));


// Protected evidence access route (replaces unrestricted static exposure)
app.get('/uploads/:filename', authenticateToken, (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // Prevents directory traversal
    const safePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: "Evidence file not found." });
    }

    // Verify ownership or staff authorization
    const evidence = db.prepare(`
      SELECT e.*, a.assigned_assessor_id, a.center_id
      FROM evidence_records e
      JOIN assessment_cases a ON e.assessment_id = a.id
      WHERE e.file_path LIKE ?
    `).get(`%${filename}%`);

    if (evidence) {
      if (req.user.role === 'candidate') {
        const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
        if (!profile || profile.id !== evidence.candidate_id) {
          return res.status(403).json({ error: "Access forbidden: You cannot view evidence belonging to another candidate." });
        }
      } else if (req.user.role === 'assessor') {
        if (evidence.assigned_assessor_id !== req.user.id) {
          return res.status(403).json({ error: "Access forbidden: Assessor is not assigned to this candidate assessment." });
        }
      } else if (req.user.role === 'center_manager') {
        if (evidence.center_id !== req.user.center_id) {
          return res.status(403).json({ error: "Access forbidden: Evidence does not belong to your center." });
        }
      }
    }

    res.sendFile(safePath);
  } catch (err) {
    res.status(500).json({ error: "Evidence access error: " + err.message });
  }
});

// Health check endpoints: Liveness and Readiness
app.get(['/api/health', '/health'], (req, res) => {
  let dbStatus = 'healthy';
  let totalCandidates = 0;
  let totalAssessments = 0;

  try {
    const candRow = db.prepare('SELECT COUNT(*) as count FROM candidate_profiles').get();
    const asmtRow = db.prepare('SELECT COUNT(*) as count FROM assessment_cases').get();
    totalCandidates = candRow.count;
    totalAssessments = asmtRow.count;
  } catch (err) {
    dbStatus = 'degraded: ' + err.message;
  }

  res.json({
    status: 'online',
    service: 'Kaushal AI Core Backend (SIH26242 RPL Co-Pilot)',
    version: '2.1.0',
    database: {
      type: 'SQLite3 (ACID Relational WAL)',
      status: dbStatus,
      candidateRecords: totalCandidates,
      assessmentRecords: totalAssessments
    },
    aiProviders: {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      bhashiniConfigured: Boolean(process.env.BHASHINI_API_KEY && !process.env.BHASHINI_API_KEY.includes('sih26242'))
    },
    timestamp: new Date().toISOString()
  });
});

// Interactive Gemini Assessor Co-Pilot (Authorized Assessment Staff Only)
app.post(
  '/api/ai/copilot', 
  rateLimiter({ windowMs: 60000, max: 30 }),
  authenticateToken, 
  requireRole(['assessor', 'center_manager', 'admin', 'auditor']), 
  async (req, res) => {
    try {
      const { message, assessmentContext, trade } = req.body;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: "message is required and must be non-empty text." });
      }

      // Sanitize input length to prevent token abuse or overflow
      const safeMessage = message.trim().slice(0, 2000);

      const reply = await chatCopilot({ 
        message: safeMessage, 
        assessmentContext, 
        trade 
      });

      res.json({ reply });
    } catch (err) {
      console.error("[Copilot Error]:", err.message);
      res.status(500).json({ error: "Co-pilot assistance temporarily unavailable." });
    }
  }
);


// Mount Routes
app.use('/api/auth', authRoute);
app.use('/api/candidates', candidatesRoute);
app.use('/api/trades', tradesRoute);
app.use('/api/assessments', assessmentsRoute);
app.use('/api/assessment-templates', assessmentTemplatesRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/digilocker', digilockerRoute);

// Serve Frontend static production bundle if available
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Backend Error Handler]:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`[Kaushal AI Backend] Listening on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
