/**
 * Dedicated Demo Seeding Script for Kaushal AI
 * Run via: npm run seed:demo
 */
const { db } = require('../data/database');
const bcrypt = require('bcryptjs');

function runDemoSeed() {
  console.log('[Seed Demo] Initializing demo data for Kaushal AI...');

  const passwordHash = bcrypt.hashSync('Kaushal@2026', 10);

  // 1. Default Assessment Center
  db.prepare(`
    INSERT OR IGNORE INTO assessment_centers (id, center_code, center_name, state, district)
    VALUES ('center-01', 'VNS-SKILL-01', 'Varanasi National Vocational Skill Assessment Center', 'Uttar Pradesh', 'Varanasi')
  `).run();

  // 2. Users (Use INSERT OR IGNORE so existing relations are never disrupted)
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role, center_id, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('user-admin-01', 'admin@kaushal.gov.in', passwordHash, 'Dr. Sunita Rao (Director NCVET)', 'admin', 'center-01', '+91 98100 00001');
  insertUser.run('user-assessor-01', 'assessor@kaushal.gov.in', passwordHash, 'Rajesh Varma (Certified Assessor)', 'assessor', 'center-01', '+91 98200 00002');
  insertUser.run('user-mgr-01', 'manager@kaushal.gov.in', passwordHash, 'Anil Tripathi (Center Superintendent)', 'center_manager', 'center-01', '+91 98300 00003');
  insertUser.run('user-auditor-01', 'auditor@kaushal.gov.in', passwordHash, 'Pooja Iyer (Third-Party Quality Auditor)', 'auditor', 'center-01', '+91 98400 00004');
  insertUser.run('user-cand-103', 'dev.candidate@skillindia.rpl', passwordHash, 'Aarav Sharma (Web Developer)', 'candidate', 'center-01', '+91 98450 12345');

  // Update password hashes if they already existed
  db.prepare(`UPDATE users SET password_hash = ? WHERE email IN ('admin@kaushal.gov.in', 'assessor@kaushal.gov.in', 'dev.candidate@skillindia.rpl')`).run(passwordHash);

  // Ensure candidate user_id linkage
  db.prepare(`UPDATE candidate_profiles SET user_id = 'user-cand-103' WHERE id = 'cand-103'`).run();

  // 3. Candidate Profile (Use INSERT OR IGNORE)
  db.prepare(`
    INSERT OR IGNORE INTO candidate_profiles (
      id, user_id, full_name, age, gender, phone, aadhaar_last4, state, district,
      trade_id, informal_experience_years, education_level, current_occupation,
      primary_language, accessibility_pref, profile_photo, enrolled_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cand-103', 'user-cand-103', 'Aarav Sharma', 26, 'Male', '+91 98450 12345', null,
    'Karnataka', 'Bengaluru Urban', 'web-developer-l5', 3, 'Diploma in Computer Applications',
    'Freelance Frontend & Web Developer', 'en', 'Standard',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    '2026-04-01'
  );

  console.log('[Seed Demo] Demo credentials and candidate profile successfully verified.');
  console.log('  Admin:     admin@kaushal.gov.in / Kaushal@2026');
  console.log('  Assessor:  assessor@kaushal.gov.in / Kaushal@2026');
  console.log('  Candidate: dev.candidate@skillindia.rpl / Kaushal@2026');
}

if (require.main === module) {
  runDemoSeed();
  process.exit(0);
}

module.exports = { runDemoSeed };
