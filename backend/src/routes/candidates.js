const express = require('express');
const router = express.Router();
const { db, logAuditEvent } = require('../data/database');
const { optionalAuth, authenticateToken, requireRole } = require('../middleware/auth');

// List candidates (Authorized staff only)
router.get('/', authenticateToken, requireRole(['assessor', 'center_manager', 'admin', 'auditor']), (req, res) => {
  try {
    const candidates = db.prepare(`
      SELECT c.*, o.trade as trade_title, o.nsqf_level
      FROM candidate_profiles c
      LEFT JOIN occupations o ON c.trade_id = o.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: "Failed to load candidates: " + err.message });
  }
});

// Get candidate by ID with object-level authorization
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Candidates can only view their own profile
    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== id) {
        return res.status(403).json({ error: "Access forbidden: Candidates can only access their own profile." });
      }
    }

    const cand = db.prepare(`
      SELECT c.*, o.trade as trade_title, o.nsqf_level
      FROM candidate_profiles c
      LEFT JOIN occupations o ON c.trade_id = o.id
      WHERE c.id = ?
    `).get(id);

    if (!cand) {
      return res.status(404).json({ error: "Candidate not found." });
    }
    res.json(cand);
  } catch (err) {
    res.status(500).json({ error: "Failed to load candidate: " + err.message });
  }
});

// Register new informal candidate for RPL assessment (Authorized staff only)
router.post('/', authenticateToken, requireRole(['assessor', 'center_manager', 'admin']), (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      aadhaarLast4,
      state,
      district,
      tradeId,
      informalExperienceYears,
      educationLevel,
      currentOccupation,
      primaryLanguage
    } = req.body;

    if (!name || !tradeId) {
      return res.status(400).json({ error: "Candidate name and tradeId are required." });
    }

    const trade = db.prepare('SELECT id FROM occupations WHERE id = ?').get(tradeId);
    if (!trade) {
      return res.status(400).json({ error: `Trade '${tradeId}' is not an indexed occupational standard.` });
    }

    const candidateId = `cand-${Date.now().toString().slice(-4)}`;

    db.prepare(`
      INSERT INTO candidate_profiles (
        id, full_name, age, gender, phone, aadhaar_last4, state, district,
        trade_id, informal_experience_years, education_level, current_occupation,
        primary_language, profile_photo, enrolled_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now'))
    `).run(
      candidateId,
      name,
      Number(age) || 30,
      gender || 'Male',
      phone || '+91 90000 00000',
      aadhaarLast4 || '0000',
      state || 'Delhi',
      district || 'New Delhi',
      tradeId,
      Number(informalExperienceYears) || 3,
      educationLevel || 'Middle School',
      currentOccupation || 'Informal Technician',
      primaryLanguage || 'hi',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    );

    const created = db.prepare('SELECT * FROM candidate_profiles WHERE id = ?').get(candidateId);

    logAuditEvent({
      entityType: 'candidate',
      entityId: candidateId,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'CANDIDATE_PROFILE_CREATED',
      details: { name, tradeId }
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to register candidate: " + err.message });
  }
});

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const RESUMES_DIR = path.join(__dirname, '..', '..', 'uploads', 'resumes');
if (!fs.existsSync(RESUMES_DIR)) {
  fs.mkdirSync(RESUMES_DIR, { recursive: true });
}

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RESUMES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `resume-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid resume file format. Supported formats: PDF, DOCX, DOC.'));
    }
  }
});

/**
 * POST /api/candidates/upload-resume
 * Securely uploads and computes SHA-256 integrity hash for candidate resumes.
 */
router.post('/upload-resume', (req, res) => {
  resumeUpload.single('resumeFile')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Resume upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      res.status(201).json({
        message: 'Resume uploaded and integrity hash computed.',
        filePath: req.file.path,
        storedFilename: req.file.filename,
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        sha256Hash
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to process resume: ' + e.message });
    }
  });
});

/**
 * GET /api/candidates/:id/resume
 * Authenticated and authorized resume retrieval.
 */
router.get('/:id/resume', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Verify candidate ownership or staff authorization
    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== id) {
        return res.status(403).json({ error: "Access forbidden: Candidates can only access their own resume." });
      }
    } else if (req.user.role === 'assessor') {
      // Check if assessor is assigned to any assessment for this candidate
      const assigned = db.prepare(`
        SELECT id FROM assessment_cases 
        WHERE candidate_id = ? AND assigned_assessor_id = ?
      `).get(id, req.user.id);
      if (!assigned) {
        return res.status(403).json({ error: "Access forbidden: Assessor is not assigned to this candidate." });
      }
    } else if (req.user.role === 'center_manager') {
      // Check if candidate belongs to center manager's center
      const inCenter = db.prepare(`
        SELECT id FROM assessment_cases
        WHERE candidate_id = ? AND center_id = ?
      `).get(id, req.user.center_id || 'center-01');
      if (!inCenter) {
        return res.status(403).json({ error: "Access forbidden: Candidate does not have assessments in your center." });
      }
    }

    const candidate = db.prepare('SELECT resume_path, resume_filename FROM candidate_profiles WHERE id = ?').get(id);
    if (!candidate || !candidate.resume_path || !fs.existsSync(candidate.resume_path)) {
      return res.status(404).json({ error: 'Resume file not found for this candidate.' });
    }

    res.download(candidate.resume_path, candidate.resume_filename || 'Candidate_Resume.pdf');
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve resume: ' + err.message });
  }
});

module.exports = router;
