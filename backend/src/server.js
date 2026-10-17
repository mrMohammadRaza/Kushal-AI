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
const { chatCopilot } = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Security Headers & CORS
app.use(cors({
  origin: '*', // Configurable via environment in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
}));

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Serve uploaded media evidence statically (Reports & Uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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

// Interactive Gemini Assessor Co-Pilot
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { message, assessmentContext, trade } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required." });
    }
    const reply = await chatCopilot({ message, assessmentContext, trade });
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoute);
app.use('/api/candidates', candidatesRoute);
app.use('/api/trades', tradesRoute);
app.use('/api/assessments', assessmentsRoute);
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
