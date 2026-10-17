# Kaushal AI — Automated Testing & Verification
**Test Execution Results, Coverage, and Negative Security Tests**

---

## 1. Automated Test Suite Summary

Total Automated Tests: **20 Tests (100% Passing)**
- **Backend (Node.js / Express / Jest / Supertest)**: 15 Tests
- **AI Microservice (Python / FastAPI / Pytest / HTTPX)**: 5 Tests

---

## 2. Test Execution Commands & Verified Results

### Backend Automated Test Suite
Command:
```bash
npm --prefix backend test
```
Actual Output:
```
PASS tests/evidence_integrity_and_scoring.test.js
PASS tests/reports_and_verification.test.js
PASS tests/auth_and_rbac.test.js

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        93.29 s
```

### AI Microservice Automated Test Suite
Command:
```bash
cd ai-service && .venv\Scripts\python -m pytest -v tests
```
Actual Output:
```
tests/test_ai_pipeline.py::test_health_endpoint PASSED                   [ 20%]
tests/test_ai_pipeline.py::test_rag_competency_search PASSED             [ 40%]
tests/test_ai_pipeline.py::test_evaluate_missing_evidence_never_certifies PASSED [ 60%]
tests/test_ai_pipeline.py::test_evaluate_with_viva_requires_human_assessor_review PASSED [ 80%]
tests/test_ai_pipeline.py::test_gemini_copilot_chat PASSED               [100%]

======================== 5 passed in 0.94s =========================
```

---

## 3. Negative Security & Boundary Tests Verified
1. **Missing Evidence Rule**: Verified that empty practical evidence yields `evidence_missing` and null score, never a passing grade.
2. **Auto-Certification Ban**: Verified that candidates cannot be marked `Certified` by the AI engine; status transitions require assessor sign-off.
3. **Privilege Escalation Prevention**: Verified that a user with role `candidate` calling `/api/assessments/:id/signoff` receives `403 Forbidden`.
4. **Authentication Enforcement**: Verified that unauthenticated requests to sign-off or scoring routes receive `401 Unauthorized`.
5. **Double Sign-Off Prevention**: Verified that attempting to sign off an already finalized assessment is rejected with `400 Bad Request`.
6. **QR Verification Privacy**: Verified that `/api/reports/verify/:hash` does not leak candidate Aadhaar, phone, or raw uploaded files.
7. **Invalid QR Hash Handling**: Verified that modified or nonexistent verification digests return `404 Not Found`.
