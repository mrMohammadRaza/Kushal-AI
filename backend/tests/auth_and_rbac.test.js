const request = require('supertest');
const app = require('../src/server');

describe('Authentication & Server-Enforced RBAC', () => {
  jest.setTimeout(25000);
  let candidateToken;
  let assessorToken;
  let candidateUser;

  it('should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kaushal.gov.in', password: 'WrongPassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid credentials.');
  });

  it('should authenticate lead assessor and return JWT with assessor role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'assessor@kaushal.gov.in', password: 'Kaushal@2026' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('assessor');
    assessorToken = res.body.token;
  });

  it('should authenticate candidate and return JWT with candidate role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ramesh.sharma@skillindia.rpl', password: 'Kaushal@2026' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('candidate');
    expect(res.body.candidateProfile).toBeDefined();
    candidateToken = res.body.token;
    candidateUser = res.body.user;
  });

  it('should register a new informal candidate and associate qualification pack', async () => {
    const testEmail = `cand.test.${Date.now()}@skillindia.rpl`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Kaushal@2026',
        fullName: 'Vikram Singh',
        phone: '+91 99887 76655',
        tradeId: 'electrician-l3',
        experienceYears: 5,
        employmentType: 'Domestic Electrician',
        primaryLanguage: 'hi'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.candidateProfile.trade_id).toBe('electrician-l3');
  });

  it('should reject registration with invalid/non-existent trade ID', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `invalid.${Date.now()}@test.com`,
        password: 'Password123',
        fullName: 'Invalid Candidate',
        tradeId: 'non-existent-trade-999'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('does not exist');
  });

  it('NEGATIVE TEST: should deny candidate role from accessing assessor sign-off endpoint', async () => {
    const res = await request(app)
      .post('/api/assessments/asmt-fake-99/signoff')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ finalDecision: 'certified_approved' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain("Access forbidden: Role 'candidate'");
  });

  it('NEGATIVE TEST: should reject unauthenticated requests to protected endpoints', async () => {
    const res = await request(app)
      .post('/api/assessments/asmt-fake-99/signoff')
      .send({ finalDecision: 'certified_approved' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Authentication token is missing');
  });
});
