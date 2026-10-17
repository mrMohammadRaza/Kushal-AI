const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'kaushal_ai.db');
const STANDARDS_PATH = path.join(__dirname, '..', '..', '..', 'data', 'nsqf_standards.json');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initializes relational tables and indexes according to SIH26242 RPL architecture.
 */
function initSchema() {
  db.exec(`
    -- 1. Users Table (Role-Based Access Control)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('candidate', 'assessor', 'center_manager', 'admin', 'auditor')),
      center_id TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Assessment Centers
    CREATE TABLE IF NOT EXISTS assessment_centers (
      id TEXT PRIMARY KEY,
      center_code TEXT UNIQUE NOT NULL,
      center_name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Candidate Profiles
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      full_name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      aadhaar_last4 TEXT,
      state TEXT,
      district TEXT,
      trade_id TEXT NOT NULL,
      informal_experience_years INTEGER DEFAULT 0,
      education_level TEXT,
      current_occupation TEXT,
      primary_language TEXT DEFAULT 'hi',
      accessibility_pref TEXT DEFAULT 'Standard',
      consent_given INTEGER DEFAULT 1,
      profile_photo TEXT,
      enrolled_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Occupations & Qualification Packs
    CREATE TABLE IF NOT EXISTS occupations (
      id TEXT PRIMARY KEY,
      sector TEXT NOT NULL,
      trade TEXT NOT NULL,
      qp_code TEXT NOT NULL,
      nsqf_level INTEGER NOT NULL,
      description TEXT,
      version TEXT DEFAULT '1.0',
      active INTEGER DEFAULT 1
    );

    -- 5. Standards & Competencies (NOS & Performance Criteria)
    CREATE TABLE IF NOT EXISTS standards_competencies (
      id TEXT PRIMARY KEY,
      trade_id TEXT REFERENCES occupations(id) ON DELETE CASCADE,
      nos_code TEXT NOT NULL,
      title TEXT NOT NULL,
      weightage INTEGER NOT NULL,
      performance_criteria_json TEXT NOT NULL,
      knowledge_criteria_json TEXT NOT NULL
    );

    -- 6. Assessment Cases (Workflow lifecycle)
    CREATE TABLE IF NOT EXISTS assessment_cases (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE RESTRICT,
      trade_id TEXT NOT NULL REFERENCES occupations(id),
      center_id TEXT REFERENCES assessment_centers(id),
      assigned_assessor_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN (
        'draft',
        'submitted',
        'processing',
        'assessor_review_required',
        'verified_by_assessor',
        'requires_practical_test',
        'returned_for_evidence',
        'approved',
        'rejected',
        'evidence_missing',
        'insufficient_evidence',
        'certified_approved',
        'conditional_bridge_training',
        'requires_practical_demonstration'
      )),
      overall_score INTEGER,
      recommendation TEXT,
      ai_evaluation_json TEXT,
      anti_fraud_audit_json TEXT,
      assessor_notes TEXT,
      assessor_override_json TEXT,
      signed_off INTEGER DEFAULT 0,
      signed_off_at DATETIME,
      signed_off_by TEXT REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Evidence Records (Multimodal Practical & Verbal Evidence)
    CREATE TABLE IF NOT EXISTS evidence_records (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL REFERENCES assessment_cases(id) ON DELETE CASCADE,
      candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id),
      evidence_type TEXT NOT NULL CHECK(evidence_type IN ('image', 'audio', 'video', 'document', 'text')),
      file_path TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      sha256_hash TEXT NOT NULL,
      metadata_json TEXT,
      status TEXT DEFAULT 'uploaded' CHECK(status IN ('uploaded', 'verified', 'flagged', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Competency Assessments (Per-PC granular evaluation)
    CREATE TABLE IF NOT EXISTS competency_assessments (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL REFERENCES assessment_cases(id) ON DELETE CASCADE,
      nos_code TEXT NOT NULL,
      pc_code TEXT NOT NULL,
      criteria_text TEXT NOT NULL,
      evidence_status TEXT NOT NULL DEFAULT 'not_assessed' CHECK(evidence_status IN (
        'not_assessed',
        'evidence_missing',
        'insufficient_evidence',
        'partially_supported',
        'requires_practical_test',
        'assessor_review_required',
        'verified_by_assessor',
        'not_demonstrated'
      )),
      ai_score INTEGER,
      ai_suggestion TEXT,
      evidence_citation TEXT,
      assessor_score INTEGER,
      assessor_comments TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 9. Assessment Decisions (Immutable Assessor Sign-Off)
    CREATE TABLE IF NOT EXISTS assessment_decisions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL REFERENCES assessment_cases(id) ON DELETE CASCADE,
      assessor_id TEXT NOT NULL REFERENCES users(id),
      decision TEXT NOT NULL CHECK(decision IN (
        'certified_approved',
        'conditional_bridge_training',
        'requires_practical_demonstration',
        'insufficient_evidence',
        'rejected'
      )),
      remarks TEXT NOT NULL,
      score_adjustments_json TEXT,
      signature_digest TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 10. Official Assessment Reports & Public QR Verification
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL REFERENCES assessment_cases(id) ON DELETE CASCADE,
      report_version INTEGER DEFAULT 1,
      report_hash TEXT UNIQUE NOT NULL,
      qr_verification_url TEXT NOT NULL,
      pdf_path TEXT,
      released_by TEXT REFERENCES users(id),
      released_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 11. Traceable Audit Events (Immutable Security & Governance Log)
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      user_id TEXT,
      user_role TEXT,
      action TEXT NOT NULL,
      details_json TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. Asynchronous AI Processing Jobs
    CREATE TABLE IF NOT EXISTS processing_jobs (
      id TEXT PRIMARY KEY,
      assessment_id TEXT REFERENCES assessment_cases(id) ON DELETE CASCADE,
      job_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN (
        'queued', 'processing', 'completed', 'needs_review', 'failed', 'unavailable'
      )),
      correlation_id TEXT NOT NULL,
      error_message TEXT,
      started_at DATETIME,
      completed_at DATETIME
    );

    -- Indexes for high-performance querying
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_assessment_candidate ON assessment_cases(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_assessment_assessor ON assessment_cases(assigned_assessor_id);
    CREATE INDEX IF NOT EXISTS idx_assessment_status ON assessment_cases(status);
    CREATE INDEX IF NOT EXISTS idx_evidence_assessment ON evidence_records(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_competency_assessment ON competency_assessments(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_reports_hash ON reports(report_hash);
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);
  `);
}

