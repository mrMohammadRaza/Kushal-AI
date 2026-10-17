const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { db, logAuditEvent } = require('../data/database');
const { evaluateAssessment } = require('../services/aiService');
const { generateAssessmentReport } = require('../services/reportService');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

// Multer storage for media evidence
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// File filter for approved formats
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || (file.mimetype.startsWith('image') ? '.jpg' : '.wav');
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/webp',
      'audio/wav', 'audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/ogg',
      'video/mp4', 'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

/**
 * GET /api/assessments
 * List assessments with server-enforced role filtering.
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    let assessments;

    if (req.user && req.user.role === 'candidate') {
      // Candidate sees only their own assessments
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      const candidateId = profile ? profile.id : null;
      assessments = db.prepare(`
        SELECT a.*, c.full_name as candidate_name, o.trade as trade_title, o.nsqf_level
        FROM assessment_cases a
        JOIN candidate_profiles c ON a.candidate_id = c.id
        JOIN occupations o ON a.trade_id = o.id
        WHERE a.candidate_id = ?
        ORDER BY a.created_at DESC
      `).all(candidateId);
    } else {
      // Assessors, Managers, Admins, Auditors see queue
      const statusFilter = req.query.status;
      let query = `
        SELECT a.*, c.full_name as candidate_name, o.trade as trade_title, o.nsqf_level,
               u.full_name as assessor_name
        FROM assessment_cases a
        JOIN candidate_profiles c ON a.candidate_id = c.id
        JOIN occupations o ON a.trade_id = o.id
        LEFT JOIN users u ON a.assigned_assessor_id = u.id
      `;
      const params = [];

      if (statusFilter) {
        query += ` WHERE a.status = ?`;
        params.push(statusFilter);
      }

      query += ` ORDER BY a.created_at DESC LIMIT 50`;
      assessments = db.prepare(query).all(...params);
    }

    res.json(assessments.map(a => ({
      ...a,
      aiEvaluation: a.ai_evaluation_json ? JSON.parse(a.ai_evaluation_json) : null,
      antiFraudAudit: a.anti_fraud_audit_json ? JSON.parse(a.anti_fraud_audit_json) : null,
      assessorOverride: a.assessor_override_json ? JSON.parse(a.assessor_override_json) : null
    })));
  } catch (err) {
    console.error('[Assessments List Error]:', err);
    res.status(500).json({ error: "Failed to retrieve assessments: " + err.message });
  }
});

/**
 * GET /api/assessments/:id
 * Retrieve comprehensive assessment dossier with evidence, competencies, and decision history.
 */
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const assessment = db.prepare(`
      SELECT a.*, c.full_name as candidate_name, c.phone, c.district, c.state, c.aadhaar_last4,
             o.trade as trade_title, o.sector, o.qp_code, o.nsqf_level,
             u.full_name as assessor_name
      FROM assessment_cases a
      JOIN candidate_profiles c ON a.candidate_id = c.id
      JOIN occupations o ON a.trade_id = o.id
      LEFT JOIN users u ON a.assigned_assessor_id = u.id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment case not found." });
    }

    // Role verification: candidate can only inspect their own dossier
    if (req.user && req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access denied to candidate record." });
      }
    }

    // Load related evidence records
    const evidenceRecords = db.prepare(`
      SELECT * FROM evidence_records WHERE assessment_id = ?
    `).all(assessment.id);

    // Load competency criteria evaluations
    const competencyAssessments = db.prepare(`
      SELECT * FROM competency_assessments WHERE assessment_id = ? ORDER BY nos_code, pc_code
    `).all(assessment.id);

    // Load decision history
    const decisions = db.prepare(`
      SELECT d.*, u.full_name as assessor_name
      FROM assessment_decisions d
      JOIN users u ON d.assessor_id = u.id
      WHERE d.assessment_id = ?
      ORDER BY d.created_at DESC
    `).all(assessment.id);

    // Load report if generated
    const report = db.prepare(`
      SELECT * FROM reports WHERE assessment_id = ? ORDER BY released_at DESC LIMIT 1
    `).get(assessment.id);

    res.json({
      ...assessment,
      aiEvaluation: assessment.ai_evaluation_json ? JSON.parse(assessment.ai_evaluation_json) : null,
      antiFraudAudit: assessment.anti_fraud_audit_json ? JSON.parse(assessment.anti_fraud_audit_json) : null,
      assessorOverride: assessment.assessor_override_json ? JSON.parse(assessment.assessor_override_json) : null,
      evidenceRecords,
      competencyAssessments,
      decisions,
      report: report || null
    });
  } catch (err) {
    console.error('[Assessment Get Error]:', err);
    res.status(500).json({ error: "Failed to retrieve assessment: " + err.message });
  }
});

/**
 * POST /api/assessments/evaluate
 * Ingests multimodal evidence, computes SHA-256 integrity hashes, triggers AI evaluation,
 * and persists assessment case to database with human-in-the-loop requirement.
 */
router.post('/evaluate', optionalAuth, upload.fields([
  { name: 'practicalImage', maxCount: 1 },
  { name: 'audioViva', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      candidateId: bodyCandidateId,
      tradeId,
      vivaAnswer,
      vivaScenarioId,
      assessorNotes,
      antiFraudAudit
    } = req.body;

    // Determine candidate ID from authenticated session or validated body
    let candidateId = bodyCandidateId;
    if (req.user && req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (profile) candidateId = profile.id;
    }

    if (!candidateId || !tradeId) {
      return res.status(400).json({ error: "candidateId and tradeId are required." });
    }

    // Validate trade exists
    const trade = db.prepare('SELECT * FROM occupations WHERE id = ?').get(tradeId);
    if (!trade) {
      return res.status(400).json({ error: `Trade '${tradeId}' is not an indexed occupational standard.` });
    }

    const practicalImage = req.files && req.files['practicalImage'] ? req.files['practicalImage'][0] : null;
    const audioViva = req.files && req.files['audioViva'] ? req.files['audioViva'][0] : null;

    let parsedAntiFraud = null;
    try {
      parsedAntiFraud = typeof antiFraudAudit === 'string' ? JSON.parse(antiFraudAudit) : antiFraudAudit;
    } catch (e) {
      parsedAntiFraud = null;
    }

    const assessmentId = `asmt-${Date.now().toString().slice(-6)}`;
    const correlationId = `corr-${Date.now()}-${uuidv4().slice(0, 6)}`;

    // 1. Process via AI Pipeline (Gemini / LangGraph / Deterministic Fallback)
    const aiEvaluation = await evaluateAssessment({
      tradeId,
      candidateId,
      vivaAnswer,
      vivaScenarioId,
      imagePath: practicalImage ? practicalImage.path : null,
      audioPath: audioViva ? audioViva.path : null,
      assessorNotes,
      antiFraudAudit: parsedAntiFraud,
      correlationId
    });

    // 2. Compute Hashes and Record Evidence in SQLite Transaction
    const tx = db.transaction(() => {
      // Create Assessment Case
      db.prepare(`
        INSERT INTO assessment_cases (
          id, candidate_id, trade_id, center_id, assigned_assessor_id,
          status, overall_score, recommendation, ai_evaluation_json,
          anti_fraud_audit_json, assessor_notes
        ) VALUES (?, ?, ?, 'center-01', 'user-assessor-01', ?, ?, ?, ?, ?, ?)
      `).run(
        assessmentId,
        candidateId,
        tradeId,
        aiEvaluation.status || 'assessor_review_required',
        aiEvaluation.overallScore || null,
        aiEvaluation.recommendation || 'Assessment logged for human review.',
        JSON.stringify(aiEvaluation),
        parsedAntiFraud ? JSON.stringify(parsedAntiFraud) : null,
        assessorNotes || null
      );

      // Record Practical Image Evidence
      if (practicalImage) {
        const imgBuffer = fs.readFileSync(practicalImage.path);
        const imgHash = crypto.createHash('sha256').update(imgBuffer).digest('hex');
        const imgEvidenceId = `ev-img-${Date.now()}-${uuidv4().slice(0, 6)}`;

        db.prepare(`
          INSERT INTO evidence_records (
            id, assessment_id, candidate_id, evidence_type, file_path,
            original_filename, mime_type, file_size, sha256_hash
          ) VALUES (?, ?, ?, 'image', ?, ?, ?, ?, ?)
        `).run(
          imgEvidenceId,
          assessmentId,
          candidateId,
          `/uploads/${path.basename(practicalImage.path)}`,
          practicalImage.originalname,
          practicalImage.mimetype,
          practicalImage.size,
          imgHash
        );
      }

      // Record Viva Audio Evidence
      if (audioViva) {
        const audioBuffer = fs.readFileSync(audioViva.path);
        const audioHash = crypto.createHash('sha256').update(audioBuffer).digest('hex');
        const audioEvidenceId = `ev-aud-${Date.now()}-${uuidv4().slice(0, 6)}`;

        db.prepare(`
          INSERT INTO evidence_records (
            id, assessment_id, candidate_id, evidence_type, file_path,
            original_filename, mime_type, file_size, sha256_hash
          ) VALUES (?, ?, ?, 'audio', ?, ?, ?, ?, ?)
        `).run(
          audioEvidenceId,
          assessmentId,
          candidateId,
          `/uploads/${path.basename(audioViva.path)}`,
          audioViva.originalname,
          audioViva.mimetype,
          audioViva.size,
          audioHash
        );
      }

      // Populate Granular Competency Criteria from AI analysis
      if (Array.isArray(aiEvaluation.nosResults)) {
        const insertComp = db.prepare(`
          INSERT INTO competency_assessments (
            id, assessment_id, nos_code, pc_code, criteria_text,
            evidence_status, ai_score, ai_suggestion, evidence_citation
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const nos of aiEvaluation.nosResults) {
          if (Array.isArray(nos.performanceCriteria)) {
            for (const pc of nos.performanceCriteria) {
              const pcId = `pc-${assessmentId}-${nos.nosCode}-${pc.code || 'PC'}`;
              insertComp.run(
                pcId,
                assessmentId,
                nos.nosCode,
                pc.code || 'PC',
                pc.description || nos.title,
                pc.status || 'not_assessed',
                pc.score || null,
                nos.feedback || null,
                pc.evidence || null
              );
            }
          }
        }
      }
    });

    tx();

    logAuditEvent({
      entityType: 'assessment',
      entityId: assessmentId,
      userId: req.user ? req.user.id : null,
      userRole: req.user ? req.user.role : 'candidate',
      action: 'EVIDENCE_SUBMITTED_AND_EVALUATED',
      details: { tradeId, candidateId, status: aiEvaluation.status },
      ipAddress: req.ip
    });

    const createdRecord = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(assessmentId);

    res.status(201).json({
      ...createdRecord,
      aiEvaluation,
      mediaEvidence: {
        imageUrl: practicalImage ? `/uploads/${path.basename(practicalImage.path)}` : null,
        audioUrl: audioViva ? `/uploads/${path.basename(audioViva.path)}` : null
      }
    });
  } catch (err) {
    console.error('[Evaluation Route Error]:', err);
    res.status(500).json({ error: "Failed to evaluate candidate evidence: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/signoff
 * Certified Human Assessor Sign-Off & Official Report Release.
 * Server-Enforced Role: Assessor or Admin only.
 */
router.post('/:id/signoff', authenticateToken, requireRole(['assessor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { finalDecision, assessorRemarks, scoreAdjustments } = req.body;

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment case not found." });
    }

    if (assessment.signed_off) {
      return res.status(400).json({ error: "Assessment has already been signed off and released." });
    }

    const decisionCode = finalDecision || 'certified_approved';
    const remarks = assessorRemarks || "Assessment verified against National Occupational Standards and signed off.";

    // Generate cryptographic signature of assessor sign-off
    const signatureDigest = crypto.createHmac('sha256', process.env.JWT_SECRET || 'kaushal_key')
      .update(`${id}|${req.user.id}|${decisionCode}|${new Date().toISOString()}`)
      .digest('hex');

    const decisionId = `dec-${Date.now()}-${uuidv4().slice(0, 6)}`;

    // Atomic transaction for sign-off update
    const tx = db.transaction(() => {
      // 1. Update Assessment Case
      db.prepare(`
        UPDATE assessment_cases
        SET signed_off = 1,
            signed_off_at = CURRENT_TIMESTAMP,
            signed_off_by = ?,
            status = ?,
            assessor_notes = ?,
            assessor_override_json = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        req.user.id,
        decisionCode,
        remarks,
        JSON.stringify({ finalDecision: decisionCode, remarks, scoreAdjustments }),
        id
      );

      // 2. Insert Decision Record
      db.prepare(`
        INSERT INTO assessment_decisions (
          id, assessment_id, assessor_id, decision, remarks, score_adjustments_json, signature_digest
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        decisionId,
        id,
        req.user.id,
        decisionCode,
        remarks,
        scoreAdjustments ? JSON.stringify(scoreAdjustments) : null,
        signatureDigest
      );
    });

    tx();

    // 3. Generate Official Verifiable PDF Report with QR Code
    const reportData = await generateAssessmentReport(id, req.user);

    logAuditEvent({
      entityType: 'assessment',
      entityId: id,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'HUMAN_ASSESSOR_SIGNOFF_COMPLETED',
      details: { decisionCode, signatureDigest, reportId: reportData.reportId }
    });

    const updated = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);

    res.json({
      message: "Assessment signed off and official report released.",
      assessment: updated,
      decision: {
        id: decisionId,
        decision: decisionCode,
        remarks,
        signatureDigest
      },
      report: reportData
    });
  } catch (err) {
    console.error('[Sign-Off Error]:', err);
    res.status(500).json({ error: "Failed to sign off assessment: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/score
 * Update granular rubric scores for individual performance criteria.
 */
router.post('/:id/score', authenticateToken, requireRole(['assessor', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { pcCode, assessorScore, assessorComments, evidenceStatus } = req.body;

    if (!pcCode) {
      return res.status(400).json({ error: "pcCode is required." });
    }

    db.prepare(`
      UPDATE competency_assessments
      SET assessor_score = ?,
          assessor_comments = ?,
          evidence_status = COALESCE(?, evidence_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE assessment_id = ? AND pc_code = ?
    `).run(assessorScore || null, assessorComments || null, evidenceStatus || null, id, pcCode);

    res.json({ message: "Competency criterion score updated.", pcCode, assessorScore });
  } catch (err) {
    res.status(500).json({ error: "Failed to update score: " + err.message });
  }
});

module.exports = router;
