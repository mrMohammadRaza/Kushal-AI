# Kaushal AI — Technical Design Document
**SIH Problem Statement: SIH26242**  
**Recognition of Prior Learning (RPL) Skill Assessment Platform**

---

## 1. System Components & Responsibilities

### 1.1. Frontend (`frontend/`)
- **Technology**: React 18, Vite 5.2, Tailwind CSS 3.4, Framer Motion 11, Lucide React icons.
- **Key Subsystems**:
  - `ViewA_Dashboard.jsx`: Occupational trade selector displaying prerequisites, tools, and mandatory PPE.
  - `ViewB_EvidenceCapture.jsx`: Media capture station featuring real browser `MediaRecorder` audio capture, audio playback preview, Devanagari speech-to-text transcript correction, and file uploads.
  - `ExplainableAssessorDashboard.jsx`: Assessor workstation with side-by-side evidence inspection, original audio player, NOS rubric matrix, AI reasoning citations, override controls, and digital sign-off trigger.
  - `AssessmentSuccessScreen.jsx`: Displays candidate assessment tracking status and link to released report.

### 1.2. Core Backend (`backend/`)
- **Technology**: Node.js 24, Express 4.19, Better-SQLite3, Multer, Bcrypt.js, JsonWebToken, PDFKit, QRCode.
- **Key Modules**:
  - `data/database.js`: SQLite schema initialization, foreign keys, WAL mode configuration, and audit logging.
  - `middleware/auth.js`: JWT verification, user context resolution, and server-side RBAC enforcement.
  - `services/aiService.js`: 3-tier resilient AI evaluation orchestrator.
  - `services/geminiService.js`: Grounded Gemini REST client adhering to strict schema and non-hallucination rules.
  - `services/reportService.js`: Tamper-evident PDF assessment report generation with cryptographic SHA-256 verification hash and QR code.
  - `routes/auth.js`: Registration, login, and `/api/auth/me`.
  - `routes/assessments.js`: Ingestion, evaluation, sign-off, and scoring.
  - `routes/reports.js`: Public QR code verification endpoint (`/api/reports/verify/:hash`).

### 1.3. AI Microservice (`ai-service/`)
- **Technology**: Python 3.14, FastAPI 0.143, Pydantic 2.14, Uvicorn.
- **Key Modules**:
  - `rag/nsqf_engine.py`: Indexes National Occupational Standards criteria and executes token-overlap search.
  - `services/bhashini_service.py`: Standard ULCA translation interface with honest offline fallback.
  - `services/gemini_service.py`: Vision analysis and viva understanding without fabricated scores.
  - `pipelines/langgraph_pipeline.py`: 4-stage assessment workflow coordinator.

---

## 2. Data Flow: Evidence Ingestion to Released Report

```
1. Candidate records audio & photo in ViewB_EvidenceCapture.jsx
   │
2. POST /api/assessments/evaluate (multipart FormData)
   │
3. Backend Multer saves files to uploads/ and computes SHA-256 integrity hashes
   │
4. aiService.evaluateAssessment() triggers AI evaluation (FastAPI -> Gemini -> Local)
   │
5. SQLite Transaction:
   - assessment_cases record created with status 'assessor_review_required'
   - evidence_records stored with SHA-256 hashes
   - competency_assessments populated with granular criteria status
   │
6. Assessor reviews candidate dossier in ExplainableAssessorDashboard.jsx
   │
7. POST /api/assessments/:id/signoff (Authorized Assessor Bearer Token)
   │
8. Backend generates HMAC-SHA256 signature digest, generates PDF with QR code,
   and updates status to 'certified_approved' or 'conditional_bridge_training'
   │
9. Public scans QR code -> GET /api/reports/verify/:hash returns verified status
```
