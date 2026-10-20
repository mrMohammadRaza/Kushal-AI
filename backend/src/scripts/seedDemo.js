/**
 * Dedicated SIH Demo Seeding Script for Kaushal AI
 * Run via: npm run seed:demo
 * Reset via: npm run seed:demo -- --clean
 */
const { db } = require('../data/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function runDemoSeed(options = {}) {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !process.env.FORCE_DEMO_SEED) {
    console.warn('[Seed Demo] Production environment detected. Skipping demo account creation for security.');
    return;
  }

  const isClean = options.clean || process.argv.includes('--clean') || process.argv.includes('--reset');

  if (isClean) {
    console.log('[Seed Demo] Cleaning up existing SIH demo account records...');
    try {
      db.prepare("DELETE FROM reports WHERE assessment_id = 'asmt-demo-sih'").run();
      db.prepare("DELETE FROM competency_assessments WHERE assessment_id = 'asmt-demo-sih'").run();
      db.prepare("DELETE FROM evidence_records WHERE candidate_id = 'cand-demo-sih'").run();
      db.prepare("DELETE FROM assessment_cases WHERE candidate_id = 'cand-demo-sih'").run();
      db.prepare("DELETE FROM candidate_profiles WHERE id = 'cand-demo-sih'").run();
      db.prepare("DELETE FROM users WHERE email = 'demo@kushalai.local' OR id = 'user-demo-sih'").run();
      console.log('[Seed Demo] Demo account records removed successfully.');
    } catch (cleanErr) {
      console.warn('[Seed Demo] Cleanup notice:', cleanErr.message);
    }

    if (process.argv.includes('--clean-only')) {
      return;
    }
  }

  console.log('[Seed Demo] Initializing SIH Presentation Demo Account and Sample Data...');

  // Securely hash passwords
  const sihDemoPasswordHash = bcrypt.hashSync('KushalDemo@2026!', 10);
  const generalDemoPasswordHash = bcrypt.hashSync('Kaushal@2026', 10);

  // 1. Default Assessment Center
  db.prepare(`
    INSERT OR IGNORE INTO assessment_centers (id, center_code, center_name, state, district)
    VALUES ('center-01', 'VNS-SKILL-01', 'Varanasi National Vocational Skill Assessment Center', 'Uttar Pradesh', 'Varanasi')
  `).run();

  // 2. Base Platform Staff Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, center_id, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      email = excluded.email,
      password_hash = excluded.password_hash,
      full_name = excluded.full_name,
      role = excluded.role,
      center_id = excluded.center_id,
      phone = excluded.phone
  `);

  insertUser.run('user-admin-01', 'admin@kaushal.gov.in', generalDemoPasswordHash, 'Dr. Sunita Rao (Director NCVET)', 'admin', 'center-01', '+91 98100 00001');
  insertUser.run('user-assessor-01', 'assessor@kaushal.gov.in', generalDemoPasswordHash, 'Rajesh Varma (Lead Assessor)', 'assessor', 'center-01', '+91 98200 00002');
  insertUser.run('user-mgr-01', 'manager@kaushal.gov.in', generalDemoPasswordHash, 'Anil Tripathi (Center Superintendent)', 'center_manager', 'center-01', '+91 98300 00003');
  insertUser.run('user-auditor-01', 'auditor@kaushal.gov.in', generalDemoPasswordHash, 'Pooja Iyer (Third-Party Quality Auditor)', 'auditor', 'center-01', '+91 98400 00004');

  // 3. Dedicated SIH Presentation Demo Candidate Accounts
  // A. SIH Lead Candidate (Web Developer)
  insertUser.run(
    'user-demo-sih',
    'demo@kushalai.local',
    sihDemoPasswordHash,
    'Priya Sharma (SIH Demo Candidate)',
    'candidate',
    'center-01',
    '+91 98765 00000'
  );

  // B. Electrician Demo Candidate
  insertUser.run(
    'user-demo-electrician',
    'electrician.demo@kushalai.local',
    generalDemoPasswordHash,
    'Ramesh Kumar Sharma',
    'candidate',
    'center-01',
    '+91 98765 43210'
  );

  // C. Automotive Mechanic Demo Candidate
  insertUser.run(
    'user-demo-mechanic',
    'mechanic.demo@kushalai.local',
    generalDemoPasswordHash,
    'Mohammad Aslam Ansari',
    'candidate',
    'center-01',
    '+91 98111 22334'
  );

  // D. Solar PV Installer Demo Candidate
  insertUser.run(
    'user-demo-solar',
    'solar.demo@kushalai.local',
    generalDemoPasswordHash,
    'Amit Patel',
    'candidate',
    'center-01',
    '+91 98980 11223'
  );

  // 4. Candidate Profiles for Demo Accounts
  const insertCandidateProfile = db.prepare(`
    INSERT INTO candidate_profiles (
      id, user_id, full_name, age, gender, phone, aadhaar_last4, state, district,
      trade_id, informal_experience_years, education_level, current_occupation,
      primary_language, accessibility_pref, profile_photo, enrolled_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      full_name = excluded.full_name,
      age = excluded.age,
      gender = excluded.gender,
      phone = excluded.phone,
      aadhaar_last4 = excluded.aadhaar_last4,
      state = excluded.state,
      district = excluded.district,
      trade_id = excluded.trade_id,
      informal_experience_years = excluded.informal_experience_years,
      education_level = excluded.education_level,
      current_occupation = excluded.current_occupation,
      primary_language = excluded.primary_language,
      accessibility_pref = excluded.accessibility_pref,
      profile_photo = excluded.profile_photo,
      enrolled_date = excluded.enrolled_date
  `);

  insertCandidateProfile.run(
    'cand-demo-sih',
    'user-demo-sih',
    'Priya Sharma',
    25,
    'Female',
    '+91 98765 00000',
    '8899',
    'Uttar Pradesh',
    'Varanasi',
    'web-developer-l5',
    4,
    'Diploma in Computer Science / IT',
    'Freelance Frontend Web & UI Developer',
    'en',
    'Standard',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    '2026-04-10'
  );

  insertCandidateProfile.run(
    'cand-demo-electrician',
    'user-demo-electrician',
    'Ramesh Kumar Sharma',
    34,
    'Male',
    '+91 98765 43210',
    '4589',
    'Uttar Pradesh',
    'Varanasi',
    'electrician-l3',
    6,
    'Class 10 Pass',
    'Domestic & Commercial Electrician',
    'hi',
    'Audio Voice Guidance',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    '2026-03-15'
  );

  insertCandidateProfile.run(
    'cand-demo-mechanic',
    'user-demo-mechanic',
    'Mohammad Aslam Ansari',
    29,
    'Male',
    '+91 98111 22334',
    '7812',
    'Bihar',
    'Patna',
    'automotive-l4',
    8,
    'Class 10 Pass + ITI Mechanic',
    'Automotive Diagnostic Technician',
    'hi',
    'Standard',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    '2026-03-20'
  );

  insertCandidateProfile.run(
    'cand-demo-solar',
    'user-demo-solar',
    'Amit Patel',
    27,
    'Male',
    '+91 98980 11223',
    '6521',
    'Gujarat',
    'Ahmedabad',
    'solar-l4',
    5,
    'Class 12 Pass',
    'Rooftop Solar PV Installation Specialist',
    'en',
    'Standard',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    '2026-04-05'
  );

  // 5. Realistic Sample Assessment Workflow Case
  const sampleKnowledge = {
    "q1": "a", // Key benefits of semantic HTML5
    "q2": "c", // Responsive layout via Flexbox/Grid
    "q3": "b", // Async API error handling
    "q4": "d"  // Accessibility ARIA labels
  };

  const sampleCoding = `// CounterComponent.jsx - Tested & Verified
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 border rounded shadow-sm text-center">
      <h3 className="text-xl font-bold mb-2">Counter: {count}</h3>
      <div className="flex justify-center gap-3">
        <button 
          onClick={() => setCount(c => c - 1)}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Decrease
        </button>
        <button 
          onClick={() => setCount(0)}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Increase
        </button>
      </div>
    </div>
  );
}`;

  const sampleDebug = `// Fixed async API fetcher with proper state handling and error catch
