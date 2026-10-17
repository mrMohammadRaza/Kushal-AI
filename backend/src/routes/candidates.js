const express = require('express');
const router = express.Router();
const { db, logAuditEvent } = require('../data/database');
const { optionalAuth, authenticateToken, requireRole } = require('../middleware/auth');

// List candidates (Public / Demo or Authenticated)
router.get('/', optionalAuth, (req, res) => {
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

// Get candidate by ID
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const cand = db.prepare(`
      SELECT c.*, o.trade as trade_title, o.nsqf_level
      FROM candidate_profiles c
      LEFT JOIN occupations o ON c.trade_id = o.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!cand) {
      return res.status(404).json({ error: "Candidate not found." });
    }
    res.json(cand);
  } catch (err) {
    res.status(500).json({ error: "Failed to load candidate: " + err.message });
  }
});

// Register new informal candidate for RPL assessment
router.post('/', (req, res) => {
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
      action: 'CANDIDATE_PROFILE_CREATED',
      details: { name, tradeId }
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to register candidate: " + err.message });
  }
});

module.exports = router;
