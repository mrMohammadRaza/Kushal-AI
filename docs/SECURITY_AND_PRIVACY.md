# Kaushal AI — Security & Privacy Specification
**Data Protection, Authorization Policies, and Responsible AI Governance**

---

## 1. Authentication & Session Security
- **Algorithm**: HMAC-SHA256 JsonWebTokens (JWT) with 24-hour expiration.
- **Password Protection**: Passwords salted and hashed with Bcrypt (10 rounds).
- **Transport Security**: All sensitive credentials kept server-side; `.env.example` contains only safe placeholder names.

---

## 2. Server-Enforced Role-Based Access Control (RBAC)
Role information provided in request bodies or client headers is strictly disregarded. The server decodes and verifies the cryptographic JWT signature on every protected endpoint:
- **Candidate Isolation**: Candidates can only query assessments and candidate profiles matching their own authenticated user ID. Cross-candidate record access returns `403 Forbidden`.
- **Assessor Sign-Off Protection**: Endpoints `/api/assessments/:id/signoff` and `/api/assessments/:id/score` strictly require `assessor` or `admin` role. Candidate role requests are blocked.
- **Auditor Read-Only Enforcement**: Auditors cannot perform mutations or overrides.

---

## 3. Evidence Integrity & Tamper Prevention
- **SHA-256 Hashes**: Every uploaded image, video frame, and audio viva recording is hashed upon arrival (`crypto.createHash('sha256')`).
- **Cryptographic Signatures**: Assessor sign-offs generate an HMAC-SHA256 signature digest over the assessment ID, assessor ID, decision code, and timestamp.
- **Tamper-Evident QR Verification**: The public verification endpoint `/api/reports/verify/:hash` computes and matches the SHA-256 digest before confirming authenticity.

---

## 4. Privacy & Responsible AI Governance
- **Data Minimization**: Only collects necessary work history and competency evidence. Aadhaar numbers are masked to last 4 digits (`****-****-4589`).
- **Public Verification Privacy**: The public QR verification endpoint returns only candidate name, qualification, and verified outcome. Sensitive personal contact details, Aadhaar numbers, and raw uploaded media are NEVER exposed publicly.
- **Informed Consent**: Explicit candidate declarations and consent are recorded during registration.
- **Human Oversight**: The AI system acts exclusively as an assessment aid. Final qualification determinations are legally and procedurally reserved for qualified human assessors.
- **Fairness**: Candidates are evaluated against deterministic competency criteria rather than demographic proxies, accents, or recording equipment quality.
