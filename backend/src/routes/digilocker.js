const express = require('express');
const router = express.Router();
const { pushCertificateToDigiLocker } = require('../services/digilockerService');
const { readDb } = require('../data/db');

// Push Certificate directly to candidate's DigiLocker wallet
router.post('/push/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const result = await pushCertificateToDigiLocker(assessmentId);
    res.json({
      success: true,
      message: "Certificate successfully pushed to candidate DigiLocker wallet.",
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
    const db = readDb();
    const assessment = (db.assessments || []).find(
      a => a.digiLockerRecord && a.digiLockerRecord.docUri === uri
    );

    if (!assessment) {
      return res.status(404).json({ error: "Certificate document not found in issuer repository." });
    }

    res.set('Content-Type', 'application/xml');
    res.send(assessment.digiLockerRecord.xmlContent);
  } catch (err) {
    res.status(500).json({ error: "DigiLocker pull failed: " + err.message });
  }
});

// Check DigiLocker sync status
router.get('/status/:assessmentId', (req, res) => {
  const { assessmentId } = req.params;
  const db = readDb();
  const assessment = (db.assessments || []).find(a => a.id === assessmentId);

  if (!assessment) {
    return res.status(404).json({ error: "Assessment not found" });
  }

  res.json({
    assessmentId,
    digiLockerSynced: Boolean(assessment.digiLockerSynced),
    record: assessment.digiLockerRecord || null
  });
});

module.exports = router;
