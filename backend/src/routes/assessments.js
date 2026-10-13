const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('../data/db');
const { evaluateAssessment } = require('../services/aiService');

// Multer storage for media evidence
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('image') ? '.jpg' : '.wav');
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB
});

// List all past assessments
router.get('/', (req, res) => {
  const db = readDb();
  res.json(db.assessments || []);
});

// Get assessment by ID
router.get('/:id', (req, res) => {
  const db = readDb();
  const assessment = (db.assessments || []).find(a => a.id === req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: "Assessment session not found" });
  }
  res.json(assessment);
});

// Create and trigger AI co-pilot evaluation
router.post('/evaluate', upload.fields([
  { name: 'practicalImage', maxCount: 1 },
  { name: 'audioViva', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      candidateId,
      tradeId,
      vivaAnswer,
      vivaScenarioId,
      assessorNotes,
      assessorName,
      antiFraudAudit
    } = req.body;

    if (!candidateId || !tradeId) {
      return res.status(400).json({ error: "candidateId and tradeId are required" });
    }

    const practicalImage = req.files && req.files['practicalImage'] ? req.files['practicalImage'][0] : null;
    const audioViva = req.files && req.files['audioViva'] ? req.files['audioViva'][0] : null;

    let parsedAntiFraud = null;
    try {
      parsedAntiFraud = typeof antiFraudAudit === 'string' ? JSON.parse(antiFraudAudit) : antiFraudAudit;
    } catch (e) {
      parsedAntiFraud = null;
    }

    // Call AI Co-pilot Engine
    const aiEvaluation = await evaluateAssessment({
      tradeId,
      candidateId,
      vivaAnswer,
      vivaScenarioId,
      imagePath: practicalImage ? practicalImage.path : null,
      audioPath: audioViva ? audioViva.path : null,
      assessorNotes,
      antiFraudAudit: parsedAntiFraud
    });

    const db = readDb();
    const candidate = db.candidates.find(c => c.id === candidateId) || { name: "Candidate" };

    const assessmentRecord = {
      id: `asmt-${Date.now().toString().slice(-6)}`,
      candidateId,
      candidateName: candidate.name,
      tradeId,
      evaluatedAt: new Date().toISOString(),
      assessorName: assessorName || "Lead Assessor (Sector Skill Council)",
      mediaEvidence: {
        imageUrl: practicalImage ? `/uploads/${path.basename(practicalImage.path)}` : null,
        audioUrl: audioViva ? `/uploads/${path.basename(audioViva.path)}` : null
      },
      vivaInput: vivaAnswer || "",
      aiEvaluation,
      antiFraudAudit: parsedAntiFraud || aiEvaluation.antiFraudAudit || null,
      assessorOverride: null,
      finalStatus: aiEvaluation.status,
      signedOff: false,
      signedOffAt: null
    };

    db.assessments.unshift(assessmentRecord);
    writeDb(db);

    res.status(201).json(assessmentRecord);
  } catch (err) {
    console.error("Evaluation error:", err);
    res.status(500).json({ error: "Failed to evaluate candidate: " + err.message });
  }
});

// Human Assessor Sign-Off / Override (Human-in-the-Loop)
router.post('/:id/signoff', (req, res) => {
  const db = readDb();
  const assessment = (db.assessments || []).find(a => a.id === req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: "Assessment session not found" });
  }

  const { finalDecision, assessorRemarks, scoreAdjustments } = req.body;

  assessment.signedOff = true;
  assessment.signedOffAt = new Date().toISOString();
  assessment.assessorOverride = {
    decision: finalDecision || assessment.finalStatus,
    remarks: assessorRemarks || "Assessment verified and signed off by certified sector assessor.",
    scoreAdjustments: scoreAdjustments || null
  };
  assessment.finalStatus = finalDecision || assessment.finalStatus;

  writeDb(db);
  res.json(assessment);
});

module.exports = router;
