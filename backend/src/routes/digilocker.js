const express = require('express');
const router = express.Router();
const { pushCertificateToDigiLocker } = require('../services/digilockerService');
const { db } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

// Push Certificate directly to candidate's DigiLocker wallet (Pilot Simulation)
// Protected: Object-level authorization enforced
router.post('/push/:assessmentId', authenticateToken, async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const assessment = db.prepare('SELECT candidate_id, assigned_assessor_id, center_id FROM assessment_cases WHERE id = ?').get(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: `Assessment case '${assessmentId}' not found.` });
    }

    if (req.user.role === 'candidate') {
      const profile = db.prepare('SELECT id FROM candidate_profiles WHERE user_id = ? OR id = ?').get(req.user.id, req.user.id);
      if (!profile || profile.id !== assessment.candidate_id) {
        return res.status(403).json({ error: "Access forbidden: Candidates can only push their own assessment credentials." });
      }
    } else if (req.user.role === 'assessor') {
      if (assessment.assigned_assessor_id !== req.user.id) {
        return res.status(403).json({ error: "Access forbidden: Assessor is not assigned to this candidate assessment." });
      }
    } else if (req.user.role === 'center_manager') {
      if (assessment.center_id !== req.user.center_id) {
        return res.status(403).json({ error: "Access forbidden: Assessment does not belong to your center." });
      }
    }

    const result = await pushCertificateToDigiLocker(assessmentId);
    res.json({
      success: true,
      message: "Certificate generated and staged for DigiLocker wallet sync (Pilot Mode).",
      uri: result.docUri,
      docUri: result.docUri,
      xmlPayload: result.xmlContent,
      xmlContent: result.xmlContent,
      digiLockerRecord: result
    });
  } catch (err) {
    console.error("DigiLocker Push Error:", err);
    res.status(500).json({ error: "DigiLocker push failed: " + err.message });
  }
});

// DigiLocker Verification Pull Endpoint (Called by DigiLocker National Gateway)
router.get('/pull-uri/:uri', (req, res) => {
  try {
    const { uri } = req.params;
    res.status(200).json({
      status: "URI_VALIDATED",
      uri,
      service: "Kaushal AI DigiLocker Gateway Mock",
      note: "Live gateway requires whitelisted IP and NeGD mutual TLS certificates."
    });
  } catch (err) {
    res.status(500).json({ error: "DigiLocker pull failed: " + err.message });
  }
});

module.exports = router;
