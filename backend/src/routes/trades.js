const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

function getStandardsPath() {
  const localPath = path.join(__dirname, '..', '..', 'data', 'nsqf_standards.json');
  if (fs.existsSync(localPath)) return localPath;
  return path.join(__dirname, '..', '..', '..', 'data', 'nsqf_standards.json');
}

// Get all trades
router.get('/', (req, res) => {
  try {
    const standardsPath = getStandardsPath();
    if (!fs.existsSync(standardsPath)) {
      return res.status(404).json({ error: "NSQF standards data file not found" });
    }
    const data = JSON.parse(fs.readFileSync(standardsPath, 'utf-8'));
    res.json(data.trades || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load NSQF trades: " + err.message });
  }
});

// Get trade by ID
router.get('/:id', (req, res) => {
  try {
    const standardsPath = getStandardsPath();
    if (!fs.existsSync(standardsPath)) {
      return res.status(404).json({ error: "NSQF standards data file not found" });
    }
    const data = JSON.parse(fs.readFileSync(standardsPath, 'utf-8'));
    const trade = (data.trades || []).find(t => t.id === req.params.id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: "Failed to load trade: " + err.message });
  }
});

module.exports = router;
