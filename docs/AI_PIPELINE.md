# Kaushal AI — AI Pipeline & Standards RAG
**Recognition of Prior Learning (RPL) Evaluation Engine**

---

## 1. Principles of Explainable AI in Vocational RPL
1. **Never Hallucinate Evidence**: If a candidate does not submit an image, the vision auditor reports `imageAudited: false` and `boundingBoxes: []`.
2. **Never Fabricate Passing Scores**: Missing evidence immediately yields `evidence_missing` or `insufficient_evidence` with null or unassessed scores.
3. **Never Auto-Certify**: The AI produces diagnostic suggestions (`assessor_review_required`, `requires_practical_test`). Official certification requires human assessor sign-off.
4. **Traceable Grounding**: Every finding cites an exact National Occupational Standard (NOS) code and Performance Criterion (PC).

---

## 2. Pipeline Execution Stages

### Stage 1: Vernacular Viva Voce Speech Processing
- **Audio Capture**: Browser `MediaRecorder` captures candidate oral explanation in regional dialect (e.g., Hindi / Hinglish / Marathi).
- **Indic Terminology Normalization**:
  - Technical terms (e.g. आइसोलेटर -> isolator, मेगर -> Megger, अर्थिंग -> earthing) are normalized against the vocational glossary.
  - Candidate or assessor can inspect and correct the transcribed text prior to submission.
- **Provider Transparency**:
  - Live Bhashini ULCA API is called when credentials are configured.
  - When offline, transparently reports `liveProviderConnected: false` without inventing fake sentences.

### Stage 2: Multimodal Practical Vision Inspection
- **Media Ingestion**: High-resolution practical demonstration photos or sampled video frames.
- **PPE Safety Audit**: Evaluates adherence to mandatory safety gear for the trade (e.g., Class 0 1000V dielectric gloves, IS 15298 safety footwear, eye protection).
- **Tool Handling & Workmanship**: Inspects terminal crimping, conduit bending, wire stripping, and tool grip posture.
- **Explainable 2D Bounding Boxes**: Highlights detected tools or terminations with normalized coordinates `[ymin, xmin, ymax, xmax]` for human assessor verification.

### Stage 3: NSQF Standards RAG & Rubric Synthesis
- **Knowledge Base**: Indexed Qualification Packs (QPs) across 5 core vocational trades in `data/nsqf_standards.json`.
- **Criteria Mapping**: Candidate claims and observed facts are mapped to specific PC codes (e.g. `PC1.1`, `PC2.2`).
- **Gap Diagnosis**: Categorizes missing vs partially supported competencies and generates targeted bridge training module recommendations.

### Stage 4: Anti-Fraud Verification
- Audits client-provided liveness signals, challenge gestures, and optional geolocation timestamps.
- Treats fraud indicators as risk signals requiring investigation rather than automatic disqualification.
