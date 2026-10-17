const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db, logAuditEvent } = require('../data/database');
const { authenticateToken, generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Secure authentication with bcrypt verification and JWT generation.
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      logAuditEvent({
        entityType: 'auth',
        entityId: user.id,
        userId: user.id,
        userRole: user.role,
        action: 'FAILED_LOGIN_ATTEMPT',
        details: { email },
        ipAddress: req.ip
      });
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = generateToken(user);

    // If candidate, fetch their candidate profile
    let candidateProfile = null;
    if (user.role === 'candidate') {
      candidateProfile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(user.id);
    }

    logAuditEvent({
      entityType: 'auth',
      entityId: user.id,
      userId: user.id,
      userRole: user.role,
      action: 'LOGIN_SUCCESS',
      details: { email, role: user.role },
      ipAddress: req.ip
    });

    res.json({
      message: "Authentication successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        center_id: user.center_id,
        phone: user.phone
      },
      candidateProfile
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: "Authentication failed: " + err.message });
  }
});

/**
 * POST /api/auth/register
 * Candidate registration with RPL profile creation.
 */
router.post('/register', (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      tradeId,
      experienceYears,
      employmentType,
      workLocation,
      educationLevel,
      primaryLanguage
    } = req.body;

    if (!email || !password || !fullName || !tradeId) {
      return res.status(400).json({ error: "Email, password, fullName, and tradeId are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Verify trade exists
    const trade = db.prepare('SELECT id FROM occupations WHERE id = ?').get(tradeId);
    if (!trade) {
      return res.status(400).json({ error: `Selected trade '${tradeId}' does not exist in occupational standards.` });
    }

    const userId = `user-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const candidateId = `cand-${Date.now().toString().slice(-6)}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    const tx = db.transaction(() => {
      // 1. Create User
      db.prepare(`
        INSERT INTO users (id, email, password_hash, full_name, role, center_id, phone)
        VALUES (?, ?, ?, ?, 'candidate', 'center-01', ?)
      `).run(userId, cleanEmail, passwordHash, fullName, phone || '+91 90000 00000');

      // 2. Create Candidate Profile
      db.prepare(`
        INSERT INTO candidate_profiles (
          id, user_id, full_name, phone, trade_id, informal_experience_years,
          education_level, current_occupation, primary_language, enrolled_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now'))
      `).run(
        candidateId,
        userId,
        fullName,
        phone || '+91 90000 00000',
        tradeId,
        Number(experienceYears) || 3,
        educationLevel || 'Class 8 Pass',
        employmentType || 'Informal Worker',
        primaryLanguage || 'hi'
      );
    });

    tx();

    const newUser = db.prepare('SELECT id, email, full_name, role, center_id FROM users WHERE id = ?').get(userId);
    const newProfile = db.prepare('SELECT * FROM candidate_profiles WHERE id = ?').get(candidateId);
    const token = generateToken(newUser);

    logAuditEvent({
      entityType: 'auth',
      entityId: userId,
      userId,
      userRole: 'candidate',
      action: 'CANDIDATE_REGISTRATION',
      details: { email: cleanEmail, tradeId, candidateId },
      ipAddress: req.ip
    });

    res.status(201).json({
      message: "Candidate registered successfully.",
      token,
      user: newUser,
      candidateProfile: newProfile
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user context.
 */
router.get('/me', authenticateToken, (req, res) => {
  let candidateProfile = null;
  if (req.user.role === 'candidate') {
    candidateProfile = db.prepare('SELECT * FROM candidate_profiles WHERE user_id = ?').get(req.user.id);
  }

  res.json({
    user: req.user,
    candidateProfile
  });
});

module.exports = router;