/**
 * Seeds official NSQF standards without populating demo users or credentials.
 */
function seedStandardsOnly() {
  const occCount = db.prepare('SELECT COUNT(*) as count FROM occupations').get().count;
  if (occCount > 0) return;

  const pathsToTry = [
    STANDARDS_PATH,
    path.join(__dirname, '..', '..', 'data', 'nsqf_standards.json'),
    path.join(__dirname, '..', '..', '..', 'data', 'nsqf_standards.json')
  ];
  let standardsData = null;
  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      standardsData = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  }

  if (standardsData && standardsData.trades) {
    const insertOcc = db.prepare(`
      INSERT OR REPLACE INTO occupations (id, sector, trade, qp_code, nsqf_level, description, version)
      VALUES (?, ?, ?, ?, ?, ?, '1.0')
    `);
    const insertComp = db.prepare(`
      INSERT OR REPLACE INTO standards_competencies (id, trade_id, nos_code, title, weightage, performance_criteria_json, knowledge_criteria_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const tr of standardsData.trades) {
      insertOcc.run(tr.id, tr.sector, tr.trade, tr.qpCode, tr.nsqfLevel, tr.description || tr.trade);
      if (tr.nosList) {
        for (const nos of tr.nosList) {
          const compId = `${tr.id}-${nos.nosCode}`;
          insertComp.run(compId, tr.id, nos.nosCode, nos.title, nos.weightage || 25, JSON.stringify(nos.performanceCriteria || []), JSON.stringify(nos.knowledgeCriteria || []));
        }
      }
    }
    console.log('[Database] Official NSQF Standards seeded in production mode.');
  }
}

/**
 * Seeds default standards, demo users, assessment centers, and candidates.
 */
function seedInitialData() {
  const isProduction = process.env.NODE_ENV === 'production';
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  // In production, NEVER seed default demo accounts or passwords automatically
  if (isProduction) {
    console.log('[Database] Production mode active: skipping default demo credential seeding.');
    seedStandardsOnly();
    return;
  }

  if (userCount > 0) return; // Already seeded

  console.log('[Database] Seeding initial users, standards, and demonstration records...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, center_id, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const passwordHash = bcrypt.hashSync('Kaushal@2026', 10);

  // Default Assessment Center
  db.prepare(`
    INSERT OR IGNORE INTO assessment_centers (id, center_code, center_name, state, district)
    VALUES ('center-01', 'VNS-SKILL-01', 'Varanasi National Vocational Skill Assessment Center', 'Uttar Pradesh', 'Varanasi')
  `).run();

  // Platform Admin
  insertUser.run('user-admin-01', 'admin@kaushal.gov.in', passwordHash, 'Dr. Sunita Rao (Director NCVET)', 'admin', 'center-01', '+91 98100 00001');

  // Lead Assessor (Human-in-the-Loop)
  insertUser.run('user-assessor-01', 'assessor@kaushal.gov.in', passwordHash, 'Rajesh Varma (Certified Electrical Assessor)', 'assessor', 'center-01', '+91 98200 00002');

  // Assessment Center Manager
  insertUser.run('user-mgr-01', 'manager@kaushal.gov.in', passwordHash, 'Anil Tripathi (Center Superintendent)', 'center_manager', 'center-01', '+91 98300 00003');

  // Auditor (Read-Only)
  insertUser.run('user-auditor-01', 'auditor@kaushal.gov.in', passwordHash, 'Pooja Iyer (Third-Party Quality Auditor)', 'auditor', 'center-01', '+91 98400 00004');

  // Candidate Users
  insertUser.run('user-cand-101', 'ramesh.sharma@skillindia.rpl', passwordHash, 'Ramesh Kumar Sharma', 'candidate', 'center-01', '+91 98765 43210');
  insertUser.run('user-cand-102', 'aslam.ansari@skillindia.rpl', passwordHash, 'Mohammad Aslam Ansari', 'candidate', 'center-01', '+91 98111 22334');

  // Seed Occupations from nsqf_standards.json
  let standardsData = null;
  const pathsToTry = [
    STANDARDS_PATH,
    path.join(__dirname, '..', '..', 'data', 'nsqf_standards.json'),
    path.join(__dirname, '..', '..', '..', 'data', 'nsqf_standards.json')
  ];
  for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
      standardsData = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  }

  if (standardsData && standardsData.trades) {
    const insertOcc = db.prepare(`
      INSERT OR REPLACE INTO occupations (id, sector, trade, qp_code, nsqf_level, description, version)
      VALUES (?, ?, ?, ?, ?, ?, '1.0')
    `);

    const insertComp = db.prepare(`
      INSERT OR REPLACE INTO standards_competencies (id, trade_id, nos_code, title, weightage, performance_criteria_json, knowledge_criteria_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const tr of standardsData.trades) {
      insertOcc.run(tr.id, tr.sector, tr.trade, tr.qpCode, tr.nsqfLevel, tr.description || tr.trade);

      if (tr.nosList) {
        for (const nos of tr.nosList) {
          const compId = `${tr.id}-${nos.nosCode}`;
          insertComp.run(
            compId,
            tr.id,
            nos.nosCode,
            nos.title,
            nos.weightage || 25,
            JSON.stringify(nos.performanceCriteria || []),
            JSON.stringify(nos.knowledgeCriteria || [])
          );
        }
      }
    }
  }

  // Seed Candidate Profiles
  const insertCandidate = db.prepare(`
    INSERT OR REPLACE INTO candidate_profiles (
      id, user_id, full_name, age, gender, phone, aadhaar_last4, state, district,
      trade_id, informal_experience_years, education_level, current_occupation,
      primary_language, accessibility_pref, profile_photo, enrolled_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCandidate.run(
    'cand-101', 'user-cand-101', 'Ramesh Kumar Sharma', 32, 'Male', '+91 98765 43210', '4589',
    'Uttar Pradesh', 'Varanasi', 'electrician-l3', 6, 'Class 8 Pass',
    'Local House Electrician (Self-Employed)', 'hi', 'Audio Voice Guidance',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    '2026-03-15'
  );

  insertCandidate.run(
    'cand-102', 'user-cand-102', 'Mohammad Aslam Ansari', 28, 'Male', '+91 98111 22334', '7812',
    'Bihar', 'Patna', 'electrician-l4', 8, 'Class 10 Pass',
    'Sub-station helper & Industrial Panel wirer', 'hi', 'Standard',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    '2026-03-20'
  );

  console.log('[Database] Database initialized and seeded successfully.');
}

/**
 * Audit log helper
 */
function logAuditEvent({ entityType, entityId, userId, userRole, action, details = {}, ipAddress = '127.0.0.1' }) {
  try {
    const id = `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`
      INSERT INTO audit_events (id, entity_type, entity_id, user_id, user_role, action, details_json, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, entityType, entityId, userId || null, userRole || null, action, JSON.stringify(details), ipAddress);
    return id;
  } catch (err) {
    console.error('[Audit Log] Failed to record event:', err.message);
    return null;
  }
}

// Run schema initialization and initial seed
initSchema();
seedInitialData();

module.exports = {
  db,
  logAuditEvent
};
