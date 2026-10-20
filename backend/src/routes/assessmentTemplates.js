const express = require('express');
const router = express.Router();
const { db, logAuditEvent } = require('../data/database');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');
const { validateTemplateWeights, WEB_DEVELOPER_TEMPLATE } = require('../data/defaultTemplates');

/**
 * GET /api/assessment-templates
 * Retrieve all active assessment templates.
 */
router.get('/', optionalAuth, (req, res) => {
  try {
    const templates = db.prepare('SELECT * FROM assessment_templates WHERE active = 1 ORDER BY created_at DESC').all();
    
    res.json(templates.map(t => ({
      ...t,
      tradeId: t.trade_id,
      nsqfLevel: t.level || 5,
      totalWeight: 100,
      competencies: JSON.parse(t.competencies_json),
      knowledgeTasks: JSON.parse(t.knowledge_tasks_json),
      codingTask: JSON.parse(t.coding_task_json),
      debugTask: JSON.parse(t.debug_task_json),
      scoringRubric: JSON.parse(t.scoring_rubric_json),
      rules: t.rules_json ? JSON.parse(t.rules_json) : null
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve assessment templates: " + err.message });
  }
});

/**
 * GET /api/assessment-templates/:tradeId
 * Retrieve the active assessment template for a specific occupation.
 */
router.get('/:tradeId', optionalAuth, (req, res) => {
  try {
    const { tradeId } = req.params;
    let template = db.prepare('SELECT * FROM assessment_templates WHERE (trade_id = ? OR id = ?) AND active = 1 LIMIT 1').get(tradeId, tradeId);

    // Fallback lookup if tradeId is alias
    if (!template && (tradeId === 'web-developer' || tradeId === 'web-developer-l5')) {
      template = db.prepare('SELECT * FROM assessment_templates WHERE id = ?').get('tpl-web-developer-v1');
    }

    if (!template) {
      return res.status(404).json({ error: `No active assessment template found for trade '${tradeId}'.` });
    }

    res.json({
      ...template,
      tradeId: template.trade_id,
      nsqfLevel: template.level || 5,
      totalWeight: 100,
      competencies: JSON.parse(template.competencies_json),
      knowledgeTasks: JSON.parse(template.knowledge_tasks_json),
      codingTask: JSON.parse(template.coding_task_json),
      debugTask: JSON.parse(template.debug_task_json),
      scoringRubric: JSON.parse(template.scoring_rubric_json),
      rules: template.rules_json ? JSON.parse(template.rules_json) : null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve trade assessment template: " + err.message });
  }
});

/**
 * POST /api/assessment-templates
 * Create or update versioned assessment template.
 * Protected: Admin only.
 * Validates that competency weights total exactly 100%.
 */
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const {
      id,
      tradeId,
      title,
      version = '1.0.0',
      description,
      level = 5,
      competencies,
      knowledgeTasks,
      codingTask,
      debugTask,
      scoringRubric,
      rules
    } = req.body;

    if (!tradeId || !title || !competencies) {
      return res.status(400).json({ error: "tradeId, title, and competencies are required fields." });
    }

    // Validate that trade exists in occupations table
    const occupation = db.prepare('SELECT id FROM occupations WHERE id = ?').get(tradeId);
    if (!occupation) {
      return res.status(400).json({ error: `Trade '${tradeId}' does not exist in indexed occupations.` });
    }

    // Validate that competency weights sum exactly to 100%
    if (!validateTemplateWeights(competencies)) {
      const sum = Array.isArray(competencies) 
        ? competencies.reduce((acc, c) => acc + (Number(c.weight) || 0), 0)
        : 0;
      return res.status(400).json({ 
        error: `Validation Error: Competency weights must total exactly 100%. Received: ${sum}%.` 
      });
    }

    const templateId = id || `tpl-${tradeId}-v${version.replace(/\./g, '_')}`;

    db.prepare(`
      INSERT OR REPLACE INTO assessment_templates (
        id, trade_id, title, version, description, level,
        competencies_json, knowledge_tasks_json, coding_task_json, debug_task_json,
        scoring_rubric_json, rules_json, active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `).run(
      templateId,
      tradeId,
      title,
      version,
      description || '',
      level,
      JSON.stringify(competencies),
      JSON.stringify(knowledgeTasks || []),
      JSON.stringify(codingTask || {}),
      JSON.stringify(debugTask || {}),
      JSON.stringify(scoringRubric || {}),
      rules ? JSON.stringify(rules) : null
    );

    logAuditEvent({
      entityType: 'assessment_template',
      entityId: templateId,
      userId: req.user.id,
      userRole: req.user.role,
      action: 'ASSESSMENT_TEMPLATE_SAVED',
      details: { tradeId, version, totalWeights: 100 }
    });

    res.status(201).json({
      message: "Assessment template saved successfully.",
      templateId,
      tradeId,
      version,
      totalWeights: 100
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to save assessment template: " + err.message });
  }
});

module.exports = router;
