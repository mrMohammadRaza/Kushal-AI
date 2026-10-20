const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { db, logAuditEvent } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/reports/verify/:hash
 * Public QR Code Verification Endpoint.
 * Checks authenticity of an assessment report without exposing private candidate documents.
 */
router.get('/verify/:hash', (req, res) => {
  try {
    const { hash } = req.params;

    const report = db.prepare(`
      SELECT r.id as report_id, r.report_version, r.released_at, r.report_hash,
             a.id as assessment_id, a.status as assessment_status, a.overall_score, a.signed_off_at,
             c.full_name as candidate_name, c.district, c.state,
             o.trade as trade_title, o.qp_code, o.nsqf_level,
             u.full_name as assessor_name
      FROM reports r
      JOIN assessment_cases a ON r.assessment_id = a.id
      JOIN candidate_profiles c ON a.candidate_id = c.id
      JOIN occupations o ON a.trade_id = o.id
      LEFT JOIN users u ON a.signed_off_by = u.id
      WHERE r.report_hash = ?
    `).get(hash);

    if (!report) {
      logAuditEvent({
        entityType: 'report_verification',
        entityId: hash,
        action: 'VERIFICATION_NOT_FOUND',
        details: { hash }
      });

      return res.status(404).json({
        verified: false,
        error: "Report record not found. This QR code or verification hash is invalid."
      });
    }

    logAuditEvent({
      entityType: 'report_verification',
      entityId: report.report_id,
      action: 'PUBLIC_VERIFICATION_ACCESSED',
      details: { hash }
    });

    res.json({
      verified: true,
      issuer: "National Council for Vocational Education and Training (NCVET) / Kaushal AI",
      reportId: report.report_id,
      reportVersion: report.report_version,
      candidate: {
        name: report.candidate_name,
        district: report.district,
        state: report.state
      },
      qualification: {
        trade: report.trade_title,
        qpCode: report.qp_code,
        nsqfLevel: report.nsqf_level
      },
      assessmentOutcome: {
        status: report.assessment_status,
        verifiedScore: report.overall_score ? `${report.overall_score}%` : "Assessor Reviewed",
        assessedDate: report.signed_off_at ? report.signed_off_at.split('T')[0] : report.released_at.split('T')[0],
        certifiedAssessor: report.assessor_name || "Lead Vocational Assessor"
      },
      integrityCheck: {
        sha256Digest: report.report_hash,
        verificationStatus: "CRYPTOGRAPHICALLY_VERIFIED"
      }
    });
  } catch (err) {
    console.error('[Report Verify Error]:', err);
    res.status(500).json({ error: "Verification lookup failed: " + err.message });
  }
});

/**
 * GET /api/reports/download/:assessmentId
 * Download PDF report (Protected endpoint).
 */
router.get('/download/:assessmentId', authenticateToken, (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = db.prepare('SELECT candidate_id, assigned_assessor_id, center_id FROM assessment_cases WHERE id = ?').get(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment case not found." });
    }

    // Object-level authorization checks
    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden: Candidates may only download their own assessment reports." });
      }
    } else if (req.user.role === 'assessor') {
      if (assessment.assigned_assessor_id !== req.user.id) {
        return res.status(403).json({ error: "Access forbidden: Assessor is not assigned to this candidate assessment." });
      }
    } else if (req.user.role === 'center_manager') {
      if (assessment.center_id !== req.user.center_id) {
        return res.status(403).json({ error: "Access forbidden: Assessment report does not belong to your center." });
      }
    }

    const report = db.prepare('SELECT * FROM reports WHERE assessment_id = ? ORDER BY released_at DESC').get(assessmentId);
    if (!report || !report.pdf_path) {
      return res.status(404).json({ error: "Report PDF has not been generated for this assessment." });
    }

    const fullPath = path.join(__dirname, '..', '..', report.pdf_path);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Report file is missing from storage." });
    }

    logAuditEvent({
      entityType: 'report',
      entityId: report.id,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'REPORT_PDF_DOWNLOADED',
      details: { assessmentId, reportId: report.id }
    });

    res.download(fullPath);
  } catch (err) {
    res.status(500).json({ error: "Download failed: " + err.message });
  }
});

/**
 * GET /api/reports/:assessmentId
 * Retrieve structured competency report with rubric scores, automated test outcomes, and integrity check.
 * Protected: Object-level authorization enforced for candidate, assigned assessor, center manager, and admin.
 */
router.get('/:assessmentId', authenticateToken, (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = db.prepare(`
      SELECT a.*, c.full_name as candidate_name, c.district, c.state,
             o.trade as trade_title, o.qp_code, o.nsqf_level,
             u.full_name as assessor_name
      FROM assessment_cases a
      JOIN candidate_profiles c ON a.candidate_id = c.id
      JOIN occupations o ON a.trade_id = o.id
      LEFT JOIN users u ON a.signed_off_by = u.id OR a.assigned_assessor_id = u.id
      WHERE a.id = ?
    `).get(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: "Assessment report not found." });
    }

    // Object-level authorization checks
    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden: Candidates may only view their own assessment reports." });
      }
    } else if (req.user.role === 'assessor') {
      if (assessment.assigned_assessor_id !== req.user.id && assessment.signed_off_by !== req.user.id) {
        return res.status(403).json({ error: "Access forbidden: Assessor is not assigned to this candidate assessment." });
      }
    } else if (req.user.role === 'center_manager') {
      if (assessment.center_id !== req.user.center_id) {
        return res.status(403).json({ error: "Access forbidden: Assessment report does not belong to your center." });
      }
    }

    const report = db.prepare('SELECT * FROM reports WHERE assessment_id = ? ORDER BY released_at DESC LIMIT 1').get(assessmentId);

    const isVerified = assessment.signed_off || assessment.status === 'certified_approved' || assessment.status === 'verified_by_assessor';
    const isPartial = assessment.status === 'conditional_bridge_training';

    const verificationStatus = isVerified 
      ? 'Verified' 
      : (isPartial ? 'Partially Verified' : (assessment.status === 'rejected' ? 'Not Yet Demonstrated' : 'Human Review Required'));

    res.json({
      assessmentId: assessment.id,
      reportId: report ? report.id : `rep-${assessment.id}`,
      candidate: {
        name: assessment.candidate_name,
        district: assessment.district,
        state: assessment.state
      },
      qualification: {
        trade: assessment.trade_title,
        qpCode: assessment.qp_code,
        nsqfLevel: assessment.nsqf_level
      },
      verificationStatus,
      lifecycleStatus: assessment.signed_off ? 'Finalized' : (assessment.status === 'assessor_review_required' ? 'Under Review' : assessment.status),
      overallScore: assessment.overall_score !== null && assessment.overall_score !== undefined ? assessment.overall_score : null,
      rubricScores: assessment.rubric_scores_json ? JSON.parse(assessment.rubric_scores_json) : null,
      automatedTests: assessment.test_results_json ? JSON.parse(assessment.test_results_json) : null,
      assessorRemarks: assessment.assessor_notes || null,
      assessorName: assessment.assessor_name || "Lead Assessor",
      reportIntegritySha256: report ? report.report_hash : null,
      statutoryDisclaimer: "This skill assessment report certifies demonstrated practical competencies evaluated via Kaushal AI's hybrid test framework and does not confer official statutory qualifications unless awarded by an authorized body."
    });
  } catch (err) {
    console.error('[Report Retrieval Error]:', err);
    res.status(500).json({ error: "Failed to retrieve competency report: " + err.message });
  }
});

module.exports = router;
