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
const {
  evaluatePracticalCodingTask,
  evaluateDebuggingTask,
  evaluateKnowledgeAnswers,
  evaluateTechnicalExplanation,
  computeComprehensiveRubricScore
} = require('../services/codeExecutionService');
const { WEB_DEVELOPER_TEMPLATE } = require('../data/defaultTemplates');

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

const {
  getPublicInitialTest,
  evaluateInitialTestSubmission
} = require('../services/initialTestService');

/**
 * GET /api/assessments/initial-test/:tradeId
 * Returns scrubbed question bank for initial skill screening during onboarding.
 */
router.get('/initial-test/:tradeId', (req, res) => {
  try {
    const { tradeId } = req.params;
    const test = getPublicInitialTest(tradeId);
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve initial test: " + err.message });
  }
});

/**
 * POST /api/assessments/initial-test
 * Evaluates candidate responses strictly server-side without exposing answer keys.
 */
router.post('/initial-test', optionalAuth, (req, res) => {
  try {
    const { tradeId, email, candidateId, answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: "Answers object is required." });
    }

    const candidateEmail = req.user?.email || email || 'guest@candidate.rpl';
    const cId = req.user?.role === 'candidate' ? (req.user.candidateId || candidateId) : candidateId;

    const result = evaluateInitialTestSubmission({
      tradeId: tradeId || 'web-developer-l5',
      email: candidateEmail,
      candidateId: cId,
      answers
    });

    logAuditEvent({
      entityType: 'initial_test',
      entityId: result.testId,
      userId: req.user?.id || null,
      userRole: req.user?.role || 'candidate',
      action: 'INITIAL_SKILL_TEST_COMPLETED',
      details: {
        tradeId: result.tradeId,
        percentage: result.percentage,
        readinessLevel: result.readinessLevel
      },
      ipAddress: req.ip
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Initial test evaluation failed: " + err.message });
  }
});

/**
 * GET /api/assessments
 * List assessments with server-enforced role and center filtering.
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    let assessments;

    if (req.user.role === 'candidate') {
      // Candidate sees ONLY their own assessments
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
    } else if (req.user.role === 'assessor') {
      // Assessor sees ONLY assessments explicitly assigned to them
      const statusFilter = req.query.status;
      let query = `
        SELECT a.*, c.full_name as candidate_name, o.trade as trade_title, o.nsqf_level,
               u.full_name as assessor_name
        FROM assessment_cases a
        JOIN candidate_profiles c ON a.candidate_id = c.id
        JOIN occupations o ON a.trade_id = o.id
        LEFT JOIN users u ON a.assigned_assessor_id = u.id
        WHERE a.assigned_assessor_id = ?
      `;
      const params = [req.user.id];

      if (statusFilter) {
        query += ` AND a.status = ?`;
        params.push(statusFilter);
      }

      query += ` ORDER BY a.created_at DESC LIMIT 50`;
      assessments = db.prepare(query).all(...params);
    } else if (req.user.role === 'center_manager') {
      // Center manager sees ONLY assessments belonging to their authorized assessment center
      const statusFilter = req.query.status;
      let query = `
        SELECT a.*, c.full_name as candidate_name, o.trade as trade_title, o.nsqf_level,
               u.full_name as assessor_name
        FROM assessment_cases a
        JOIN candidate_profiles c ON a.candidate_id = c.id
        JOIN occupations o ON a.trade_id = o.id
        LEFT JOIN users u ON a.assigned_assessor_id = u.id
        WHERE a.center_id = ?
      `;
      const params = [req.user.center_id || 'center-01'];

      if (statusFilter) {
        query += ` AND a.status = ?`;
        params.push(statusFilter);
      }

      query += ` ORDER BY a.created_at DESC LIMIT 50`;
      assessments = db.prepare(query).all(...params);
    } else {
      // Platform Admins and Quality Auditors have cross-center oversight
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
 * Enforces strict object-level authorization across Candidate, Assessor, and Center Manager.
 */
