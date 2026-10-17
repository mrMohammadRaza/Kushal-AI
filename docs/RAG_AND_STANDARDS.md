# Standards-Based RAG & Competency Mapping Specification
> **Kaushal AI (कौशल AI) — Recognition of Prior Learning (RPL) Platform**  
> **Problem Statement: SIH26242**  
> Aligned with National Skills Qualification Framework (NSQF) & National Occupational Standards (NOS)

---

## 1. Overview & Core Philosophy

In traditional AI grading applications, large language models generate arbitrary evaluation scores from internal training data, often hallucinating criteria or imposing non-standard requirements. In the context of India's **National Council for Vocational Education and Training (NCVET)** and **Ministry of Skill Development & Entrepreneurship (MSDE)**, vocational assessment must be strictly grounded in authorized **National Occupational Standards (NOS)**.

Kaushal AI implements a **Source-Grounded Retrieval-Augmented Generation (RAG)** architecture:
```
CANDIDATE EVIDENCE ➔ EXTRACT CLAIMS/OBSERVATIONS ➔ RETRIEVE RELEVANT NOS/PC CRITERIA ➔ MAP TO PERFORMANCE CRITERIA ➔ FLAG GAPS & UNCERTAINTIES ➔ HUMAN ASSESSOR VALIDATION
```

### Governing Non-Negotiable Rules
1. **Zero Hallucinated Criteria:** The AI service is strictly prohibited from inventing competency requirements or modifying passing criteria. Every evaluated criterion must cite an official NOS code and Performance Criteria (PC) number.
2. **Explicit Evidence Gaps:** If evidence does not demonstrate a required Performance Criterion, the system flags `evidence_missing` or `requires_practical_test` rather than assuming competence.
3. **Traceable Citations:** All AI recommendations link directly to:
   - Official Qualification Pack (QP) code (e.g., `ELE/Q1401`).
   - National Occupational Standard code (e.g., `NOS/ELE/N1401`).
   - Performance Criterion identifier (e.g., `PC1.1`, `PC1.2`).
   - Applicable Indian Standards (IS/BIS) where referenced (e.g., `IS 732`, `IS 3043`).

---

## 2. Indexed NSQF Trades & Source Registries

