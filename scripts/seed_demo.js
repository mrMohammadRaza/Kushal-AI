/**
 * Kaushal AI — Synthetic Demo Data Seed Script (Electrician Trade Demo)
 * Problem Statement: SIH26242
 *
 * Sets up a clean, reproducible demonstration scenario for SIH jury:
 * - Electrician NSQF Level 3 qualification
 * - Synthetic candidate profile: Ramesh Kumar Sharma
 * - Synthetic practical evidence record
 * - Lead assessor assignment: Rajesh Varma
 * - Pre-evaluated assessment case ready for assessor sign-off demonstration
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve dependencies installed in backend
const bcrypt = require('../backend/node_modules/bcryptjs');
const { db, logAuditEvent } = require('../backend/src/data/database');

console.log('----------------------------------------------------');
console.log('KAUSHAL AI (कौशल AI) — SEEDING REPRODUCIBLE DEMO DATA');
console.log('----------------------------------------------------');

const defaultPassword = 'Kaushal@2026';
const passwordHash = bcrypt.hashSync(defaultPassword, 10);

// 1. Ensure Center exists
db.prepare(`
  INSERT INTO assessment_centers (id, center_code, center_name, state, district, active)
  VALUES ('center-01', 'VNS-SKILL-01', 'Varanasi National Vocational Skill Assessment Center', 'Uttar Pradesh', 'Varanasi', 1)
  ON CONFLICT(id) DO UPDATE SET center_name = excluded.center_name
`).run();

// 2. Ensure Users exist
const upsertUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, full_name, role, center_id, phone)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET email = excluded.email, full_name = excluded.full_name
`);

upsertUser.run('user-admin-01', 'admin@kaushal.gov.in', passwordHash, 'Dr. Sunita Rao (Director NCVET)', 'admin', 'center-01', '+91 98100 00001');
upsertUser.run('user-assessor-01', 'assessor@kaushal.gov.in', passwordHash, 'Rajesh Varma (Certified Electrical Assessor)', 'assessor', 'center-01', '+91 98200 00002');
upsertUser.run('user-cand-101', 'ramesh.sharma@skillindia.rpl', passwordHash, 'Ramesh Kumar Sharma', 'candidate', 'center-01', '+91 98765 43210');
upsertUser.run('user-cand-102', 'aslam.ansari@skillindia.rpl', passwordHash, 'Mohammad Aslam Ansari', 'candidate', 'center-01', '+91 98111 22334');

// 3. Ensure Candidate Profiles exist
const upsertCandidate = db.prepare(`
  INSERT INTO candidate_profiles (
    id, user_id, full_name, age, gender, phone, aadhaar_last4, state, district,
    trade_id, informal_experience_years, education_level, current_occupation,
    primary_language, accessibility_pref, profile_photo, enrolled_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET full_name = excluded.full_name, trade_id = excluded.trade_id
`);

upsertCandidate.run(
  'cand-101', 'user-cand-101', 'Ramesh Kumar Sharma', 32, 'Male', '+91 98765 43210', '4589',
  'Uttar Pradesh', 'Varanasi', 'electrician-l3', 6, 'Class 8 Pass',
  'Local House Electrician (Self-Employed)', 'hi', 'Audio Voice Guidance',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
  '2026-03-15'
);

// 4. Create an Assessment Case ready for Assessor Review
const demoAssessmentId = 'asmt-demo-101';

const sampleAiEvaluation = {
  source: 'deterministic-standards-engine',
  tradeId: 'electrician-l3',
  tradeTitle: 'Assistant Electrician',
  qpCode: 'ELE/Q1401',
  nsqfLevel: 3,
  candidateId: 'cand-101',
  overallScore: 84,
  status: 'assessor_review_required',
  recommendation: 'Candidate oral description and practical evidence align with NSQF Level 3 Assistant Electrician criteria. Human assessor verification recommended.',
  confidenceScore: 0.88,
  evidencePresent: {
    hasPracticalPhoto: true,
    hasVivaExplanation: true
  },
  visionAnalysis: {
    imageAudited: true,
    ppeCompliance: {
      helmetDetected: null,
      glovesDetected: true,
      safetyShoesVerified: null,
      ppeScore: 85,
      remarks: "Candidate verified using insulated screwdriver and dielectric gloves."
    },
    workmanshipQuality: {
      toolHandling: "Satisfactory grip on torque screwdriver; correct terminal wire stripping.",
      finishing: "Clean conductor termination into 3-pin socket with earth lead secured.",
      neatnessScore: 82
    },
    toolsIdentified: ["Digital Multimeter", "Insulated Screwdriver", "Wire Stripper", "Combination Pliers"],
    boundingBoxes: [
      {
        label: "Insulated 1000V Screwdriver",
        box_2d: [0.2, 0.25, 0.5, 0.55],
        confidence: 0.92,
        pcCode: "PC1.1"
      },
      {
        label: "Earth Terminal Connection",
        box_2d: [0.45, 0.4, 0.8, 0.8],
        confidence: 0.89,
        pcCode: "PC2.5"
      }
    ]
  },
  vivaTranscript: {
    transcript: "पहले मेन आइसोलेटर कट किया, फिर मल्टीमीटर से फेज और न्यूट्रल की वोल्टेज नापी, और अर्थिंग वायर को प्रॉपर स्क्रू से टाइट किया।",
    transcriptEnglish: "First isolated the main supply, verified line-neutral voltage with a multimeter, and securely tightened the earthing conductor to the terminal.",
    languageDetected: "hi-IN",
    technicalKeywordsFound: ["isolator", "multimeter", "voltage", "earthing", "terminal", "neutral"],
    conceptClarityRating: "High",
    bhashiniTranslationUsed: false,
    timestampCitations: []
  },
  nosResults: [
    {
      nosCode: "ELE/N1401",
      title: "Select, inspect and prepare electrical tools and materials",
      weightage: 20,
      score: 85,
      status: "partially_supported",
      feedback: "Candidate verified tool insulation and prepared appropriate wire gauges."
    },
    {
      nosCode: "ELE/N1402",
      title: "Install wiring, switchboards, and distribution systems",
      weightage: 40,
      score: 82,
      status: "partially_supported",
      feedback: "Demonstrated secure terminal screw connection and conductor stripping."
    },
    {
      nosCode: "ELE/N1403",
      title: "Perform basic earthing and circuit continuity testing",
      weightage: 25,
      score: 86,
      status: "partially_supported",
      feedback: "Continuity testing and earthing polarity explained correctly."
    },
    {
      nosCode: "ELE/N9901",
      title: "Health, safety, and emergency procedures at electrical work sites",
      weightage: 15,
      score: 90,
      status: "partially_supported",
      feedback: "Proper isolation and de-energization sequence followed."
    }
  ],
  strengths: [
    "Extensive practical awareness of electrical isolation and Lockout/Tagout procedures.",
    "Correct wire color coding (Red for Phase, Black for Neutral, Green for Earth) articulated clearly.",
    "Hands-on tool familiarity acquired through 6 years of informal domestic work experience."
  ],
  gapAreas: [
    "Formal single-line schematic notation reading under Bureau of Indian Standards (IS 3043).",
    "Digital job-card record maintenance."
  ],
  bridgeTrainingModules: [
    "Module 1: Bureau of Indian Standards (IS 3043) Earthing & Circuit Schematics",
    "Module 2: Digital Record Keeping & Formal Work Authorization"
  ],
  assessorSignOffRequired: true
};

db.prepare(`
  INSERT INTO assessment_cases (
    id, candidate_id, trade_id, center_id, assigned_assessor_id,
    status, overall_score, recommendation, ai_evaluation_json,
    anti_fraud_audit_json, assessor_notes, signed_off
  ) VALUES (?, ?, ?, 'center-01', 'user-assessor-01', ?, ?, ?, ?, ?, ?, 0)
  ON CONFLICT(id) DO UPDATE SET
    status = excluded.status,
    overall_score = excluded.overall_score,
    recommendation = excluded.recommendation,
    ai_evaluation_json = excluded.ai_evaluation_json
`).run(
  demoAssessmentId,
  'cand-101',
  'electrician-l3',
  'assessor_review_required',
  84,
  sampleAiEvaluation.recommendation,
  JSON.stringify(sampleAiEvaluation),
  JSON.stringify({ livenessVerified: true, confidence: 0.94, gestureRecognized: 'open_palm', antiSpoofCheck: 'Verified Human Subject' }),
  'Awaiting lead assessor sign-off.'
);

// 5. Seed Granular Competency Criteria
db.prepare('DELETE FROM competency_assessments WHERE assessment_id = ?').run(demoAssessmentId);
const insertComp = db.prepare(`
  INSERT INTO competency_assessments (
    id, assessment_id, nos_code, pc_code, criteria_text,
    evidence_status, ai_score, ai_suggestion, evidence_citation
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertComp.run('pc-demo-1', demoAssessmentId, 'ELE/N1401', 'PC1.1', 'Verify insulation rating of hand tools before initiating work', 'partially_supported', 85, 'Verified from photo and spoken explanation.', 'Insulated 1000V screwdriver identified.');
insertComp.run('pc-demo-2', demoAssessmentId, 'ELE/N1402', 'PC2.2', 'Make secure mechanical and electrical connections using proper crimping lugs and terminal screws', 'partially_supported', 82, 'Verified from practical terminal photo.', 'Conductor stripped cleanly without nicking.');
insertComp.run('pc-demo-3', demoAssessmentId, 'ELE/N1403', 'PC3.1', 'Carry out continuity test of Phase, Neutral, and Earth conductors using multimeter', 'partially_supported', 86, 'Verified from viva recording.', 'Candidate explained multimeter continuity setting.');
insertComp.run('pc-demo-4', demoAssessmentId, 'ELE/N9901', 'PC4.1', 'Follow Lock-Out/Tag-Out (LOTO) and de-energization verification procedures prior to contact', 'partially_supported', 90, 'Verified from viva recording.', 'Isolation of 3-phase main switch mentioned first.');

logAuditEvent({
  entityType: 'seed',
  entityId: demoAssessmentId,
  action: 'DEMO_DATASET_INITIALIZED',
  details: { assessmentId: demoAssessmentId, candidate: 'Ramesh Kumar Sharma' }
});

console.log('✓ Assessment Center: center-01 (Varanasi National Vocational Skill Assessment Center)');
console.log('✓ Lead Assessor: assessor@kaushal.gov.in (Rajesh Varma)');
console.log('✓ Candidate: ramesh.sharma@skillindia.rpl (Ramesh Kumar Sharma)');
console.log('✓ Password for all accounts: Kaushal@2026');
console.log(`✓ Preloaded Assessment: ${demoAssessmentId} (Ready for Assessor Sign-Off Demo)`);
console.log('----------------------------------------------------');
console.log('DEMO SEED COMPLETED SUCCESSFULLY');
console.log('----------------------------------------------------');
