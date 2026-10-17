# Kaushal AI — SIH Problem Statement Alignment
**Problem Statement ID: SIH26242**  
**Theme: Smart Education / Vocational Training & Recognition of Prior Learning**

---

## 1. Problem Statement Analysis
India’s informal workforce comprises over 400 million workers who possess deep practical expertise acquired through years of on-the-job experience, apprenticeships, and self-learning, but lack formal educational certificates. The Ministry of Skill Development and Entrepreneurship (MSDE) and the National Council for Vocational Education and Training (NCVET) conduct **Recognition of Prior Learning (RPL)** to evaluate and certify these competencies.

Traditional RPL faces three core bottlenecks:
1. **Assessor Subjectivity & Scalability**: Manual assessment across rural districts is resource-constrained and prone to inconsistent rubric application.
2. **Language Barriers**: Informal workers often speak regional dialects or Hinglish, while formal assessment standards are written in bureaucratic English/Hindi.
3. **Paper-Based Fraud & Traceability**: Physical assessment sheets lack tamper-evident proof of practical demonstration or evidence provenance.

---

## 2. Kaushal AI Solution & Value Proposition

| SIH26242 Requirement | Kaushal AI Engineering Implementation |
| :--- | :--- |
| **Multimodal Practical Evidence** | Ingests real work photos, tools, wiring terminations, and real audio recordings with SHA-256 integrity hashes. |
| **Vernacular & Regional Viva Voce** | Browser `MediaRecorder` audio capture with Indic terminology normalization and live transcript editing. |
| **Explainable NSQF RAG Alignment** | Granular mapping of candidate evidence to official Performance Criteria (PC) and Knowledge Criteria (KC) for 5 NSQF trades. |
| **Human-in-the-Loop Authority** | AI acts as a co-pilot; certified human assessors retain sole authority to adjust scores, override recommendations, and sign off. |
| **Verifiable Assessment Reports** | Generates tamper-evident PDF assessment reports with cryptographic SHA-256 digests and public QR verification endpoints. |
| **Targeted Bridge Training** | Recommends specific, evidence-linked training modules for identified competency gaps rather than failing workers outright. |

---

## 3. Six-Slide Presentation Outline for SIH Jury

- **Slide 1: Problem & Candidate Pain Points**
  - Millions of skilled informal artisans lack formal credentials; high evaluation costs and language barriers block upward mobility.
- **Slide 2: Proposed Solution & End-to-End Workflow**
  - Kaushal AI: Multimodal Evidence -> Vernacular viva Voce -> Standards RAG -> Assessor Co-Pilot -> Cryptographic Report.
- **Slide 3: Technical Architecture & Genuine AI Innovation**
  - Node.js + SQLite3 ACID relational core, 3-tier resilient AI failover, grounded Gemini vision inspection, and Bhashini ULCA interface.
- **Slide 4: Privacy, Security & Responsible AI**
  - Server-enforced RBAC, SHA-256 file provenance, masked Aadhaar numbers, tamper-evident QR verification, zero hallucinated passing grades.
- **Slide 5: Prototype Evaluation & Measured Results**
  - 20 automated tests passing (100%), sub-second local retrieval, real audio recording, and production Vite bundle (631 kB).
- **Slide 6: National Scalability & Next Steps**
  - Modular schema supporting 100+ qualification packs, tenant isolation for assessment centers, and NeGD/DigiLocker production gateway onboarding.