The current platform indexes five core vocational occupations across NSQF Levels 3 and 4, stored in relational SQLite (`standards_competencies` and `occupations` tables) and mirrored in [`backend/data/nsqf_standards.json`](file:///c:/Users/lenovo/OneDrive/Desktop/kaushal%20ai/backend/data/nsqf_standards.json):

| Trade ID | Sector | QP Code | NSQF Level | Standards Body | Key Performance Focus |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **`electrician-l3`** | Power & Electrical | `ELE/Q1401` | Level 3 | Power Sector Skill Council (PSSC) | Domestic wiring, conduit installation, distribution board assembly, earthing continuity (`IS 3043`), tool safety. |
| **`electrician-l4`** | Power & Electrical | `ELE/Q1402` | Level 4 | Power Sector Skill Council (PSSC) | Industrial 3-phase panels, Star-Delta motor starters, Megger insulation resistance testing (`IS 732`), fault diagnostics. |
| **`automotive-l4`** | Automotive | `ASC/Q1401` | Level 4 | Automotive Skills Development Council (ASDC) | Four-wheeler maintenance, hydraulic brake caliper bleeding, OBD-II diagnostic scanning, torque tightening specs. |
| **`plumbing-l3`** | Construction & Plumbing | `CON/Q0602` | Level 3 | Indian Plumbing Skills Council (IPSC) | CPVC/UPVC pipe jointing, sanitary fixture installation, hydrostatic pressure testing (5-7 bar), P-trap water seals. |
| **`solar-l4`** | Green Energy & Solar | `ELE/Q5901` | Level 4 | Skill Council for Green Jobs (SCGJ) | Rooftop solar module mounting alignment, MC4 crimping, string Voc/Isc measurement, fall-arrest harness safety. |

---

## 3. Data Schema & Representation

Competencies are decomposed into granular, evaluatable entities:

```
┌────────────────────────────────────────────────────────┐
│                      OCCUPATION                        │
│  - ID: electrician-l3                                  │
│  - Trade: Assistant Electrician                        │
│  - QP Code: ELE/Q1401 (NSQF Level 3)                   │
│  - Mandatory PPE: Insulated gloves, safety boots, ...  │
│  - Standard Tools: Multimeter, wire strippers, ...     │
└───────────────────────────┬────────────────────────────┘
                            │ 1 : N
                            ▼
┌────────────────────────────────────────────────────────┐
│             STANDARDS & COMPETENCIES (NOS)             │
│  - ID: comp-ele-1401                                   │
│  - NOS Code: ELE/N1401                                 │
│  - Title: Select and use electrical tools safely       │
│  - Weightage: 20%                                      │
└───────────────────────────┬────────────────────────────┘
                            │ 1 : N
                            ▼
┌────────────────────────────────────────────────────────┐
│             PERFORMANCE CRITERIA (PC)                  │
│  - PC1.1: Verify dielectric rating of insulated pliers │
│  - PC1.2: Check continuity using calibrated multimeter │
│  - PC1.3: Inspect cords and plugs for fraying/damage   │
└────────────────────────────────────────────────────────┘
```

---

## 4. Ingestion & Retrieval Pipeline

The RAG engine supports a 3-tier retrieval mechanism:

### Tier 1: FastAPI LangGraph Semantic RAG Node
* **Document Extraction:** Qualification pack documents are parsed into structured chunks containing the NOS code, criterion description, and associated knowledge criteria.
* **Semantic Filter:** Filters candidates' spoken or written explanation against candidate trade's exact NOS subset to avoid cross-trade confusion.
* **Vector Matcher:** Compares normalized embeddings using cosine similarity to rank the top-k relevant criteria.

### Tier 2: Gemini Multimodal Standards Grounding
* When Tier 1 LangGraph delegates to Gemini, the prompt passes the complete trade JSON schema:
  - `standardTools`: List of official tools for this QP.
  - `mandatoryPPE`: Regulatory personal protective equipment.
  - `nosList`: Full list of NOS modules with granular PC codes.
* The model is instructed:
  `"Evaluate ONLY the submitted evidence against these exact PC criteria. If evidence is absent, output 'evidence_missing' with score: 0. Do NOT invent criteria or scores."`

### Tier 3: Deterministic Standards Rule Engine (Offline Failover)
* When internet or cloud AI is unavailable, the local engine executes deterministic domain keyword tokenization:
  - Extracts action verbs and technical keywords (e.g., `multimeter`, `earthing`, `continuity`, `isolator`, `cpvc`).
  - Matches candidate statements against indexed Performance Criteria.
  - Computes weighted score strictly from verified matches.
  - Unmatched criteria receive explicit `evidence_missing` tags.

---

## 5. Traceability & Assessor Citations

When an assessor opens an assessment in [ExplainableAssessorDashboard.jsx](file:///c:/Users/lenovo/OneDrive/Desktop/kaushal%20ai/frontend/src/components/ExplainableAssessorDashboard.jsx), every competency finding displays:
1. **Source Citation:** Exact NOS Code (e.g., `ELE/N1401`) and standard title.
2. **Performance Criteria List:** All underlying criteria with individual status badges (`verified_by_assessor`, `partially_supported`, `evidence_missing`, `requires_practical_test`).
3. **Evidence Link:** Specific quote from candidate transcript or image observation supporting the suggestion.
4. **Assessor Override Controls:** Certified human assessors can adjust scores from 0% to 100% and record an explicit reason (e.g., *"Candidate orally demonstrated knowledge of Star-Delta starter, but practical wiring neatness was substandard"*).

---

## 6. Standards Versioning & Governance

To maintain regulatory compliance across updates to the National Skills Qualification Framework:
* Each occupation record contains a `version` attribute (e.g., `v1.0`, `v2.1`).
* Assessment cases record the exact standards version active at the time of evidence submission.
* If NCVET publishes an updated Qualification Pack:
  - The new standards are indexed under an incremental version identifier.
  - Existing completed and signed-off assessments remain immutable and bound to their historical standards version.
  - New assessments automatically retrieve the latest effective standard.

---

## 7. Verification & Automated Testing

The RAG pipeline is validated via automated tests:
* `test_local_rag_keyword_scoring` in [`ai-service/tests/test_ai_pipeline.py`](file:///c:/Users/lenovo/OneDrive/Desktop/kaushal%20ai/ai-service/tests/test_ai_pipeline.py): Verifies that technical domain keywords correctly ground competency assessments to official NSQF criteria.
* `RULE VERIFICATION: Granular NOS criteria must be mapped in competency_assessments table` in [`backend/tests/evidence_integrity_and_scoring.test.js`](file:///c:/Users/lenovo/OneDrive/Desktop/kaushal%20ai/backend/tests/evidence_integrity_and_scoring.test.js): Verifies that per-PC granular criteria persist to relational SQLite with NOS codes, PC codes, and evidence notes.