router.get('/:id', authenticateToken, (req, res) => {
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

    // 1. Candidate authorization: Can only inspect their own dossier
    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden: Candidate is not authorized to view this assessment dossier." });
      }
    }

    // 2. Assessor authorization: Can only inspect assessments assigned to them
    if (req.user.role === 'assessor') {
      if (assessment.assigned_assessor_id !== req.user.id) {
        return res.status(403).json({ error: "Access forbidden: Assessor is not assigned to this candidate assessment case." });
      }
    }

    // 3. Center Manager authorization: Can only inspect assessments at their center
    if (req.user.role === 'center_manager') {
      if (assessment.center_id !== req.user.center_id) {
        return res.status(403).json({ error: "Access forbidden: Assessment case does not belong to your assigned center." });
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

    // Load template if assigned
    let template = null;
    if (assessment.template_id) {
      const rawTpl = db.prepare('SELECT * FROM assessment_templates WHERE id = ?').get(assessment.template_id);
      if (rawTpl) {
        template = {
          ...rawTpl,
          competencies: JSON.parse(rawTpl.competencies_json),
          knowledgeTasks: JSON.parse(rawTpl.knowledge_tasks_json),
          codingTask: JSON.parse(rawTpl.coding_task_json),
          debugTask: JSON.parse(rawTpl.debug_task_json),
          scoringRubric: JSON.parse(rawTpl.scoring_rubric_json),
          rules: rawTpl.rules_json ? JSON.parse(rawTpl.rules_json) : null
        };
      }
    }

    res.json({
      ...assessment,
      aiEvaluation: assessment.ai_evaluation_json ? JSON.parse(assessment.ai_evaluation_json) : null,
      antiFraudAudit: assessment.anti_fraud_audit_json ? JSON.parse(assessment.anti_fraud_audit_json) : null,
      assessorOverride: assessment.assessor_override_json ? JSON.parse(assessment.assessor_override_json) : null,
      knowledgeSubmission: assessment.knowledge_submission_json ? JSON.parse(assessment.knowledge_submission_json) : null,
      codingSubmission: assessment.coding_submission_json ? JSON.parse(assessment.coding_submission_json) : null,
      debugSubmission: assessment.debug_submission_json ? JSON.parse(assessment.debug_submission_json) : null,
      testResults: assessment.test_results_json ? JSON.parse(assessment.test_results_json) : null,
      rubricScores: assessment.rubric_scores_json ? JSON.parse(assessment.rubric_scores_json) : null,
      evidenceRequests: assessment.evidence_requests_json ? JSON.parse(assessment.evidence_requests_json) : null,
      template,
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
router.post('/evaluate', authenticateToken, upload.fields([
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

    // Determine and enforce candidate ID from authenticated session
    let candidateId = bodyCandidateId;
    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile) {
        return res.status(403).json({ error: "No candidate profile associated with this authenticated account." });
      }
      if (bodyCandidateId && bodyCandidateId !== profile.id) {
        return res.status(403).json({ error: "Access forbidden: Candidate cannot submit evidence on behalf of another candidate." });
      }
      candidateId = profile.id;
    } else {
      // Assessor or Admin submitting on behalf of a candidate
      if (!candidateId) {
        return res.status(400).json({ error: "candidateId is required when submitting as staff." });
      }
      const existingCand = db.prepare('SELECT id FROM candidate_profiles WHERE id = ?').get(candidateId);
      if (!existingCand) {
        return res.status(404).json({ error: `Candidate '${candidateId}' does not exist.` });
      }
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

    // Assessor must be explicitly assigned to this assessment (admins may override)
    if (req.user.role === 'assessor' && assessment.assigned_assessor_id !== req.user.id) {
      return res.status(403).json({ error: "Access forbidden: Assessor is not assigned to this candidate assessment case." });
    }

    // Explicit decision required (no silent default to certified_approved)
    const validDecisions = ['certified_approved', 'conditional_bridge_training', 'requires_practical_demonstration', 'rejected'];
    if (!finalDecision || !validDecisions.includes(finalDecision)) {
      return res.status(400).json({ 
        error: `A valid finalDecision is required. Permitted values: ${validDecisions.join(', ')}` 
      });
    }

    // Explicit remarks required for human accountability
    if (!assessorRemarks || assessorRemarks.trim().length < 5) {
      return res.status(400).json({ error: "assessorRemarks are mandatory for assessor sign-off (min 5 characters)." });
    }

    const decisionCode = finalDecision;
    const remarks = assessorRemarks.trim();

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

/**
 * POST /api/assessments/start
 * Start or resume hybrid assessment for candidate.
 */
router.post('/start', authenticateToken, (req, res) => {
  try {
    const { tradeId = 'web-developer-l5', templateId } = req.body;
    let candidateId;

    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile) {
        return res.status(403).json({ error: "No candidate profile found for authenticated user." });
      }
      candidateId = profile.id;
    } else {
      candidateId = req.body.candidateId;
      if (!candidateId) {
        return res.status(400).json({ error: "candidateId is required when staff starts an assessment." });
      }
    }

    const trade = db.prepare('SELECT * FROM occupations WHERE id = ?').get(tradeId);
    if (!trade) {
      return res.status(400).json({ error: `Trade '${tradeId}' is not an indexed occupation.` });
    }

    let template = null;
    if (templateId) {
      template = db.prepare('SELECT * FROM assessment_templates WHERE id = ? AND active = 1').get(templateId);
    }
    if (!template) {
      template = db.prepare('SELECT * FROM assessment_templates WHERE trade_id = ? AND active = 1 ORDER BY version DESC LIMIT 1').get(tradeId);
    }
    if (!template && (tradeId === 'web-developer-l5' || tradeId === 'web-developer')) {
      template = db.prepare('SELECT * FROM assessment_templates WHERE id = ?').get('tpl-web-developer-v1');
    }

    // Check for existing resumable draft
    const existing = db.prepare(`
      SELECT * FROM assessment_cases 
      WHERE candidate_id = ? AND trade_id = ? AND status IN ('draft', 'returned_for_evidence', 'requires_practical_test')
      ORDER BY created_at DESC LIMIT 1
    `).get(candidateId, tradeId);

    const parsedTemplate = template ? {
      ...template,
      competencies: JSON.parse(template.competencies_json),
      knowledgeTasks: JSON.parse(template.knowledge_tasks_json),
      codingTask: JSON.parse(template.coding_task_json),
      debugTask: JSON.parse(template.debug_task_json),
      scoringRubric: JSON.parse(template.scoring_rubric_json),
      rules: template.rules_json ? JSON.parse(template.rules_json) : null
    } : null;

    if (existing) {
      return res.json({
        message: "Resumed active assessment session.",
        isResumed: true,
        assessment: {
          ...existing,
          knowledgeSubmission: existing.knowledge_submission_json ? JSON.parse(existing.knowledge_submission_json) : null,
          codingSubmission: existing.coding_submission_json ? JSON.parse(existing.coding_submission_json) : null,
          debugSubmission: existing.debug_submission_json ? JSON.parse(existing.debug_submission_json) : null,
          testResults: existing.test_results_json ? JSON.parse(existing.test_results_json) : null,
          rubricScores: existing.rubric_scores_json ? JSON.parse(existing.rubric_scores_json) : null
        },
        template: parsedTemplate,
        currentStep: existing.current_step || 'knowledge'
      });
    }

    const assessmentId = `asmt-${Date.now().toString().slice(-6)}`;
    const effectiveTemplateId = template ? template.id : 'tpl-web-developer-v1';

    db.prepare(`
      INSERT INTO assessment_cases (
        id, candidate_id, trade_id, center_id, assigned_assessor_id,
        status, current_step, template_id, created_at, updated_at
      ) VALUES (?, ?, ?, 'center-01', 'user-assessor-01', 'draft', 'knowledge', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(assessmentId, candidateId, tradeId, effectiveTemplateId);

    logAuditEvent({
      entityType: 'assessment',
      entityId: assessmentId,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'ASSESSMENT_INITIALIZED',
      details: { tradeId, templateId: effectiveTemplateId }
    });

    const created = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(assessmentId);

    res.status(201).json({
      message: "Assessment session initialized.",
      isResumed: false,
      assessment: created,
      template: parsedTemplate,
      currentStep: 'knowledge'
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to initialize assessment: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/progress
 * Save draft candidate progress (answers, code, step).
 */
router.post('/:id/progress', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { currentStep, codingSubmission, debugSubmission, knowledgeAnswers, explanationText } = req.body;

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) return res.status(404).json({ error: "Assessment case not found." });

    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden: Candidate does not own this assessment." });
      }
    }

    db.prepare(`
      UPDATE assessment_cases
      SET current_step = COALESCE(?, current_step),
          coding_submission_json = COALESCE(?, coding_submission_json),
          debug_submission_json = COALESCE(?, debug_submission_json),
          knowledge_submission_json = COALESCE(?, knowledge_submission_json),
          explanation_text = COALESCE(?, explanation_text),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      currentStep || null,
      codingSubmission ? JSON.stringify(codingSubmission) : null,
      debugSubmission ? JSON.stringify(debugSubmission) : null,
      knowledgeAnswers ? JSON.stringify(knowledgeAnswers) : null,
      explanationText || null,
      id
    );

    res.json({ message: "Progress saved.", assessmentId: id, currentStep });
  } catch (err) {
    res.status(500).json({ error: "Failed to save progress: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/submit-knowledge
 * Evaluates candidate knowledge answers server-side.
 */
router.post('/:id/submit-knowledge', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) return res.status(404).json({ error: "Assessment case not found." });

    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden." });
      }
    }

    const evaluation = evaluateKnowledgeAnswers(answers || {});

    db.prepare(`
      UPDATE assessment_cases
      SET knowledge_submission_json = ?,
          current_step = 'coding',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify({ answers: answers || {}, evaluation }), id);

    res.json({
      message: "Knowledge questions evaluated.",
      evaluation,
      nextStep: 'coding'
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to evaluate knowledge answers: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/run-code-tests
 * Runs deterministic tests on practical code without updating final state.
 */
router.post('/:id/run-code-tests', authenticateToken, (req, res) => {
  try {
    const { javascript, html, css } = req.body;
    const testResults = evaluatePracticalCodingTask({ javascript, html, css });
    res.json(testResults);
  } catch (err) {
    res.status(500).json({ error: "Failed to execute tests: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/submit-code
 * Evaluates and commits practical coding task submission.
 */
router.post('/:id/submit-code', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { javascript, html, css } = req.body;

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) return res.status(404).json({ error: "Assessment not found." });

    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden." });
      }
    }

    const testResults = evaluatePracticalCodingTask({ javascript, html, css });

    db.prepare(`
      UPDATE assessment_cases
      SET coding_submission_json = ?,
          current_step = 'debugging',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify({ code: { javascript, html, css }, testResults }), id);

    res.json({
      message: "Practical coding task submitted.",
      testResults,
      nextStep: 'debugging'
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit coding task: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/submit-debug
 * Evaluates and commits debugging task submission.
 */
router.post('/:id/submit-debug', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { javascript } = req.body;

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) return res.status(404).json({ error: "Assessment not found." });

    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden." });
      }
    }

    const testResults = evaluateDebuggingTask(javascript || '');

    db.prepare(`
      UPDATE assessment_cases
      SET debug_submission_json = ?,
          current_step = 'evidence',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify({ code: javascript, testResults }), id);

    res.json({
      message: "Debugging task submitted.",
      testResults,
      nextStep: 'evidence'
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit debugging task: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/submit-hybrid
 * Finalize hybrid assessment submission with explanation and optional multimodal evidence.
 */
router.post('/:id/submit-hybrid', authenticateToken, upload.fields([
  { name: 'practicalImage', maxCount: 1 },
  { name: 'audioViva', maxCount: 1 },
  { name: 'codeArtifact', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { explanationText, antiFraudAudit } = req.body;

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) return res.status(404).json({ error: "Assessment not found." });

    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden." });
      }
    }

    const practicalImage = req.files && req.files['practicalImage'] ? req.files['practicalImage'][0] : null;
    const audioViva = req.files && req.files['audioViva'] ? req.files['audioViva'][0] : null;

    // Load previously recorded component evaluations
    const knowledgeData = assessment.knowledge_submission_json ? JSON.parse(assessment.knowledge_submission_json) : null;
    const codingData = assessment.coding_submission_json ? JSON.parse(assessment.coding_submission_json) : null;
    const debugData = assessment.debug_submission_json ? JSON.parse(assessment.debug_submission_json) : null;

    const explanationEvaluation = evaluateTechnicalExplanation(explanationText || assessment.explanation_text || '');

    // Compute comprehensive unified rubric
    const rubric = computeComprehensiveRubricScore({
      knowledgeEvaluation: knowledgeData?.evaluation,
      codingEvaluation: codingData?.testResults,
      debugEvaluation: debugData?.testResults,
      explanationEvaluation
    });

    const tx = db.transaction(() => {
      // 1. Update Assessment Case
      db.prepare(`
        UPDATE assessment_cases
        SET status = 'assessor_review_required',
            current_step = 'completed',
            explanation_text = COALESCE(?, explanation_text),
            overall_score = ?,
            recommendation = ?,
            rubric_scores_json = ?,
            test_results_json = ?,
            anti_fraud_audit_json = COALESCE(?, anti_fraud_audit_json),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        explanationText || null,
        rubric.overallScore,
        rubric.statusRecommendation,
        JSON.stringify(rubric),
        JSON.stringify(rubric.automatedTestsSummary),
        antiFraudAudit ? (typeof antiFraudAudit === 'string' ? antiFraudAudit : JSON.stringify(antiFraudAudit)) : null,
        id
      );

      // 2. Insert Evidence Records if files attached
      if (practicalImage) {
        const imgBuffer = fs.readFileSync(practicalImage.path);
        const imgHash = crypto.createHash('sha256').update(imgBuffer).digest('hex');
        db.prepare(`
          INSERT INTO evidence_records (
            id, assessment_id, candidate_id, evidence_type, file_path,
            original_filename, mime_type, file_size, sha256_hash
          ) VALUES (?, ?, ?, 'image', ?, ?, ?, ?, ?)
        `).run(
          `ev-img-${Date.now()}-${uuidv4().slice(0, 6)}`,
          id,
          assessment.candidate_id,
          `/uploads/${path.basename(practicalImage.path)}`,
          practicalImage.originalname,
          practicalImage.mimetype,
          practicalImage.size,
          imgHash
        );
      }

      if (audioViva) {
        const audioBuffer = fs.readFileSync(audioViva.path);
        const audioHash = crypto.createHash('sha256').update(audioBuffer).digest('hex');
        db.prepare(`
          INSERT INTO evidence_records (
            id, assessment_id, candidate_id, evidence_type, file_path,
            original_filename, mime_type, file_size, sha256_hash
          ) VALUES (?, ?, ?, 'audio', ?, ?, ?, ?, ?)
        `).run(
          `ev-aud-${Date.now()}-${uuidv4().slice(0, 6)}`,
          id,
          assessment.candidate_id,
          `/uploads/${path.basename(audioViva.path)}`,
          audioViva.originalname,
          audioViva.mimetype,
          audioViva.size,
          audioHash
        );
      }

      // 3. Populate granular competency criteria
      const insertComp = db.prepare(`
        INSERT OR REPLACE INTO competency_assessments (
          id, assessment_id, nos_code, pc_code, criteria_text,
          evidence_status, ai_score, ai_suggestion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const comp of rubric.rubricBreakdown) {
        const dbEvidenceStatus = comp.percentage >= 70 
          ? 'assessor_review_required' 
          : (comp.percentage >= 40 ? 'partially_supported' : 'requires_practical_test');

        insertComp.run(
          `pc-${id}-${comp.nosCode}`,
          id,
          comp.nosCode,
          'PC-CORE',
          comp.title,
          dbEvidenceStatus,
          comp.awardedScore,
          `Automated evaluation awarded ${comp.awardedScore}/${comp.maxScore} (${comp.percentage}%). Requires human assessor verification.`
        );
      }
    });

    tx();

    logAuditEvent({
      entityType: 'assessment',
      entityId: id,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'HYBRID_ASSESSMENT_SUBMITTED',
      details: { overallScore: rubric.overallScore, verificationStatus: rubric.verificationStatus }
    });

    const updated = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);

    res.json({
      message: "Hybrid assessment submitted successfully for human assessor review.",
      assessment: updated,
      rubric
    });
  } catch (err) {
    console.error('[Submit Hybrid Error]:', err);
    res.status(500).json({ error: "Failed to finalize hybrid assessment: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/request-evidence
 * Assessor requests additional evidence or clarification.
 */
router.post('/:id/request-evidence', authenticateToken, requireRole(['assessor', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { requestDetails } = req.body;

    if (!requestDetails || requestDetails.trim().length < 5) {
      return res.status(400).json({ error: "requestDetails must specify what evidence is requested (min 5 chars)." });
    }

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) return res.status(404).json({ error: "Assessment case not found." });

    const requests = assessment.evidence_requests_json ? JSON.parse(assessment.evidence_requests_json) : [];
    requests.push({
      assessorId: req.user.id,
      assessorName: req.user.name || 'Assessor',
      details: requestDetails.trim(),
      requestedAt: new Date().toISOString()
    });

    db.prepare(`
      UPDATE assessment_cases
      SET status = 'returned_for_evidence',
          evidence_requests_json = ?,
          assessor_notes = COALESCE(?, assessor_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(requests), requestDetails.trim(), id);

    logAuditEvent({
      entityType: 'assessment',
      entityId: id,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'EVIDENCE_REQUESTED_BY_ASSESSOR',
      details: { requestDetails }
    });

    res.json({ message: "Evidence request sent to candidate.", status: 'returned_for_evidence' });
  } catch (err) {
    res.status(500).json({ error: "Failed to request evidence: " + err.message });
  }
});

/**
 * POST /api/assessments/:id/retest
 * Assessor orders a retest on practical coding tasks.
 */
router.post('/:id/retest', authenticateToken, requireRole(['assessor', 'admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ error: "A valid reason for retest is required (min 5 chars)." });
    }

    const assessment = db.prepare('SELECT * FROM assessment_cases WHERE id = ?').get(id);
    if (!assessment) return res.status(404).json({ error: "Assessment case not found." });

    db.prepare(`
      UPDATE assessment_cases
      SET status = 'requires_practical_test',
          current_step = 'coding',
          assessor_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(`Retest ordered: ${reason.trim()}`, id);

    logAuditEvent({
      entityType: 'assessment',
      entityId: id,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'RETEST_ORDERED_BY_ASSESSOR',
      details: { reason }
    });

    res.json({ message: "Retest ordered for candidate.", status: 'requires_practical_test', currentStep: 'coding' });
  } catch (err) {
    res.status(500).json({ error: "Failed to order retest: " + err.message });
  }
});

module.exports = router;

