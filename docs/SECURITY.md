# Kaushal AI — Security Architecture & Governance Specification
**Document Version:** 1.0.0  
**Compliance Standard:** NSQF RPL Level 5 Guidelines, CERT-In Secure Coding Best Practices, NeGD DigiLocker Security Guidelines  

---

## 1. Authentication & Session Architecture

### 1.1 Password Hashing & Salt Derivation
- Passwords are encrypted using **bcrypt** with a minimum cost factor of `10`.
- Plaintext passwords are never stored in the database, caches, or memory dumps.
- Server-side validation rejects weak passwords during registration (minimum 8 alphanumeric characters).

### 1.2 JWT Token Lifecycle
- Authentication issues an HMAC-SHA256 signed JSON Web Token (JWT).
- **Token Claims:** `id`, `email`, `role`, `center_id`.
- **Token Expiry:** 24 hours (`24h`).
- **Secret Management:** Secrets are provided exclusively via the `JWT_SECRET` environment variable. Production environments fail startup if `JWT_SECRET` is missing or less than 32 characters.
- **Client Session Management:** The frontend stores JWTs in `localStorage` under `kaushal_ai_auth_token`. On application load, tokens are verified against `/api/auth/me`. If a token is expired or invalid (HTTP 401), client storage is cleared and the user is redirected to the login view.

---

## 2. Server-Enforced Role-Based Access Control (RBAC)

Authorization is strictly enforced by server middleware (`authenticateToken` and `requireRole`). UI elements that restrict controls are supplementary; server endpoints reject unauthorized operations regardless of client state.

### 2.1 Role-Permission Matrix

| Operation / Endpoint | Candidate | Assessor | Center Manager | Platform Admin | Auditor |
|---|---|---|---|---|---|
| **Register Account** (`POST /api/auth/register`) | Allowed | Admin only | Admin only | Allowed | Denied |
| **Login** (`POST /api/auth/login`) | Allowed | Allowed | Allowed | Allowed | Allowed |
| **Get Self Profile** (`GET /api/auth/me`) | Self only | Self only | Self only | Self only | Self only |
| **Start Assessment** (`POST /api/assessments/start`) | Self only | Denied | Denied | Allowed | Denied |
| **Submit Code / Knowledge** (`POST /api/assessments/:id/*`) | Self (Assigned) | Denied | Denied | Denied | Denied |
| **Run Sandbox Tests** (`POST /api/assessments/:id/run-code-tests`) | Self (Assigned) | Denied | Denied | Allowed | Denied |
| **View Assessment Queue** (`GET /api/assessments`) | Denied | Assigned only | Center only | All | All (Read) |
| **Assessor Sign-Off** (`POST /api/assessments/:id/signoff`) | **Denied** | Assigned only | Denied | Allowed | Denied |
| **Request Evidence / Retest** (`POST /api/assessments/:id/request-evidence`) | Denied | Assigned only | Denied | Allowed | Denied |
| **View Official Report** (`GET /api/reports/:id`) | Self only | Assigned only | Center only | All | All (Read) |
| **Download Official PDF** (`GET /api/reports/download/:id`) | Self only | Assigned only | Center only | All | All (Read) |
| **Public QR Verification** (`GET /api/reports/verify/:hash`) | Public | Public | Public | Public | Public |
| **Push to DigiLocker** (`POST /api/digilocker/push/:id`) | Self (Approved) | Assigned (Approved) | Center (Approved) | Allowed | Denied |
| **Create Candidate Profile** (`POST /api/candidates`) | **Denied** | Allowed | Allowed | Allowed | Denied |
| **View Audit Trail** (`GET /api/audit-trail`) | Denied | Denied | Center only | All | All |

### 2.2 Object-Level Data Isolation (Anti-IDOR)
- **Candidate Isolation:** Candidates can only access assessment cases, progress updates, and reports where `candidate_profiles.user_id === req.user.id`.
- **Assessor Assignment:** Assessors can only inspect dossiers and execute sign-offs for assessments where `assigned_assessor_id === req.user.id`.
- **Center Isolation:** Center Managers are restricted to candidates and assessments associated with their `center_id`.
- **Public Verification Privacy:** The public QR verification endpoint (`/api/reports/verify/:hash`) returns only non-sensitive outcome data (candidate name, qualification, NSQF level, status). Aadhaar, phone numbers, raw evidence, and internal assessor remarks are strictly stripped.

---

## 3. Sandboxing & Code Execution Security

Practical coding evaluations execute in an isolated V8 environment using the Node.js `vm` module:
- **Sandbox Pre-Filter:** Candidate scripts are validated against dangerous patterns before execution:
  - `process` and `child_process`
  - Dynamic `require()` and `import()`
  - Filesystem access (`fs`)
  - Dynamic evaluation (`eval`, `Function`)
  - Prototype manipulation (`constructor.constructor`, `__proto__`)
- **Execution Timeout:** Script execution is capped at `1500 ms` to prevent infinite loops and denial-of-service (DoS) attacks.
- **Isolated Context:** The sandbox context provides only mock DOM representations and isolated assertion primitives.

---

## 4. Evidence Integrity & Cryptographic Hashing

- **Evidence Storage:** Uploaded files and camera captures are written to `backend/uploads/` with sanitized, randomized filenames to prevent directory traversal (`../`).
- **Integrity Digest:** All files (resumes, practical images, viva audio) have their **SHA-256** checksum calculated upon upload and stored immutably in `evidence_records`.
- **Access Control:** The `/uploads/` route requires JWT authentication. Static file serving bypasses are blocked.
- **No Verification Fabrication:** Newly uploaded files are tagged as `uploaded`. Files are only marked `verified` after an authorized human assessor reviews the dossier.

---

## 5. DigiLocker Integration Security

- **Status Enforcement:** Credentials cannot be generated for assessments in draft, submitted, or conditional status. Only assessments with `signed_off = 1` and approved outcomes can issue credentials.
- **Cryptographic Signature:** NeGD-compliant XML payloads are digitally signed using HMAC-SHA256 with the secret `DIGILOCKER_API_KEY`.
- **Audit Logging:** Every DigiLocker push event is recorded in the platform audit trail with actor details, timestamps, and document URIs.

---

## 6. Remaining Risks & Mitigations

1. **Local Filesystem in Serverless Environments:**  
   *Risk:* In ephemeral serverless deployments (e.g. Vercel Functions), uploads stored in `backend/uploads/` do not persist across invocations.  
   *Mitigation:* For production deployments on Vercel or AWS Lambda, configure cloud object storage (AWS S3 or Supabase Storage) via environment variables.
2. **SQLite Concurrent Writes under Massive Scale:**  
   *Risk:* SQLite WAL mode supports high read throughput, but concurrent writes from multiple worker processes can experience table locking.  
   *Mitigation:* For multi-instance horizontal scaling, connect to PostgreSQL / Supabase via the existing database adapter.
3. **AI Vision & Voice Availability:**  
   *Risk:* When external Gemini API quotas are exhausted or internet connectivity is disrupted, multi-modal analysis falls back to the deterministic local rule engine.  
   *Mitigation:* The multi-tier architecture automatically falls back to Tier 2 (local heuristics) without crashing or marking candidates as passed prematurely.
