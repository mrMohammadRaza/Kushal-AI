# KAUSHAL AI (कौशल AI) — REPOSITORY AUDIT & BASELINE REPORT
**Smart India Hackathon (SIH26242) — Recognition of Prior Learning (RPL) Skill Assessment Platform**  
**Date of Audit:** October 17, 2026  
**Auditor:** Principal Systems Architect & Engineering Lead  

---

## 1. Executive Summary & Verification Methodology

Every finding in this audit was verified directly against the source code of the repository located at `mrMohammadRaza/Kushal-AI`. Build tools, interpreters, dependencies, and environment configurations were executed to establish an honest, unvarnished baseline prior to modification.

### Key Architecture Observed
- **Root Monorepo**: Node.js workspaces orchestrating `backend/` and `frontend/`, with a standalone Python `ai-service/`.
- **Frontend**: React 18, Vite 5.2, Tailwind CSS 3.4, Framer Motion 11, Lucide React icons.
- **Backend**: Node.js Express 4.19, Multer for multipart media uploads, UUID for identifiers.
- **AI Microservice**: Python 3.14, FastAPI 0.143, Pydantic 2.14, with direct Google Gemini REST integrations.
- **Data Store**: Unindexed single JSON file `backend/data/store.json` read and written synchronously.
- **Standards Store**: `data/nsqf_standards.json` defining 5 vocational trades (Assistant Electrician L3, Industrial Electrician L4, Automotive Technician L4, Plumber L3, Solar PV Installer L4).

---

## 2. Baseline Verification Results

| Component | Command Executed | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Node Runtime** | `node -v` | `v24.19.0` | Passed |
| **NPM CLI** | `npm.cmd -v` | `11.17.0` | Passed (Note: PowerShell execution policy blocks `npm.ps1`; `npm.cmd` must be used) |
| **Python Runtime**| `python --version` | `3.14.7` | Passed |
| **Frontend Build** | `npm --prefix frontend run build` | **SUCCESS** | Vite generated `dist/` bundle (626 kB JS, 61 kB CSS) in 6.30s |
| **Backend Startup**| `node -e "require('./backend/src/server.js')"` | **SUCCESS** | Backend loaded cleanly |
| **AI Service** | `python -c "from app.main import app"` | **SUCCESS** | FastAPI application instantiated cleanly |
| **Existing Tests** | Search for test files (*.test.js, test_*.py) | **0 TESTS FOUND** | Complete absence of automated tests |

---

## 3. Findings Matrix: Code Inspection

### 3.1. Implemented & Operational Functionality
1. **Frontend UI Shell**: Rich responsive multi-view interface with custom dark/light theme, language toggling (Hindi/English), and tabbed navigation.
2. **Trade Standards Definitions**: `data/nsqf_standards.json` contains well-structured NOS codes, performance criteria (PC), knowledge criteria (KC), required tools, and mandatory PPE for 5 NSQF trades.
3. **Multipart Evidence Ingestion Route**: `POST /api/assessments/evaluate` handles file uploads using Multer and saves files to `uploads/`.
4. **Basic NSQF RAG Corpus Search**: `ai-service/app/rag/nsqf_engine.py` indexes PC/KC text and performs keyword overlap scoring.
5. **Interactive Gemini Copilot Chat Route**: `POST /api/ai/copilot` and `POST /api/gemini/copilot` provide basic query routing to Gemini.

### 3.2. Critical Violations & Fabricated Outputs (Must Be Removed Immediately)
1. **Fabricated Assessment Fallbacks (`backend/src/services/aiService.js`)**:
   - `evaluateLocally()` in `backend/src/services/aiService.js` automatically assigns an `overallScore` of 90-95%, sets status to `"Certified"`, and invents:
     - Hardcoded dielectric gloves bounding box `[0.18, 0.22, 0.44, 0.48]` with confidence `0.96`.
     - Hardcoded Hindi transcript and timestamp citations (e.g., `"पहले 3-फेज मेन आइसोलेटर काटा और लॉक आउट लगाया"` from 0.5s to 2.8s) even when **no audio** was recorded or uploaded.
     - Hardcoded anti-fraud liveness check: `confidence: 0.98`, `gestureRecognized: "thumbs_up"`, and GPS coordinates in Varanasi (`25.3176, 82.9739`).
2. **Fabricated Fallbacks in Python AI Service (`ai-service/app/services/gemini_service.py`)**:
   - `_fallback_vision_data()` returns hardcoded 96% PPE compliance score and bounding boxes without image analysis.
   - `_fallback_viva_data()` invents Hindi transcripts and timestamp citations.
   - `_fallback_nsqf_data()` outputs `overallScore: 91` and status `"Certified"`.
