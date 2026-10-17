const express = require('express');
const router = express.Router();
const { pushCertificateToDigiLocker } = require('../services/digilockerService');
const { db } = require('../data/database');
const { optionalAuth } = require('../middleware/auth');

// Push Certificate directly to candidate's DigiLocker wallet (Pilot Simulation)
router.post('/push/:assessmentId', optionalAuth, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const result = await pushCertificateToDigiLocker(assessmentId);
    res.json({
      success: true,
      message: "Certificate generated and staged for DigiLocker wallet sync (Pilot Mode).",
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
