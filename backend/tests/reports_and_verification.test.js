const request = require('supertest');
const app = require('../src/server');
const { db } = require('../src/data/database');

describe('Reports Generation & Public QR Code Verification', () => {
  jest.setTimeout(25000);
  let assessorToken;
  let testAssessmentId;
  let generatedReportHash;

  beforeAll(async () => {
    // 1. Login as lead assessor
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'assessor@kaushal.gov.in', password: 'Kaushal@2026' });
    assessorToken = loginRes.body.token;

    // 2. Submit sample assessment for evaluation
    const evalRes = await request(app)
      .post('/api/assessments/evaluate')
      .field('candidateId', 'cand-101')
      .field('tradeId', 'electrician-l3')
      .field('vivaAnswer', 'Demonstrated circuit isolation, checked voltage with multimeter, connected earthing wire.');
    testAssessmentId = evalRes.body.id;
  });

  it('should allow certified assessor to sign off and release official PDF report with QR code', async () => {
    const res = await request(app)
      .post(`/api/assessments/${testAssessmentId}/signoff`)
      .set('Authorization', `Bearer ${assessorToken}`)
      .send({
        finalDecision: 'certified_approved',
        assessorRemarks: 'Candidate demonstrated satisfactory tool handling and electrical isolation according to NSQF L3 standards.'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.assessment.signed_off).toBe(1);
    expect(res.body.decision.signatureDigest).toBeDefined();
    expect(res.body.report).toBeDefined();
    expect(res.body.report.reportHash).toBeDefined();
    expect(res.body.report.qrVerificationUrl).toContain('/api/reports/verify/');
    expect(res.body.report.pdfUrl).toContain('.pdf');

    generatedReportHash = res.body.report.reportHash;
  });

  it('NEGATIVE TEST: should prevent double sign-off on already finalized assessment', async () => {
    const res = await request(app)
      .post(`/api/assessments/${testAssessmentId}/signoff`)
      .set('Authorization', `Bearer ${assessorToken}`)
      .send({ finalDecision: 'certified_approved' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('already been signed off');
  });

  it('PUBLIC QR VERIFICATION: should return verified status and qualification metadata without private data', async () => {
    const res = await request(app)
      .get(`/api/reports/verify/${generatedReportHash}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body.qualification.trade).toBe('Assistant Electrician');
    expect(res.body.qualification.nsqfLevel).toBe(3);
    expect(res.body.candidate.name).toBe('Ramesh Kumar Sharma');
    expect(res.body.assessmentOutcome.status).toBe('certified_approved');

    // PRIVACY VERIFICATION: Private data must NOT be exposed publicly
    expect(res.body.aadhaar).toBeUndefined();
    expect(res.body.phone).toBeUndefined();
    expect(res.body.evidenceFiles).toBeUndefined();
  });

  it('PUBLIC QR VERIFICATION: should return 404 for fabricated or invalid report hash', async () => {
    const fakeHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const res = await request(app)
      .get(`/api/reports/verify/${fakeHash}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.verified).toBe(false);
  });
});
