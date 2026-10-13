const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const candidatesRoute = require('./routes/candidates');
const tradesRoute = require('./routes/trades');
const assessmentsRoute = require('./routes/assessments');
const digilockerRoute = require('./routes/digilocker');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media evidence statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check endpoints (both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    service: 'Kaushal AI Core Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/candidates', candidatesRoute);
app.use('/api/trades', tradesRoute);
app.use('/api/assessments', assessmentsRoute);
app.use('/api/digilocker', digilockerRoute);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Kaushal AI Backend] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
