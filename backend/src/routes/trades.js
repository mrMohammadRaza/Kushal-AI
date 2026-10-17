const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { db } = require('../data/database');

function getStandardsPath() {
  const localPath = path.join(__dirname, '..', '..', 'data', 'nsqf_standards.json');
  if (fs.existsSync(localPath)) return localPath;
  return path.join(__dirname, '..', '..', '..', 'data', 'nsqf_standards.json');
}

// Get all indexed trades
router.get('/', (req, res) => {
  try {
    const standardsPath = getStandardsPath();
    if (fs.existsSync(standardsPath)) {
      const data = JSON.parse(fs.readFileSync(standardsPath, 'utf-8'));
      return res.json(data.trades || []);
    }

    const occupations = db.prepare('SELECT * FROM occupations WHERE active = 1').all();
    res.json(occupations);
  } catch (err) {
    res.status(500).json({ error: "Failed to load NSQF trades: " + err.message });
  }
});

// Get trade by ID
router.get('/:id', (req, res) => {
  try {
    const standardsPath = getStandardsPath();
    if (fs.existsSync(standardsPath)) {
      const data = JSON.parse(fs.readFileSync(standardsPath, 'utf-8'));
      const trade = (data.trades || []).find(t => t.id === req.params.id);
      if (trade) return res.json(trade);
    }

    const occ = db.prepare('SELECT * FROM occupations WHERE id = ?').get(req.params.id);
    if (!occ) {
      return res.status(404).json({ error: "Trade standard not found." });
    }

    const comps = db.prepare('SELECT * FROM standards_competencies WHERE trade_id = ?').all(occ.id);
    occ.nosList = comps.map(c => ({
      nosCode: c.nos_code,
      title: c.title,
      weightage: c.weightage,
      performanceCriteria: JSON.parse(c.performance_criteria_json),
      knowledgeCriteria: JSON.parse(c.knowledge_criteria_json)
    }));

    res.json(occ);
  } catch (err) {
    res.status(500).json({ error: "Failed to load trade: " + err.message });
  }
});

module.exports = router;
