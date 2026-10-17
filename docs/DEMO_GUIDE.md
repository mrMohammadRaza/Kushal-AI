# Kaushal AI — SIH Jury Demonstration Script
**Step-by-Step Walkthrough for Problem Statement SIH26242**

---

## 1. Demo Scenario Overview
- **Occupation**: Assistant Electrician (NSQF Level 3, QP Code: ELE/Q1401).
- **Candidate Profile**: Ramesh Kumar Sharma (6 years informal house wiring experience in Varanasi).
- **Lead Assessor**: Rajesh Varma (Certified Electrical Assessor, Sector Skill Council).
- **Demo Seed Command**:
  ```bash
  node scripts/seed_demo.js
  ```

---

## 2. Live Demonstration Flow

### Step 1: Candidate Sign-In & Trade Selection
1. Open the web interface at `http://localhost:5173`.
2. Tap **Login / Register** in the top navigation bar.
3. Select **Ramesh Kumar Sharma** or sign in with:
   - Email: `ramesh.sharma@skillindia.rpl`
   - Password: `Kaushal@2026`
4. On **View A: Trades**, select **Assistant Electrician (Level 3)**.
5. Review the mandatory PPE requirements (1000V dielectric gloves, eye protection) and standard tools.

### Step 2: Evidence Submission & Real Audio Recording
1. Advance to **View B: Evidence**.
2. Tap **1-Tap Use Demo Photo** to load practical wiring evidence.
3. Tap the pulsating **Mic Button** to record a live viva explanation (e.g., in Hindi: *"पहले 3-फेज आइसोलेटर काटा, मल्टीमीटर से वोल्टेज चेक किया और अर्थिंग वायर टाइट किया"*).
4. Tap the **Play** button to listen back to the real recorded audio.
5. Notice the Devanagari text transcribed into the candidate explanation box.
6. Click **Submit for Assessment**.

### Step 3: AI Diagnosis & Gap Analysis
1. View the **Diagnosis Screen**:
   - Status: `assessor_review_required` (Notice: It does NOT auto-certify!).
   - Circular competency score gauge.
   - Granular NOS breakdown (ELE/N1401, ELE/N1402, ELE/N1403, ELE/N9901).
   - Identified strengths and gap areas.
   - Recommended bridge training modules (IS 3043 Earthing & Schematics).

### Step 4: Assessor Workstation Review & Human Sign-Off
1. Navigate to **XAI Assessor Console**.
2. Inspect the practical photo with explainable tool & terminal bounding boxes.
3. Listen to the original candidate audio via the embedded player.
4. Open the **Assessor Co-Pilot** panel and query: *"What are the earthing resistance limits under IS 3043?"*
5. Select Verdict: **✓ Certify & Endorse Qualification (Passed)**.
6. Enter assessor remarks and click **Sign Off & Release Report**.

### Step 5: PDF Report & QR Verification
1. Click **Download PDF** to inspect the generated official assessment report.
2. Observe the candidate details, competency findings table, evidence SHA-256 hashes, assessor digital signature, and verification QR code.
3. Click the verification link to inspect `GET /api/reports/verify/:hash` showing cryptographic authenticity.

### Step 6: Negative Security Demonstration
1. Demonstrate that logging in as a candidate and attempting to POST to `/api/assessments/:id/signoff` returns `403 Forbidden`.
2. Demonstrate that submitting empty evidence returns `evidence_missing` with null score, proving the engine refuses to fabricate passing grades.
