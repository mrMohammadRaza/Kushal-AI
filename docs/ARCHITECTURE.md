# Kaushal AI — System Architecture
**SIH Problem Statement: SIH26242**  
**Recognition of Prior Learning (RPL) Skill Assessment Platform**

---

## 1. Architectural Philosophy
Kaushal AI is designed around a core governing principle:

$$\text{EVIDENCE INGESTION} \longrightarrow \text{MULTIMODAL AUDIT} \longrightarrow \text{STANDARDS MAPPING} \longrightarrow \text{GAP DIAGNOSIS} \longrightarrow \mathbf{HUMAN\ ASSESSOR\ REVIEW} \longrightarrow \text{OFFICIAL REPORT}$$

The AI operates strictly as an objective, explainable **Co-Pilot for certified human vocational assessors**. The AI does not independently issue government qualifications, certify candidates, or fabricate passing scores.

---

## 2. High-Level Component Architecture

```
                              ┌───────────────────────────────────────────────┐
                              │             Candidate Client (Web)            │
                              │  - Multilingual Vernacular UI (Hindi/English) │
                              │  - WebRTC / MediaRecorder Audio viva Capture  │
                              │  - Camera / File Evidence Upload Station      │
                              │  - Candidate Self-Service Dashboard           │
                              └──────────────────────┬────────────────────────┘
                                                     │ HTTP/REST (JWT Bearer)
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Kaushal AI Core Backend (Node.js/Express)                    │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────────┐  │
│  │   Auth & RBAC Layer   │  │ Evidence Ingestion Multer│  │   Standards & RAG Engine      │  │
│  │ - 5 Server Roles      │  │ - SHA-256 File Hashing  │  │ - 5 Indexed NSQF Trades       │  │
│  │ - JWT Token Issuance  │  │ - MIME & Size Validation│  │ - Granular NOS & PC Mapping   │  │
│  └───────────────────────┘  └─────────────────────────┘  └───────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     Relational Persistence Layer (SQLite3 with WAL Mode)              │  │
│  │ - ACID Transactions  - Foreign Key Constraints - Immutable Audit Event Logging        │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     Report & Verification Engine (PDFKit & QRCode)                     │  │
│  │ - Tamper-evident Assessment Reports  - Public /api/reports/verify/:hash Endpoint      │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ HTTP / Internal IPC
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            AI Microservice (FastAPI + LangGraph)                            │
│  ┌───────────────────────────┐  ┌───────────────────────────┐  ┌─────────────────────────┐  │
│  │ Speech & Indic Translation│  │ Practical Vision Inspector│  │  NSQF Rubric Synthesizer │  │
│  │ - Bhashini ULCA Protocol  │  │ - Multimodal Gemini Audit │  │ - Explainable Gap Audit │  │
│  │ - Regional Normalization  │  │ - Non-hallucinating PPE   │  │ - Bridge Training Recom.│  │
│  └───────────────────────────┘  └───────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tiered AI Orchestration & Graceful Degradation
To guarantee high availability during hackathon demonstrations and production network outages, the assessment engine employs a 3-tier fallback architecture:

1. **Tier 1 — FastAPI LangGraph Microservice (`http://127.0.0.1:8000`)**:
   - Executes multi-stage evaluation pipeline with Indic dialect understanding and semantic criteria retrieval.
   - Bounded timeout: 1200ms failover trigger.
2. **Tier 2 — Direct Google Gemini 2.5/2.0 REST Engine**:
   - Executes multimodal prompt analysis directly from the Node.js backend when FastAPI is offline.
   - Bounded retries and exponential backoff on 503/429 status codes.
3. **Tier 3 — Deterministic Standards Engine (Resilient Local Rule Engine)**:
   - Evaluates submitted keywords against official NSQF performance criteria.
   - Zero hallucinations: if photos or audio are missing, outputs `evidence_missing` / `requires_practical_test`.
   - Never fabricates passing grades or fake certifications.

---

## 4. Role-Based Access Control (RBAC) Architecture
Access control is enforced strictly on the server:

| Role | Permissions & Boundaries |
| :--- | :--- |
| **Candidate** (`candidate`) | Register, manage profile, upload practical evidence, record audio viva, view own submission status and released reports. Cannot access other candidates' files or sign off. |
| **Assessor** (`assessor`) | Inspect assigned candidate dossiers, review original media evidence, inspect AI reasoning, adjust rubric scores, enter observations, and sign off official reports. |
| **Center Manager** (`center_manager`) | View center-level queue, assign assessors, monitor operational progress and assessment statistics. |
| **Platform Administrator** (`admin`) | Manage users, configure occupational standards, monitor system health and audit logs. |
| **Auditor** (`auditor`) | Read-only access to assessment decisions, evidence provenance hashes, and audit event logs. |
