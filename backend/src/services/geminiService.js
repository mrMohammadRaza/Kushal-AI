const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest'
];

/**
 * Call Google Gemini REST API with multi-model fallback, retry, and timeout.
 */
async function callGemini({ contents, systemInstruction, jsonMode = true, temperature = 0.1, timeoutMs = 20000 }) {
  if (!GEMINI_API_KEY) return null;

  const body = {
    contents,
    generationConfig: {
      temperature,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {})
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  for (const model of PREFERRED_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else if (res.status === 503 || res.status === 429) {
          await new Promise(r => setTimeout(r, 1500));
          continue;
        } else {
          break; // Try next model
        }
      } catch (err) {
        break; // Try next model on network/timeout error
      }
    }
  }

  return null;
}

/**
 * Honest, evidence-grounded candidate evaluation using Gemini.
 * Strictly adheres to NSQF criteria and NEVER hallucinates evidence or passing scores.
 */
async function evaluateWithGemini({ trade, candidateId, vivaAnswer, imagePath, audioPath, assessorNotes, antiFraudAudit }) {
  const tradeTitle = trade.trade || trade.title || "Electrician";
  const nsqfLevel = trade.nsqfLevel || 3;
  const standardTools = trade.standardTools || [];
  const mandatoryPPE = trade.mandatoryPPE || [];
  const nosList = trade.nosList || [];

  const parts = [];
  let imageAttached = false;

  // 1. Check if real image evidence exists and attach
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      const ext = path.extname(imagePath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
      const fileBuffer = fs.readFileSync(imagePath);
      if (fileBuffer.length > 0) {
        parts.push({
          inlineData: {
            mimeType,
            data: fileBuffer.toString('base64')
          }
        });
        imageAttached = true;
      }
    } catch (err) {
      console.warn('[Gemini Service] Image read warning:', err.message);
    }
  }

  const vivaSubmitted = Boolean(vivaAnswer && vivaAnswer.trim().length > 0);

  const prompt = `
You are the AI Vocational Co-Pilot for India's Recognition of Prior Learning (RPL) under the National Skills Qualification Framework (NSQF).
Your role is to assist qualified human assessors by inspecting submitted candidate evidence against official standards.
IMPORTANT RULES:
1. Evaluate ONLY the submitted evidence.
2. If no photo is attached, state that practical image evidence is missing. Do NOT hallucinate tool detections or bounding boxes.
3. If no viva explanation is provided, state that verbal evidence is missing. Do NOT hallucinate transcripts.
4. Distinguish between:
   - "Observed Facts": What is visibly seen or spoken.
   - "Candidate Claims": What the candidate verbally states.
   - "AI Inferences": Your probabilistic reasoning.
   - "Missing Evidence": Criteria where no evidence was supplied.
   - "Recommended Next Steps": Specific questions or practical tests for the human assessor.
5. The AI does NOT issue certification. Your recommendation must be one of:
   - "assessor_review_required" (if sufficient evidence is present to recommend human review)
   - "insufficient_evidence" (if key items are missing)
   - "requires_practical_test" (if viva/image raises safety or execution doubts)

Target Trade: "${tradeTitle}" (NSQF Level ${nsqfLevel})
Candidate Viva Text Provided: ${vivaSubmitted ? JSON.stringify(vivaAnswer) : "NO VIVA EXPLANATION PROVIDED"}
Practical Photo Provided: ${imageAttached ? "YES, IMAGE ATTACHED" : "NO IMAGE ATTACHED"}
Mandatory Trade PPE: ${JSON.stringify(mandatoryPPE)}
Official Trade Tools: ${JSON.stringify(standardTools)}
Trade NOS & Criteria:
${JSON.stringify(nosList.map(n => ({ nosCode: n.nosCode, title: n.title, criteria: n.performanceCriteria || [] })))}

Return a strict JSON response conforming to this exact structure:
{
  "overallScore": integer or null (computed ONLY from submitted evidence; if no evidence, null),
  "status": "assessor_review_required" or "insufficient_evidence" or "requires_practical_test",
  "recommendation": "evidence-linked suggestion for the human assessor",
  "confidenceScore": float between 0.0 and 1.0 representing AI confidence in analysis,
  "evidencePresent": {
    "hasPracticalPhoto": ${imageAttached},
    "hasVivaExplanation": ${vivaSubmitted}
  },
  "visionAnalysis": {
    "imageAudited": ${imageAttached},
    "ppeCompliance": {
      "helmetDetected": boolean or null,
      "glovesDetected": boolean or null,
      "safetyShoesVerified": boolean or null,
      "ppeScore": integer (0 to 100),
      "remarks": "factual description of observed safety adherence"
    },
    "workmanshipQuality": {
      "toolHandling": "factual observation of tool grip or posture",
      "finishing": "factual observation of work output",
      "neatnessScore": integer (0 to 100)
    },
    "toolsIdentified": ["list of visibly verified tools"],
    "boundingBoxes": [
      {
        "label": "Name of visibly identified object",
        "box_2d": [ymin, xmin, ymax, xmax],
        "confidence": float,
        "pcCode": "relevant PC code or null"
      }
    ]
  },
  "vivaTranscript": {
    "transcript": ${vivaSubmitted ? JSON.stringify(vivaAnswer) : "null"},
    "transcriptEnglish": "English translation or clarification if regional text",
    "languageDetected": "detected language code (e.g., hi-IN, mr-IN, en-IN)",
    "technicalKeywordsFound": ["keywords present in candidate response"],
    "conceptClarityRating": "High" or "Moderate" or "Low" or "Not Assessed",
    "timestampCitations": []
  },
  "nosResults": [
    ${nosList.map(n => `{
      "nosCode": "${n.nosCode}",
      "title": "${n.title}",
      "weightage": ${n.weightage || 25},
      "score": integer (0 to 100),
      "status": "verified_by_assessor" or "partially_supported" or "insufficient_evidence" or "evidence_missing",
      "feedback": "rationale referencing evidence",
      "performanceCriteria": [
        ${(n.performanceCriteria || []).map(pc => `{
          "code": "${pc.split(':')[0]}",
          "description": ${JSON.stringify(pc)},
          "status": "partially_supported" or "evidence_missing" or "not_assessed",
          "score": integer (0 to 100),
          "evidence": "observed fact or missing evidence note"
        }`).join(',\n')}
      ]
    }`).join(',\n')}
  ],
  "strengths": ["genuine observed strengths"],
  "gapAreas": ["identified evidence gaps or procedural omissions"],
  "bridgeTrainingModules": ["recommended training modules mapped to gap areas"]
}
`;

  parts.push({ text: prompt });

  const rawJson = await callGemini({
    contents: [{ parts }],
    systemInstruction: "You are the objective, standards-aligned NCVET NSQF RPL AI Evaluation Co-Pilot. You do not certify; you audit evidence and prepare explainable recommendations for human assessors.",
    jsonMode: true
  });

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      return {
        source: 'google-gemini',
        tradeId: trade.id,
        tradeTitle,
        qpCode: trade.qpCode,
        nsqfLevel,
        candidateId,
        assessorSignOffRequired: true,
        antiFraudAudit: antiFraudAudit || null,
        ...parsed
      };
    } catch (e) {
      console.warn('[Gemini Service] JSON parse warning:', e.message);
    }
  }

  return null;
}

/**
 * Interactive Assessor Copilot Assistant (Standards & IS / BIS lookup)
 */
async function chatCopilot({ message, assessmentContext, trade }) {
  const systemInstruction = `You are Kaushal AI Assessor Assistant, an expert AI Co-Pilot for certified vocational assessors under the National Skills Qualification Framework (NSQF), MSDE, and NCVET. Always provide objective, standards-cited responses. If uncertain or if evidence is not provided, advise the assessor to conduct a direct practical demonstration.`;

  const contextStr = assessmentContext ? JSON.stringify(assessmentContext) : 'None';
  const tradeStr = trade ? (trade.trade || trade.title) : 'General Vocational Trade';

  const prompt = `Trade Context: ${tradeStr}
Assessment Context: ${contextStr}

Assessor Question:
"${message}"

Provide a professional, standards-compliant response citing relevant NSQF codes or Indian Standards (IS) where applicable:`;

  const reply = await callGemini({
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction,
    jsonMode: false
  });

  return reply || "Unable to consult Gemini AI at this moment. Please reference the official Qualification Pack standards document for this trade.";
}

module.exports = {
  callGemini,
  evaluateWithGemini,
  chatCopilot,
  GEMINI_API_KEY
};
