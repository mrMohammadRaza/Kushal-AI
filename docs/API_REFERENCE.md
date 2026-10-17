# Kaushal AI — API Reference
**SIH Problem Statement: SIH26242**  
**Core Backend & AI Microservice Endpoints**

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Registers a new informal RPL candidate.
- **Request Body**:
  ```json
  {
    "email": "candidate@example.com",
    "password": "SecurePassword@123",
    "fullName": "Ramesh Kumar Sharma",
    "phone": "+91 98765 43210",
    "tradeId": "electrician-l3",
    "experienceYears": 6,
    "employmentType": "Self-Employed",
    "primaryLanguage": "hi"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "message": "Candidate registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "user-...", "email": "candidate@example.com", "role": "candidate" },
    "candidateProfile": { "id": "cand-...", "trade_id": "electrician-l3" }
  }
  ```

### `POST /api/auth/login`
Authenticates user and returns JWT token with role claims.
- **Request Body**:
  ```json
  {
    "email": "assessor@kaushal.gov.in",
    "password": "Kaushal@2026"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Authentication successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-assessor-01",
      "email": "assessor@kaushal.gov.in",
      "full_name": "Rajesh Varma (Certified Electrical Assessor)",
      "role": "assessor"
    }
  }
  ```

---

## 2. Assessment Endpoints (`/api/assessments`)

### `POST /api/assessments/evaluate`
Ingests multimodal evidence, hashes files, and triggers AI evaluation.
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `candidateId`: String (required)
  - `tradeId`: String (required, e.g. `electrician-l3`)
  - `vivaAnswer`: String (optional verbal text)
  - `practicalImage`: File (optional JPEG/PNG image)
  - `audioViva`: File (optional WebM/WAV audio)
  - `antiFraudAudit`: JSON string (optional liveness audit)
- **Response `201 Created`**:
  ```json
  {
    "id": "asmt-10101",
    "candidateId": "cand-101",
    "tradeId": "electrician-l3",
    "status": "assessor_review_required",
    "overallScore": 84,
    "aiEvaluation": {
      "source": "deterministic-standards-engine",
      "confidenceScore": 0.88,
      "recommendation": "Candidate evidence logged for human review.",
      "nosResults": [...]
    }
  }
  ```

### `POST /api/assessments/:id/signoff`
Certified assessor formal sign-off and PDF report release.
- **Headers**: `Authorization: Bearer <token>`
- **Required Role**: `assessor` or `admin`
- **Request Body**:
  ```json
  {
    "finalDecision": "certified_approved",
    "assessorRemarks": "Competencies verified against NSQF criteria."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "message": "Assessment signed off and official report released.",
    "decision": {
      "decision": "certified_approved",
      "signatureDigest": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    "report": {
      "reportId": "REP-10101-A4B2",
      "reportHash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "qrVerificationUrl": "http://localhost:5000/api/reports/verify/9f86d081884c...",
      "pdfUrl": "/uploads/reports/Report-asmt-10101.pdf"
    }
  }
  ```

---

## 3. Public Verification Endpoint (`/api/reports`)

### `GET /api/reports/verify/:hash`
Public tamper-evident QR verification endpoint.
- **Parameters**: `hash`: 64-character SHA-256 report verification digest.
- **Response `200 OK`**:
  ```json
  {
    "verified": true,
    "issuer": "National Council for Vocational Education and Training (NCVET) / Kaushal AI",
    "reportId": "REP-10101-A4B2",
    "candidate": {
      "name": "Ramesh Kumar Sharma",
      "district": "Varanasi",
      "state": "Uttar Pradesh"
    },
    "qualification": {
      "trade": "Assistant Electrician",
      "qpCode": "ELE/Q1401",
      "nsqfLevel": 3
    },
    "assessmentOutcome": {
      "status": "certified_approved",
      "verifiedScore": "84%",
      "certifiedAssessor": "Rajesh Varma (Certified Electrical Assessor)"
    },
    "integrityCheck": {
      "sha256Digest": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "verificationStatus": "CRYPTOGRAPHICALLY_VERIFIED"
    }
  }
  ```
