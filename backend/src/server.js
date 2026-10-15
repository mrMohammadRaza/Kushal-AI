const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const candidatesRoute = require('./routes/candidates');
const tradesRoute = require('./routes/trades');
const assessmentsRoute = require('./routes/assessments');
const digilockerRoute = require('./routes/digilocker');
const { chatCopilot } = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded media evidence statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check endpoints (both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    service: 'Kaushal AI Core Backend (Gemini 3.5 Powered)',
    version: '2.0.0',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Interactive Gemini Assessor Co-Pilot
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { message, assessmentContext, trade } = req.body;
    const reply = await chatCopilot({ message, assessmentContext, trade });
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mount Routes
app.use('/api/candidates', candidatesRoute);
app.use('/api/trades', tradesRoute);
app.use('/api/assessments', assessmentsRoute);
app.use('/api/digilocker', digilockerRoute);

// Serve Frontend static production bundle if available (Production Monorepo on Render/Vercel)
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
  console.error("Internal Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`[Kaushal AI Backend] Listening on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
