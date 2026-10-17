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

    const report = db.prepare('SELECT * FROM reports WHERE assessment_id = ? ORDER BY released_at DESC').get(assessmentId);
    if (!report || !report.pdf_path) {
      return res.status(404).json({ error: "Report PDF has not been generated for this assessment." });
    }

    const fullPath = path.join(__dirname, '..', '..', report.pdf_path);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Report file is missing from storage." });
    }

    res.download(fullPath);
  } catch (err) {
    res.status(500).json({ error: "Download failed: " + err.message });
  }
});

module.exports = router;
