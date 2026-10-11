const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('../data/db');

// List candidates
router.get('/', (req, res) => {
  const db = readDb();
  res.json(db.candidates || []);
});

// Get candidate by ID
router.get('/:id', (req, res) => {
  const db = readDb();
  const cand = (db.candidates || []).find(c => c.id === req.params.id);
  if (!cand) {
    return res.status(404).json({ error: "Candidate not found" });
  }
  res.json(cand);
});

// Register new informal candidate for RPL assessment
router.post('/', (req, res) => {
  const db = readDb();
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
    currentOccupation
  } = req.body;

  if (!name || !tradeId) {
    return res.status(400).json({ error: "Candidate name and tradeId are required" });
  }

  const newCandidate = {
    id: `cand-${Date.now().toString().slice(-4)}`,
    name,
    age: Number(age) || 30,
    gender: gender || "Male",
    phone: phone || "+91 90000 00000",
    aadhaarLast4: aadhaarLast4 || "0000",
    state: state || "Delhi",
    district: district || "New Delhi",
    tradeId,
    informalExperienceYears: Number(informalExperienceYears) || 3,
    educationLevel: educationLevel || "Middle School",
    currentOccupation: currentOccupation || "Informal Technician",
    profilePhoto: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
    enrolledDate: new Date().toISOString().split('T')[0]
  };

  db.candidates.push(newCandidate);
  writeDb(db);
  res.status(201).json(newCandidate);
});

module.exports = router;