async function fetchCandidateProfile(candidateId) {
  try {
    const response = await fetch(\`/api/candidates/\${candidateId}\`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Fetch error:', err.message);
    throw err;
  }
}`;

  const sampleTestResults = [
    { name: "Initial state renders with zero", passed: true, score: 25 },
    { name: "Increment button updates state count by +1", passed: true, score: 25 },
    { name: "Decrement button decreases count by -1", passed: true, score: 25 },
    { name: "Reset button cleanly resets state back to 0", passed: true, score: 25 }
  ];

  const sampleRubricScores = {
    knowledge: 85,
    coding: 90,
    debug: 80,
    viva: 88,
    overall: 86
  };

  db.prepare(`
    INSERT INTO assessment_cases (
      id, candidate_id, trade_id, center_id, assigned_assessor_id,
      status, overall_score, recommendation, current_step, template_id,
      knowledge_submission_json, coding_submission_json, debug_submission_json,
      explanation_text, test_results_json, rubric_scores_json,
      created_at, updated_at
    ) VALUES (
      'asmt-demo-sih', 'cand-demo-sih', 'web-developer-l5', 'center-01', 'user-assessor-01',
      'assessor_review_required', 86, 'Demonstrated high competence across React UI component design, async state handling, and unit testing. Recommended for NSQF Level 5 Certification.', 'results', 'tpl-web-developer-v1',
      ?, ?, ?,
      'I developed responsive user interface modules, integrated RESTful APIs with error fallbacks, and conducted component tests.',
      ?, ?,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      overall_score = excluded.overall_score,
      recommendation = excluded.recommendation,
      current_step = excluded.current_step,
      knowledge_submission_json = excluded.knowledge_submission_json,
      coding_submission_json = excluded.coding_submission_json,
      debug_submission_json = excluded.debug_submission_json,
      test_results_json = excluded.test_results_json,
      rubric_scores_json = excluded.rubric_scores_json,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    JSON.stringify(sampleKnowledge),
    sampleCoding,
    sampleDebug,
    JSON.stringify(sampleTestResults),
    JSON.stringify(sampleRubricScores)
  );

  // 6. Realistic Competency Assessments
  const insertCompetency = db.prepare(`
    INSERT OR REPLACE INTO competency_assessments (
      id, assessment_id, nos_code, pc_code, criteria_text,
      evidence_status, ai_score, ai_suggestion, assessor_score, assessor_comments
    ) VALUES (?, 'asmt-demo-sih', ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCompetency.run(
    'comp-demo-01',
    'NOS-WD-01',
    'PC-01.1',
    'Design and implement responsive layout components conforming to NSQF Level 5 standards',
    'verified_by_assessor',
    90,
    'Code cleanly handles flexbox, CSS grid, and responsive styling tokens.',
    90,
    'Verified working code and clear semantic markup.'
  );

  insertCompetency.run(
    'comp-demo-02',
    'NOS-WD-02',
    'PC-02.1',
    'Integrate asynchronous RESTful endpoints and maintain reactive state management',
    'verified_by_assessor',
    85,
    'Async fetch pattern properly catches non-200 HTTP statuses and logs errors.',
    85,
    'Good error boundary and state handling.'
  );

  insertCompetency.run(
    'comp-demo-03',
    'NOS-WD-03',
    'PC-03.1',
    'Debug front-end software modules and ensure cross-device accessibility',
    'verified_by_assessor',
    82,
    'Debugger test suite passed all test assertions without regressions.',
    84,
    'Demonstrated solid problem diagnosis methodology.'
  );

  // 7. Verified Report & QR Verification Record
  const sampleReportHash = crypto.createHash('sha256').update('asmt-demo-sih-priya-sharma-2026').digest('hex');
  db.prepare(`
    INSERT OR REPLACE INTO reports (
      id, assessment_id, report_version, report_hash, qr_verification_url, pdf_path, released_by, released_at
    ) VALUES (
      'rep-demo-sih', 'asmt-demo-sih', 1, ?, ?, '/uploads/reports/rep-demo-sih.pdf', 'user-assessor-01', CURRENT_TIMESTAMP
    )
  `).run(
    sampleReportHash,
    `http://localhost:5000/api/reports/verify/${sampleReportHash}`
  );

  console.log('[Seed Demo] ========================================================');
  console.log('[Seed Demo] SIH Presentation Demo Account Initialized Successfully:');
  console.log('[Seed Demo]   Email:       demo@kushalai.local');
  console.log('[Seed Demo]   Password:    KushalDemo@2026!');
  console.log('[Seed Demo]   Candidate:   Priya Sharma (cand-demo-sih)');
  console.log('[Seed Demo]   Trade:       Web Developer (NSQF Level 5)');
  console.log('[Seed Demo]   Assessment:  asmt-demo-sih (Score: 86%, Ready for Review)');
  console.log('[Seed Demo] ========================================================');
  console.log('[Seed Demo] Staff Credentials:');
  console.log('[Seed Demo]   Lead Assessor: assessor@kaushal.gov.in / Kaushal@2026');
  console.log('[Seed Demo]   Admin:         admin@kaushal.gov.in / Kaushal@2026');
  console.log('[Seed Demo] ========================================================');
}

if (require.main === module) {
  runDemoSeed();
  process.exit(0);
}

module.exports = { runDemoSeed };
