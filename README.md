# Kaushal AI (कौशल AI) — National-Level RPL Assessment Platform
> **AI-Assisted Multimodal Skill Assessment & Competency Mapping for Recognition of Prior Learning (RPL)**  
> **Smart India Hackathon (Problem Statement: SIH26242)**  
> Aligned with National Skills Qualification Framework (NSQF) & National Occupational Standards (NOS)

[![Tests](https://img.shields.io/badge/Automated%20Tests-43%2F43%20Passing-brightgreen.svg)](#-automated-testing--validation)
[![Architecture](https://img.shields.io/badge/Architecture-Relational%20SQLite%20%2B%20WAL-blue.svg)](#-system-architecture)
[![Security](https://img.shields.io/badge/Security-Server--Enforced%20RBAC%20%2B%20SHA--256-orange.svg)](#-security--integrity-framework)
[![AI Governance](https://img.shields.io/badge/AI%20Governance-Human--in--the--Loop%20(Zero%20Fabrication)-purple.svg)](#-governance--non-fabrication-guarantees)

---

## 📌 Executive Summary

Over 90% of India's workforce operates in the unorganized sector, acquiring deep practical skills across electrical, automotive, construction, and green energy trades through informal apprenticeships without formal academic credentials. The Ministry of Skill Development & Entrepreneurship (MSDE) and the National Council for Vocational Education and Training (NCVET) conduct **Recognition of Prior Learning (RPL)** drives to certify these competencies.

However, traditional RPL field drives face severe bottlenecks:
1. **Assessor Subjectivity & Inconsistency:** Variable assessment criteria and human fatigue across distant rural testing centers.
2. **Language & Dialect Barriers:** Skilled informal workers explain trade concepts fluently in regional vernaculars (Hindi, Marathi, Bhojpuri, Hinglish) but struggle with standardized English/formal Hindi terminology.
3. **Evidence Ingestion Deficits:** High cost of observing prolonged physical tasks and lack of tamper-evident documentation for practical work.

**Kaushal AI** resolves these challenges by delivering an objective, explainable, and secure **AI Co-Pilot for certified human assessors**. Following the strict governing pipeline:
```
EVIDENCE INGESTION ➔ MULTIMODAL AUDIT ➔ STANDARDS MAPPING ➔ GAP DIAGNOSIS ➔ HUMAN REVIEW ➔ APPROVED REPORT
```
The AI assists with evidence analysis, transcription, and rubric suggestions, but **never independently certifies candidates or fabricates passing scores**. Formal qualification is granted solely through authorized human assessor sign-off.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND CLIENT (React + Vite)                           │
│  - Multimodal Upload (JPEG, PNG, MP4)          - Web Speech API + Browser MediaRecorder │
│  - Candidate Self-Service Dashboard            - Assessor Explainable Co-Pilot Console  │
│  - Public QR Code Report Verification Viewer   - Strict RBAC Route Guards               │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ HTTP REST / JWT / Multipart FormData
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               CORE BACKEND (Node.js & Express)                          │
│  - Server-Enforced RBAC Middleware (Candidate, Assessor, Manager, Admin, Auditor)        │
│  - 3-Tier AI Resilient Orchestrator (FastAPI ➔ Gemini ➔ Deterministic NSQF Engine)       │
│  - Evidence SHA-256 Hashing & Storage Controller                                       │
│  - Tamper-Evident PDF Report Generator (PDFKit + Embedded Dynamic QR Codes)            │
│  - Immutable Audit Logging Pipeline                                                     │
└──────────────────────┬──────────────────────────────────┬───────────────────────────────┘
                       │                                  │
                       ▼                                  ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────────────────┐
│     PERSISTENCE (SQLite + WAL)       │  │        AI MICROSERVICE (FastAPI / LangGraph)  │
│  - 12 Relational Tables              │  │  - Speech STT & Language Normalization       │
│  - Strict Foreign Keys & Constraints │  │  - Vision Inspection (PPE & Tool Safety)     │
│  - ACID Transactions for Sign-Off    │  │  - NSQF RAG Standards Matcher (ELE, ASC, CON)│
│  - Evidence Checksums & Audit Trails │  │  - Deterministic NOS Rubric Scoring Engine    │
└──────────────────────────────────────┘  └───────────────────────────────────────────────┘
```

---

## 🛡️ Security & Integrity Framework

1. **Server-Enforced Role-Based Access Control (RBAC):**
   - Client-side role claims are completely untrusted. All requests are authenticated via signed JSON Web Tokens (`Authorization: Bearer <token>`).
   - Distinct role boundaries:
     - `candidate`: Submit evidence, review gaps, view released personal assessment reports.
     - `assessor`: Authorized to inspect assigned candidate evidence, score rubrics, record overrides, and execute final report sign-off.
     - `center_manager`: Manage assessor-candidate assignments and monitor center-level operational pipelines.
     - `admin`: Manage standards versions, qualification packs, users, and audit logs.
     - `auditor`: Read-only provenance access to completed assessments, tamper digests, and decision histories.
2. **Tamper-Evident Evidence Storage:**
   - Every uploaded image, video, and audio file is hashed via cryptographic SHA-256 upon receipt.
   - Integrity checksums are permanently bound to the evidence record and printed in the audit trail.
3. **Cryptographically Verifiable Reports:**
   - Released assessment reports generate an immutable SHA-256 digital verification hash computed from `assessmentId + candidateId + assessorId + score + timestamp`.
   - Each PDF report contains an embedded high-resolution QR code linking to `GET /api/reports/verify/:hash`.
   - The public verification endpoint confirms authenticity, trade, level, and assessor sign-off without exposing private candidate PII or raw media.

---

## ⚖️ Governance & Non-Fabrication Guarantees

In strict compliance with national hackathon rules and industrial RPL regulations:
- **Zero Fabrication Policy:** When a candidate does not submit required practical photos or audio evidence, the system **never substitutes passing scores or placeholder data**. Missing competencies are explicitly flagged as `evidence_missing` or `insufficient_evidence`, receiving a score of `0%`.
- **Honest AI Status:** If external cloud AI models or Bhashini APIs are unavailable or lack credentials, the system transparently logs `offline` / `unconfigured` status and falls back to its deterministic local NSQF rule engine without pretending to have conducted live cloud inference.
- **Human Authority:** The AI is strictly an advisory co-pilot. An assessment case can **never transition to `approved` without an authorized human assessor's digital signature and recorded rubric verification**.

---

## 📋 Standardized NSQF Trades Supported

| Trade Code | Trade Name | NSQF Level | Core National Occupational Standards (NOS) |
| :--- | :--- | :---: | :--- |
| **SSC/Q0501** | **Web Developer (Primary Occupation)** | **Level 5** | **HTML & Accessibility, CSS & Responsive Design, JS Fundamentals, Practical Dev, Debugging, Technical Explanation** |
| **ELE/Q1401** | Assistant Electrician | Level 3 | Tools & Safety, Wiring & Conduits, Distribution Boards, Testing |
| **ELE/Q1402** | Commercial Electrician | Level 4 | Industrial Panels, 3-Phase Motors, Earth Pit Testing, Diagnostics |
| **ASC/Q1401** | Automotive Service Technician | Level 4 | Engine Overhaul, Hydraulic Brakes, OBD-II Diagnostics, Safety |
| **CON/Q0602** | Assistant Plumber | Level 3 | CPVC/UPVC Piping, Sanitary Fixtures, Pressure Testing, Traps |
| **ELE/Q5901** | Solar PV System Installer | Level 4 | Module Mounting, MC4 Crimping, String Testing, Fall Arrest |

---

## 🧪 Automated Testing & Validation

The codebase features comprehensive automated unit, integration, and sandbox security tests across both the Node.js backend and the Python AI microservice.

### Test Results (39/39 Passing)

```
Test Suites: 4 passed, 4 total (Node.js Jest)
Tests:       34 passed, 34 total
Time:        8.92 s
[Jest] Passed:
  ✓ Web Developer Hybrid Assessment (15 tests):
    - Blueprint weight validation strictly equals 100%
    - Knowledge questions auto-scoring
    - V8 sandbox practical coding task execution & DOM simulation
    - Controlled defect debugging evaluation
    - Complete multi-stage hybrid submission & transition to assessor review
  ✓ Auth & RBAC (7 tests): Registration, Login, Token generation, Role enforcement, Center manager & Auditor boundaries
  ✓ Evidence Integrity & Scoring (6 tests): SHA-256 cryptographic hashing, Zero-fabrication on missing evidence, Incomplete status rules
  ✓ Reports & Verification (6 tests): PDF generation, Dynamic QR codes, Verification hash matching, Anti-tampering

Test Sessions: 1 passed, 1 total (Python Pytest)
Tests:         5 passed, 5 total
Time:          2.05 s
[Pytest] Passed:
  ✓ Health endpoint & indexed standards check
  ✓ NSQF RAG engine competency matching
  ✓ Missing evidence outputs explicit zero-score & gaps (non-fabrication)
  ✓ Multimodal viva transcription flagged for mandatory human assessor review
  ✓ Gemini Co-Pilot standards grounded assistance
```

To execute the test suite:
```bash
# Run backend Jest tests (34 tests)
npm test

# Run AI service Pytest tests (5 tests)
npm run test:ai

# Run all automated tests (39 tests)
npm run test:all
```

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10.0 or higher
- **Git**

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/mrMohammadRaza/Kushal-AI.git
cd Kushal-AI

# Install all workspace dependencies (root, backend, frontend)
npm run install:all
```

### Step 2: Configure Environment Variables
Copy the example environment templates:
```bash
# Backend configuration
copy backend\.env.example backend\.env

# AI Service configuration
copy ai-service\.env.example ai-service\.env
```
*(Default settings function out-of-the-box using SQLite and local rule engines. Cloud AI API keys for Gemini or Bhashini are optional.)*

### Step 3: Seed Demo Database
Populate the database with pre-configured NSQF standards, test candidates, and initial assessment cases:
```bash
npm run seed:demo
```

### Step 4: Start Services
In separate terminal windows:
```bash
# Terminal 1: Start Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend Application (Port 5173)
npm run dev:frontend

# Terminal 3 (Optional): Start Python FastAPI AI Microservice (Port 8000)
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🎭 Preloaded Demonstration Accounts

The platform includes pre-seeded demo accounts for end-to-end evaluation:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Lead Assessor** | `assessor@kaushal.gov.in` | `Kaushal@2026` | Review evidence, adjust rubric scores, execute official sign-off |
| **Platform Admin** | `admin@kaushal.gov.in` | `Kaushal@2026` | Full platform governance, standard configuration, audit logs |
| **Candidate** | `ramesh.sharma@skillindia.rpl` | `Kaushal@2026` | Evidence submission, gap view, access released PDF report |

---

## 📖 Technical Documentation Index

Detailed technical specifications and design documents are located in the [`docs/`](./docs/) directory:

- [System Architecture](./docs/ARCHITECTURE.md) — Multi-tier architecture, data flow diagrams, component boundaries.
- [Technical Design](./docs/TECHNICAL_DESIGN.md) — Technical choices, state transitions, failover mechanisms.
- [API Reference](./docs/API_REFERENCE.md) — Complete endpoint schemas, request/response payloads, error codes.
- [Database Schema](./docs/DATABASE_SCHEMA.md) — 15 relational entity models, constraints, and audit tables.
- [AI Pipeline & Governance](./docs/AI_PIPELINE.md) — Multimodal audit, LangGraph nodes, non-fabrication engine.
- [Security & Privacy](./docs/SECURITY_AND_PRIVACY.md) — RBAC matrix, token security, SHA-256 evidence integrity.
- [Testing & Validation](./docs/TESTING.md) — Automated test suite coverage, reproduction commands.
- [Deployment Guide](./docs/DEPLOYMENT.md) — Production build steps, environment variables, Docker setup.
- [SIH Jury Demonstration Guide](./docs/DEMO_GUIDE.md) — Step-by-step walkthrough script for hackathon presentations.
- [Known Limitations & Roadmap](./docs/KNOWN_LIMITATIONS.md) — Honest disclosure of prototype sandboxes and roadmap.
- [SIH Problem Alignment](./docs/SIH_ALIGNMENT.md) — Direct mapping to Problem Statement SIH26242 criteria.

---

## 👥 Contributors & Acknowledgements

Developed for **Smart India Hackathon (SIH)**.  
Aligend with guidelines established by **Ministry of Skill Development & Entrepreneurship (MSDE)**, **NCVET**, and **NSDC**.
