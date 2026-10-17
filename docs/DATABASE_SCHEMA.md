# Kaushal AI — Database Schema
**Relational Persistence Engine: SQLite3 (WAL Mode, ACID Transactions, Foreign Keys)**

---

## 1. Relational Entity-Relationship Diagram

```
[assessment_centers]
       │
       ▼
    [users] ───────────────┐
       │ (1:1)             │ (1:N)
       ▼                   ▼
[candidate_profiles]  [assessment_cases] ───────────────┐ (1:N)
       │                   │          │                  ▼
       │                   │ (1:N)    │ (1:N)    [evidence_records]
       ▼                   ▼          ▼
 [occupations] ───► [competency_assessments]    [assessment_decisions]
       │                                                 │ (1:1)
       ▼ (1:N)                                           ▼
[standards_competencies]                             [reports]
```

---

## 2. Table Definitions

### 1. `users`
Stores system accounts with server-enforced roles.
- `id` (TEXT PRIMARY KEY)
- `email` (TEXT UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL) — Bcrypt hashed (10 rounds)
- `full_name` (TEXT NOT NULL)
- `role` (TEXT NOT NULL CHECK(role IN ('candidate', 'assessor', 'center_manager', 'admin', 'auditor')))
- `center_id` (TEXT)
- `phone` (TEXT)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 2. `candidate_profiles`
Stores candidate RPL background, demographics, and consent.
- `id` (TEXT PRIMARY KEY)
- `user_id` (TEXT REFERENCES users(id))
- `full_name` (TEXT NOT NULL)
- `trade_id` (TEXT NOT NULL REFERENCES occupations(id))
- `informal_experience_years` (INTEGER)
- `aadhaar_last4` (TEXT)
- `district` (TEXT), `state` (TEXT)
- `consent_given` (INTEGER DEFAULT 1)

### 3. `assessment_cases`
Lifecycle tracking of RPL assessment dossiers.
- `id` (TEXT PRIMARY KEY)
- `candidate_id` (TEXT REFERENCES candidate_profiles(id))
- `trade_id` (TEXT REFERENCES occupations(id))
- `assigned_assessor_id` (TEXT REFERENCES users(id))
- `status` (TEXT CHECK(status IN ('draft', 'submitted', 'processing', 'assessor_review_required', 'verified_by_assessor', 'requires_practical_test', 'returned_for_evidence', 'approved', 'rejected', 'evidence_missing', 'insufficient_evidence', 'certified_approved', 'conditional_bridge_training', 'requires_practical_demonstration')))
- `overall_score` (INTEGER)
- `ai_evaluation_json` (TEXT)
- `signed_off` (INTEGER DEFAULT 0)
- `signed_off_at` (DATETIME)
- `signed_off_by` (TEXT REFERENCES users(id))

### 4. `evidence_records`
Multimodal practical photos, video frames, and audio viva evidence.
- `id` (TEXT PRIMARY KEY)
- `assessment_id` (TEXT REFERENCES assessment_cases(id) ON DELETE CASCADE)
- `candidate_id` (TEXT REFERENCES candidate_profiles(id))
- `evidence_type` (TEXT CHECK(evidence_type IN ('image', 'audio', 'video', 'document', 'text')))
- `file_path` (TEXT NOT NULL)
- `original_filename` (TEXT NOT NULL)
- `mime_type` (TEXT NOT NULL)
- `file_size` (INTEGER NOT NULL)
- `sha256_hash` (TEXT NOT NULL) — Cryptographic file integrity hash

### 5. `competency_assessments`
Granular performance criteria (PC) evaluation records.
- `id` (TEXT PRIMARY KEY)
- `assessment_id` (TEXT REFERENCES assessment_cases(id) ON DELETE CASCADE)
- `nos_code` (TEXT NOT NULL)
- `pc_code` (TEXT NOT NULL)
- `criteria_text` (TEXT NOT NULL)
- `evidence_status` (TEXT CHECK(evidence_status IN ('not_assessed', 'evidence_missing', 'insufficient_evidence', 'partially_supported', 'requires_practical_test', 'assessor_review_required', 'verified_by_assessor', 'not_demonstrated')))
- `ai_score` (INTEGER), `assessor_score` (INTEGER)
- `evidence_citation` (TEXT)

### 6. `reports`
Tamper-evident assessment reports.
- `id` (TEXT PRIMARY KEY)
- `assessment_id` (TEXT REFERENCES assessment_cases(id) ON DELETE CASCADE)
- `report_version` (INTEGER DEFAULT 1)
- `report_hash` (TEXT UNIQUE NOT NULL) — SHA-256 digest
- `qr_verification_url` (TEXT NOT NULL)
- `pdf_path` (TEXT NOT NULL)
- `released_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 7. `audit_events`
Immutable audit log of all security-sensitive actions.
- `id` (TEXT PRIMARY KEY)
- `entity_type` (TEXT NOT NULL)
- `entity_id` (TEXT NOT NULL)
- `user_id` (TEXT), `user_role` (TEXT)
- `action` (TEXT NOT NULL)
- `details_json` (TEXT)
- `ip_address` (TEXT)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)
