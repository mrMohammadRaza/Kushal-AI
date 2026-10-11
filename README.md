# Kaushal AI (कौशल AI)
> **AI-Assisted Skill Assessment Tool for Recognition of Prior Learning (RPL)**  
> **Smart India Hackathon (Problem Statement: SIH26242)**  
> Mapped to the National Skills Qualification Framework (NSQF) & National Occupational Standards (NOS)

---

## 📌 Executive Summary

India has millions of highly skilled informal workers—electricians, motor mechanics, plumbers, rooftop solar installers—who have acquired years of practical expertise on the job without formal diplomas. Under the Ministry of Skill Development and Entrepreneurship (MSDE) and the National Council for Vocational Education and Training (NCVET), **Recognition of Prior Learning (RPL)** formally evaluates and certifies these workers.

**Kaushal AI** acts as an objective, explainable **AI Co-Pilot for certified human assessors**. It ingests multimodal practical evidence (photos of completed wiring, panel installations, tool usage, safety gear) along with multilingual/regional viva voce audio explanations, executes a **Retrieval-Augmented Generation (RAG) pipeline** over official NSQF Qualification Packs, and provides automated rubric scoring with human-in-the-loop validation.

---

## 🏗️ Architecture & Tech Stack

```
                                  ┌───────────────────────────────┐
                                  │      Candidate Evidence       │
                                  │  - Practical Work Photo       │
                                  │  - Viva Voce Voice Audio      │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────┐  HTTP/REST  ┌─────────────────────────────────┐
│     Frontend UI (React)      │◄───────────►│       Backend (Node.js/Express) │
│  - Vite + Custom CSS Tokens  │             │  - Multer for Media Uploads     │
│  - Webcam & Audio Recorder   │             │  - Candidate & Session Store    │
│  - Assessor Co-Pilot Screen  │             │  - Human-in-the-Loop Sign-Off   │
└──────────────────────────────┘             └────────────────┬────────────────┘
                                                              │
                                                              ▼
                                             ┌─────────────────────────────────┐
                                             │   AI Microservice (FastAPI)     │
                                             │  - LangGraph StateGraph Pipeline│
                                             │  - Whisper STT (Hinglish/Dialect)│
                                             │  - Multimodal PPE & Vision Check│
                                             │  - NSQF RAG Competency Retrieval│
                                             │  - Weighted Rubric Synthesizer  │
                                             └────────────────┬────────────────┘
                                                              │
                                                              ▼
                                             ┌─────────────────────────────────┐
                                             │       NSQF Standards Store      │
                                             │  - 5 Trades (L3 & L4 Standards) │
                                             │  - 20+ NOS Modules & Criteria   │
                                             │  - Standard Tools & PPE Rules   │
                                             └─────────────────────────────────┘
```

### 1. Frontend (`frontend/`)
- **Technology:** React 18, Vite, Custom Design System (`src/index.css`), Lucide React icons.
- **Features:**
  - Candidate profile selector with preloaded RPL candidate profiles.
  - Interactive viva scenario prompt based on trade-specific fault conditions.
  - Live audio viva voce recording and Hinglish speech transcription interface.
  - Practical work photo capture / evidence inspection station.
  - Real-time animated LangGraph multi-stage execution progress bar.
  - Assessor co-pilot results dashboard: circular competency score gauge, NOS-by-NOS progress breakdown, safety gear compliance audit, and gap diagnosis.
  - Digital assessor override & signature sign-off.
  - Printable/downloadable official RPL Assessment Certificate.

### 2. Core Backend (`backend/`)
- **Technology:** Node.js, Express, Multer, UUID, JSON persistent store.
- **Endpoints:**
  - `GET /api/health` — Microservice health status.
  - `GET /api/candidates` & `POST /api/candidates` — RPL candidate profiles & registration.
  - `GET /api/trades` & `GET /api/trades/:id` — NSQF Qualification Packs & NOS criteria.
  - `POST /api/assessments/evaluate` — Multipart upload for practical image & viva audio, orchestrating AI co-pilot evaluation.
  - `POST /api/assessments/:id/signoff` — Human assessor verification, score adjustments, and official sign-off.

### 3. AI Microservice & LangGraph Pipeline (`ai-service/`)
- **Technology:** Python, FastAPI, Pydantic, RAG Engine.
- **Workflow:**
  1. **Audio STT Node:** Transcribes regional/Hinglish candidate explanations and extracts technical keywords.
  2. **Vision Inspection Node:** Multimodal audit of PPE compliance (insulated gloves, safety glasses, dielectric boots) and tool handling.
  3. **NSQF RAG Matcher Node:** Semantic and keyword matching against official National Occupational Standards (NOS).
  4. **Rubric Synthesizer Node:** Computes weighted score based on NOS weightages, identifies competency gaps, and recommends targeted bridge training modules.

---

## 📋 Indexed NSQF Trades (`data/nsqf_standards.json`)

1. **Assistant Electrician (ELE/Q1401) — NSQF Level 3**
   - Tool inspection, PVC conduit & wire sizing, distribution boards, earthing continuity testing, and safety protocols.
2. **Commercial / Industrial Electrician (ELE/Q1402) — NSQF Level 4**
   - 3-phase panel commissioning, industrial AC motor troubleshooting, and earth pit testing.
3. **Automotive Service Technician (ASC/Q1401) — NSQF Level 4**
   - Routine preventive maintenance, hydraulic braking systems, OBD-II scanner diagnostics, and workshop safety.
4. **Assistant Plumber (CON/Q0602) — NSQF Level 3**
   - CPVC/UPVC pipe jointing, sanitary fixture mounting, hydrostatic pressure testing, and sewer trap water seals.
5. **Solar PV System Installer (ELE/Q5901) — NSQF Level 4**
   - Module mounting structure alignment, MC4 connector crimping, string Voc/Isc measurement, and rooftop fall-arrest safety.

---

## 🚀 Running Kaushal AI Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Quick Start

1. **Install Dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start Backend Server:**
   ```bash
   npm run dev:backend
   ```
   *Backend runs on:* `http://localhost:5000`

3. **Start Frontend Client:**
   ```bash
   npm run dev:frontend
   ```
   *Frontend UI runs on:* `http://localhost:3000`

4. *(Optional) Start FastAPI AI Microservice:*
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Note: If the FastAPI service is not running, the backend automatically utilizes its built-in high-fidelity NSQF co-pilot engine to guarantee 100% testability and zero downtime.*

---

## 🏆 Key SIH26242 Highlights

- **Objective Co-Pilot:** Reduces assessor subjectivity and bias during RPL field drives.
- **Multilingual Support:** Handles informal explanations in Hindi, English, and technical slang.
- **Multimodal Evidence:** Audits real photos of wiring, joints, and mandatory PPE.
- **Human-in-the-Loop:** Certified human assessors maintain final authority to endorse or override AI recommendations.
- **Gap Diagnosis:** Automatically specifies NSDC bridge training modules for candidates requiring minor skill upgrades.
