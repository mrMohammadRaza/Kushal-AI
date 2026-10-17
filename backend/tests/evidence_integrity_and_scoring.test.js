const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/server');
const { db } = require('../src/data/database');

describe('Evidence Integrity & Objective Competency Scoring', () => {
  jest.setTimeout(25000);
  let assessorToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'assessor@kaushal.gov.in', password: 'Kaushal@2026' });
    assessorToken = res.body.token;
  });

  it('RULE VERIFICATION: Missing evidence must NEVER generate a fabricated pass', async () => {
    const res = await request(app)
      .post('/api/assessments/evaluate')
      .set('Authorization', `Bearer ${assessorToken}`)
      .field('candidateId', 'cand-101')
      .field('tradeId', 'electrician-l3')
      .field('vivaAnswer', ''); // Empty viva and no photo

    expect(res.statusCode).toBe(201);
    const body = res.body;

    // Must NOT be certified
    expect(body.status).not.toBe('Certified');
    expect(body.status).not.toBe('certified_approved');
    expect(['evidence_missing', 'insufficient_evidence']).toContain(body.status);
    expect(body.overall_score).toBeNull();

    // Vision must state no image
    expect(body.aiEvaluation.visionAnalysis.imageAudited).toBe(false);
    expect(body.aiEvaluation.visionAnalysis.boundingBoxes).toHaveLength(0);

    // Gaps must note missing evidence
    expect(body.aiEvaluation.gapAreas.some(g => g.toLowerCase().includes('missing') || g.toLowerCase().includes('not provided') || g.toLowerCase().includes('absent'))).toBe(true);
  });

  it('RULE VERIFICATION: Oral-only evidence must require practical test, never certified pass', async () => {
    const res = await request(app)
      .post('/api/assessments/evaluate')
      .set('Authorization', `Bearer ${assessorToken}`)
      .field('candidateId', 'cand-101')
      .field('tradeId', 'electrician-l3')
      .field('vivaAnswer', 'Maine 3-phase line ka main isolator cut kiya aur multimeter se continuity check kiya.');

    expect(res.statusCode).toBe(201);
    const body = res.body;

    expect(body.status).not.toBe('Certified');
    expect(body.status).not.toBe('certified_approved');
    expect(['requires_practical_test', 'insufficient_evidence']).toContain(body.status);
    expect(body.aiEvaluation.gapAreas.some(g => g.toLowerCase().includes('physical') || g.toLowerCase().includes('visual') || g.toLowerCase().includes('missing'))).toBe(true);
  });

  it('RULE VERIFICATION: Multimodal upload computes SHA-256 integrity hash and logs evidence records', async () => {
    // Create temporary image fixture
    const tmpImgPath = path.join(__dirname, 'test_wiring.jpg');
    fs.writeFileSync(tmpImgPath, Buffer.from('fake-jpeg-image-bytes-for-testing-sha256-integrity'));

    const res = await request(app)
      .post('/api/assessments/evaluate')
      .set('Authorization', `Bearer ${assessorToken}`)
      .field('candidateId', 'cand-101')
      .field('tradeId', 'electrician-l3')
      .field('vivaAnswer', 'Tested insulation resistance between live and earth terminals.')
      .attach('practicalImage', tmpImgPath);

    fs.unlinkSync(tmpImgPath);

    expect(res.statusCode).toBe(201);
    const assessmentId = res.body.id;

    // Check evidence records in database
    const evidence = db.prepare('SELECT * FROM evidence_records WHERE assessment_id = ?').all(assessmentId);
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence[0].sha256_hash).toBeDefined();
    expect(evidence[0].sha256_hash.length).toBe(64); // Valid SHA-256 hex length
    expect(evidence[0].evidence_type).toBe('image');
  });

  it('RULE VERIFICATION: Granular NOS criteria must be mapped in competency_assessments table', async () => {
    const res = await request(app)
      .post('/api/assessments/evaluate')
      .set('Authorization', `Bearer ${assessorToken}`)
      .field('candidateId', 'cand-101')
      .field('tradeId', 'electrician-l3')
      .field('vivaAnswer', 'MCB wiring with proper copper conductor gauge and earthing continuity test.');

    expect(res.statusCode).toBe(201);
    const assessmentId = res.body.id;

    const comps = db.prepare('SELECT * FROM competency_assessments WHERE assessment_id = ?').all(assessmentId);
    expect(comps.length).toBeGreaterThan(0);
    expect(comps[0].nos_code).toBeDefined();
    expect(comps[0].pc_code).toBeDefined();
  });
});
