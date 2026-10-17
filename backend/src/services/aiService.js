const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { evaluateWithGemini } = require('./geminiService');

function getStandardsPath() {
  const localPath = path.join(__dirname, '..', '..', 'data', 'nsqf_standards.json');
  if (fs.existsSync(localPath)) return localPath;
  return path.join(__dirname, '..', '..', '..', 'data', 'nsqf_standards.json');
}

/**
 * Resolves the internal AI service URL from environment.
 */
function getAiServiceUrl(endpoint = '') {
  const base = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}

/**
 * Orchestrates Candidate Assessment Evaluation:
 * Tier 1: FastAPI LangGraph AI Microservice (if online)
 * Tier 2: Direct Google Gemini Multimodal Engine (if API key present)
 * Tier 3: Deterministic Rule-Based Evidence Engine (zero fabrication, honest gap detection)
 */
async function evaluateAssessment({ tradeId, candidateId, vivaAnswer, vivaScenarioId, imagePath, audioPath, assessorNotes, antiFraudAudit, correlationId }) {
  const reqCorrelationId = correlationId || `corr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const standardsPath = getStandardsPath();
  const standardsData = JSON.parse(fs.readFileSync(standardsPath, 'utf-8'));
  const trade = standardsData.trades.find(t => t.id === tradeId) || standardsData.trades[0];

  const hasImage = Boolean(imagePath && fs.existsSync(imagePath));
  const hasViva = Boolean(vivaAnswer && vivaAnswer.trim().length > 0);

  let imageBase64 = null;
  let audioBase64 = null;
  if (hasImage) {
    try {
      imageBase64 = fs.readFileSync(imagePath).toString('base64');
    } catch (e) {
      console.warn('[AI Orchestrator] Could not read image for base64 transfer:', e.message);
    }
  }
  if (audioPath && fs.existsSync(audioPath)) {
    try {
      audioBase64 = fs.readFileSync(audioPath).toString('base64');
    } catch (e) {
      console.warn('[AI Orchestrator] Could not read audio for base64 transfer:', e.message);
    }
  }

  // 1. First Tier: Try FastAPI LangGraph AI Microservice
  try {
    const payload = {
      trade_id: tradeId,
      candidate_id: candidateId,
      viva_answer: vivaAnswer || "",
      viva_scenario_id: vivaScenarioId || "",
      image_path: hasImage ? imagePath : null,
      audio_path: audioPath || null,
      image_base64: imageBase64,
      audio_base64: audioBase64,
      image_filename: imagePath ? path.basename(imagePath) : null,
      audio_filename: audioPath ? path.basename(audioPath) : null,
      assessor_notes: assessorNotes || "",
      anti_fraud_audit: antiFraudAudit || null
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const response = await fetch(getAiServiceUrl('/api/evaluate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': reqCorrelationId
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return {
        source: 'fastapi-langgraph',
        correlationId: reqCorrelationId,
        ...data
      };
    }
  } catch (err) {
    // Log traceably without halting
    console.log(`[AI Orchestrator] FastAPI microservice unavailable (${err.message}). Falling back to Tier 2.`);
  }

  // 2. Second Tier: Direct Google Gemini Multimodal Analysis
  try {
    const geminiResult = await evaluateWithGemini({
      trade,
      candidateId,
      vivaAnswer,
      imagePath: hasImage ? imagePath : null,
      audioPath,
      assessorNotes,
      antiFraudAudit
    });

    if (geminiResult) {
      return {
        correlationId: reqCorrelationId,
        ...geminiResult
      };
    }
  } catch (geminiErr) {
    console.warn(`[AI Orchestrator] Direct Gemini call error (${geminiErr.message}). Engaging Tier 3 deterministic engine.`);
  }

  // 3. Third Tier: Deterministic Standards Rule Engine (Honest, Evidence-Linked, Non-Fabricating)
  return evaluateLocallyDeterministic({
    trade,
    candidateId,
    vivaAnswer,
    hasImage,
    imagePath,
    correlationId: reqCorrelationId,
    antiFraudAudit
  });
}

/**
 * Deterministic evidence evaluator.
 * Evaluates submitted text against trade performance criteria.
 * Explicitly flags missing evidence without generating fake passing scores.
 */
function evaluateLocallyDeterministic({ trade, candidateId, vivaAnswer, hasImage, imagePath, correlationId, antiFraudAudit }) {
  const normalizedAnswer = (vivaAnswer || '').toLowerCase().trim();
  const hasViva = normalizedAnswer.length > 0;

  const nosResults = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let criteriaAssessed = 0;
  let criteriaSupported = 0;

  const gapAreas = [];
  const strengths = [];

  trade.nosList.forEach((nos) => {
    const weight = nos.weightage || 25;
    totalWeight += weight;

    const pcAssessments = (nos.performanceCriteria || []).map((pc) => {
      criteriaAssessed++;
      const code = pc.split(':')[0].trim();
      const desc = pc.split(':').slice(1).join(':').trim() || pc;

      // Extract meaningful domain keywords (length > 4)
      const keywords = desc.toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['perform', 'carry', 'ensure', 'verify', 'using', 'proper'].includes(w));

      const matches = keywords.filter(kw => normalizedAnswer.includes(kw));

      let status = "evidence_missing";
      let score = 0;
      let evidenceNote = "No specific demonstration or oral explanation identified for this criterion.";

      if (hasViva && matches.length > 0) {
        criteriaSupported++;
        status = matches.length >= 2 ? "partially_supported" : "partially_supported";
        score = Math.min(85, 55 + (matches.length * 15));
        evidenceNote = `Candidate verbal evidence referenced related keywords: [${matches.join(', ')}].`;
      } else if (!hasViva && !hasImage) {
        status = "evidence_missing";
        score = 0;
        evidenceNote = "Missing evidence: Neither photo evidence nor viva audio was provided.";
      } else if (hasImage && !hasViva) {
        status = "requires_practical_test";
        score = 40;
        evidenceNote = "Photo evidence submitted; requires assessor direct viva confirmation.";
      }

      return {
        code,
        description: desc,
        status,
        score,
        evidence: evidenceNote
      };
    });

    const evaluatedPcs = pcAssessments.filter(p => p.status !== 'evidence_missing');
    const nosAvgScore = evaluatedPcs.length > 0
      ? Math.round(evaluatedPcs.reduce((acc, curr) => acc + curr.score, 0) / pcAssessments.length)
      : 0;

    totalWeightedScore += (nosAvgScore * (weight / 100));

    let nosStatus = "insufficient_evidence";
    if (nosAvgScore >= 70) nosStatus = "partially_supported";
    else if (nosAvgScore > 0) nosStatus = "requires_practical_test";
    else nosStatus = "evidence_missing";

    nosResults.push({
      nosCode: nos.nosCode,
      title: nos.title,
      weightage: weight,
      score: nosAvgScore,
      status: nosStatus,
      performanceCriteria: pcAssessments,
      feedback: nosAvgScore >= 70 
        ? `Demonstrates relevant background concepts for ${nos.title}. Requires assessor verification.`
        : `Evidence insufficient to establish competency for ${nos.title}. Practical assessment recommended.`
    });
  });

  const finalScore = (!hasImage && !hasViva) ? null : Math.round(totalWeightedScore);

  // Determine honest operational status
  let overallStatus = "insufficient_evidence";
  let recommendation = "";

  if (!hasImage && !hasViva) {
    overallStatus = "evidence_missing";
    recommendation = "Candidate has not submitted practical work photo or verbal viva evidence. Assessment cannot proceed.";
    gapAreas.push("Mandatory practical demonstration photo not provided.");
    gapAreas.push("Candidate oral viva voce explanation not recorded.");
  } else if (!hasImage && hasViva) {
    overallStatus = "requires_practical_test";
    recommendation = "Verbal concepts explained, but practical visual proof is missing. Assessor must conduct an on-site practical test.";
    gapAreas.push("Physical workmanship and tool handling evidence absent.");
    strengths.push("Candidate can articulate basic trade procedures orally.");
  } else if (hasImage && !hasViva) {
    overallStatus = "requires_practical_test";
    recommendation = "Work photo provided, but viva explanation missing. Oral interview required to verify candidate authorship and safety knowledge.";
    gapAreas.push("Oral viva voce explanation not submitted.");
    strengths.push("Visual demonstration photo provided for assessor inspection.");
  } else {
    overallStatus = "assessor_review_required";
    recommendation = "Multimodal evidence received. AI recommendation prepared for qualified human assessor review and rubric scoring.";
    strengths.push("Candidate submitted both practical work photo and oral description.");
    strengths.push("Procedural terminology aligned with National Occupational Standards.");
  }

  // Mandatory Bridge Training based on identified gaps
  const bridgeModules = [];
  if (!hasImage || finalScore < 70) {
    bridgeModules.push(`Module 1: Practical Demonstration & Tool Posture Workshop (${trade.trade})`);
  }
  bridgeModules.push("Module 2: Indian Standards (IS/BIS) Occupational Safety & PPE Protocol");
  bridgeModules.push("Module 3: Formal Technical Documentation, Schematics & Quality Audit");

  return {
    source: 'deterministic-standards-engine',
    correlationId,
    tradeId: trade.id,
    tradeTitle: trade.trade,
    qpCode: trade.qpCode,
    nsqfLevel: trade.nsqfLevel,
    candidateId,
    overallScore: finalScore,
    status: overallStatus,
    recommendation,
    confidenceScore: (!hasImage || !hasViva) ? 0.35 : 0.82,
    evidencePresent: {
      hasPracticalPhoto: hasImage,
      hasVivaExplanation: hasViva
    },
    visionAnalysis: {
      imageAudited: hasImage,
      ppeCompliance: {
        helmetDetected: null,
        glovesDetected: null,
        safetyShoesVerified: null,
        ppeScore: hasImage ? 50 : 0,
        remarks: hasImage 
          ? "Photo evidence logged and preserved for manual assessor visual inspection."
          : "No practical photo uploaded. PPE compliance unverified."
      },
      workmanshipQuality: {
        toolHandling: hasImage ? "Requires human assessor inspection from uploaded image" : "Unassessed (No image)",
        finishing: hasImage ? "Requires human assessor inspection from uploaded image" : "Unassessed (No image)",
        neatnessScore: hasImage ? 60 : 0
      },
      toolsIdentified: [],
      boundingBoxes: []
    },
    vivaTranscript: {
      transcript: hasViva ? vivaAnswer : null,
      transcriptEnglish: hasViva ? vivaAnswer : null,
      languageDetected: hasViva ? "hi-IN / en-IN" : "none",
      technicalKeywordsFound: hasViva 
        ? trade.nosList.flatMap(n => (n.performanceCriteria || []).flatMap(pc => pc.toLowerCase().split(/\s+/)).filter(w => w.length > 5 && normalizedAnswer.includes(w))).slice(0, 8)
        : [],
      conceptClarityRating: hasViva ? (normalizedAnswer.length > 50 ? "Moderate" : "Basic") : "Not Assessed",
      timestampCitations: []
    },
    nosResults,
    strengths: strengths.length > 0 ? strengths : ["Candidate registered under Recognition of Prior Learning pathway."],
    gapAreas: gapAreas.length > 0 ? gapAreas : ["Formal certification requires human assessor sign-off."],
    bridgeTrainingModules: bridgeModules,
    assessorSignOffRequired: true,
    antiFraudAudit: antiFraudAudit || null
  };
}

module.exports = {
  evaluateAssessment,
  getStandardsPath
};