3. **Prompt Injection of Fabricated Passing Scores**:
   - In `backend/src/services/geminiService.js` (lines 114-117), the prompt explicitly directs Gemini: `"overallScore": integer (70 to 98)`, `"status": "Certified"`, `"confidenceScore": 0.98`. This forces the AI model to fabricate a passing score regardless of actual candidate competence.
4. **Mocked Voice viva Voce in Frontend (`ViewB_EvidenceCapture.jsx`)**:
   - The microphone recording handler does not invoke the browser `MediaRecorder` API; instead, it executes a `setTimeout` of 2500ms and hardcodes a pre-baked technical script.
5. **Mocked Sign-Off and DigiLocker (`ExplainableAssessorDashboard.jsx`)**:
   - Assessor sign-off button triggers a browser `alert()` rather than authenticating the assessor and persisting a cryptographic signature.
   - Claims official NCVET DigiLocker push with mock URLs without real authorization or integration.

### 3.3. Security Vulnerabilities
1. **Zero Authentication & Authorization on Assessment Endpoints**:
   - `GET /api/assessments`, `GET /api/assessments/:id`, `POST /api/assessments/evaluate`, and `POST /api/assessments/:id/signoff` have NO authentication middleware. Anyone on the network can view candidate records, trigger evaluations, or fake an assessor sign-off.
2. **Unauthenticated Static File Access**:
   - `/uploads` directory is served statically (`express.static`) without validating session tokens or verifying ownership of candidate evidence.
3. **CORS Configuration**:
   - Both Express (`app.use(cors())`) and FastAPI (`allow_origins=["*"]`) allow unrestricted cross-origin requests.
4. **Missing Rate Limiting**:
   - No rate limiting or request throttling is in place on sensitive upload or AI generation endpoints.
5. **Input Validation Flaws**:
   - Files are accepted based on extension check without MIME type verification or magic byte inspection.

### 3.4. Data Integrity & Persistence Issues
1. **Single JSON Store (`backend/data/store.json`)**:
   - Reads and writes use synchronous `fs.readFileSync` and `fs.writeFileSync`.
   - Concurrent requests cause race conditions, data loss, or corrupt JSON files.
   - No relational integrity, no foreign key constraints, and no ACID transaction guarantees.
2. **Missing Relational Entities**:
   - Lacks dedicated tables/models for assessment centers, qualification packs, assessor assignments, rubric scores, evidence records, report generations, and immutable audit logs.

### 3.5. Deployment Configuration Deficiencies
1. **Render Configuration (`render.yaml`)**:
   - Only specifies the Node.js backend. The Python `ai-service` is not configured or deployed on Render, causing production backend calls to fail and silently fall back to local mocks.
2. **Vercel Configuration (`vercel.json`)**:
   - Attempts multi-service routing across `ai-service`, `backend`, and `frontend`, which is incompatible with standard Vercel serverless functions without containerization or separate project deployments.

---

## 4. Prioritized Implementation Roadmap

- **PHASE 1 (Completed)**: Baseline audit and verification of existing capabilities.
- **PHASE 2**: Remove all fabricated outputs, hardcoded scores, fake bounding boxes, and mock transcripts. Establish genuine competency status states (`not_assessed`, `evidence_missing`, `insufficient_evidence`, `partially_supported`, `requires_practical_test`, `assessor_review_required`, `verified_by_assessor`).
- **PHASE 3**: Implement reliable relational persistence (SQLite/PostgreSQL schema with migrations, foreign keys, and transaction safety) and secure evidence storage.
- **PHASE 4**: End-to-end candidate and assessor workflow with server-enforced Role-Based Access Control (RBAC).
- **PHASE 5**: Strict AI schema validation, correlation IDs, async processing, and graceful error handling.
- **PHASE 6**: Standards-based competency mapping and explainable RAG linked to official NSQF qualification packs.
- **PHASE 7**: Real regional-language audio processing with browser MediaRecorder and genuine speech pipeline.
- **PHASE 8**: Assessor workstation, rubric-based evaluation, digital sign-off, verifiable PDF reports with QR codes, and immutable audit trails.
- **PHASE 9**: UI/UX refinement adhering to national government-technology design standards.
- **PHASE 10**: Automated test suite (unit, integration, security, and AI evaluation metrics).
- **PHASE 11**: Demo seed data, complete documentation suite, and SIH jury presentation materials.
