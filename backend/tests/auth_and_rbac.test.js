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

  it('NEGATIVE TEST: should deny candidate role from viewing global candidates list', async () => {
    const res = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain("Access forbidden: Role 'candidate'");
  });

  it('NEGATIVE TEST: Anti-IDOR candidate cannot submit assessment for another candidate', async () => {
    const res = await request(app)
      .post('/api/assessments/evaluate')
      .set('Authorization', `Bearer ${candidateToken}`)
      .field('candidateId', 'cand-different-profile-999')
      .field('tradeId', 'electrician-l3')
      .field('vivaAnswer', 'Checking security enforcement.');

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Candidate cannot submit evidence on behalf of another candidate');
  });

  it('NEGATIVE TEST: Private evidence files cannot be accessed without authentication', async () => {
    const res = await request(app)
      .get('/uploads/test_circuit_diagram.png');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Authentication token is missing');
  });

  it('NEGATIVE TEST: should reject unauthenticated requests to protected endpoints', async () => {
    const res = await request(app)
      .post('/api/assessments/asmt-fake-99/signoff')
      .send({ finalDecision: 'certified_approved' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Authentication token is missing');
  });

  it('Phase 4: should retrieve scrubbed initial skill test for Web Developer without exposing answer keys', async () => {
    const res = await request(app)
      .get('/api/assessments/initial-test/web-developer-l5');

    expect(res.statusCode).toBe(200);
    expect(res.body.tradeId).toBe('web-developer-l5');
    expect(res.body.questions.length).toBeGreaterThanOrEqual(5);

    // Verify answers are strictly scrubbed
    res.body.questions.forEach(q => {
      expect(q.correctAnswer).toBeUndefined();
      expect(q.explanation).toBeUndefined();
      expect(q.prompt).toBeDefined();
      expect(q.options.length).toBe(4);
    });
  });

  it('Phase 4: should evaluate initial test submission server-side and calculate readiness level', async () => {
    const res = await request(app)
      .post('/api/assessments/initial-test')
      .send({
        tradeId: 'web-developer-l5',
        email: 'new.candidate@skillindia.rpl',
        answers: {
          'init-wd-1': 'A',
          'init-wd-2': 'B',
          'init-wd-3': 'C',
          'init-wd-4': 'B',
          'init-wd-5': 'B'
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.score).toBe(5);
    expect(res.body.percentage).toBe(100);
    expect(res.body.readinessLevel).toBe('Advanced Practical');
    expect(res.body.recommendation).toBeDefined();
    expect(res.body.testId).toBeDefined();
  });

  it('Phase 3: should upload candidate resume and return SHA-256 hash', async () => {
    const res = await request(app)
      .post('/api/candidates/upload-resume')
      .attach('resumeFile', Buffer.from('%PDF-1.4 Mock Candidate Resume Content for RPL Verification'), 'aarav_resume.pdf');

    expect(res.statusCode).toBe(201);
    expect(res.body.filePath).toBeDefined();
    expect(res.body.sha256Hash).toBeDefined();
    expect(res.body.sha256Hash.length).toBe(64);
  });

  it('Phase 3: should complete resume-style registration with education, experience, skills, and linked initial test', async () => {
    const testEmail = `cand.fullresume.${Date.now()}@skillindia.rpl`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Kaushal@2026',
        fullName: 'Devi Prasad Sharma',
        phone: '+91 98765 00112',
        tradeId: 'web-developer-l5',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        education: {
          highestQualification: 'B.Tech Computer Science',
          course: 'Information Technology',
          institution: 'VTU Karnataka',
          graduationYear: 2023,
          vocationalTraining: 'Full Stack Web Development RPL Bootcamp'
        },
        experience: {
          totalYears: 3,
          employmentStatus: 'Employed Full-time',
          currentEmployer: 'TechCraft Solutions',
          jobTitle: 'Frontend Engineer',
          responsibilities: 'Developing accessible React applications with WCAG AA compliance'
        },
        skills: {
          technicalSkills: ['HTML5', 'CSS3', 'JavaScript ES6+', 'React', 'TailwindCSS'],
          tools: ['VS Code', 'Git', 'Webpack', 'Figma'],
          portfolioUrl: 'https://github.com/example/portfolio'
        },
        resume: {
          filePath: '/mock/path/devi_resume.pdf',
          originalFilename: 'devi_resume.pdf',
          sha256Hash: 'a'.repeat(64)
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.candidateProfile).toBeDefined();
    expect(res.body.candidateProfile.city).toBe('Bengaluru');
    expect(res.body.candidateProfile.education_json).toBeDefined();
    expect(res.body.candidateProfile.skills_json).toBeDefined();
  });

  it('VALIDATION: should reject registration with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'Password123',
        fullName: 'Valid Name',
        phone: '+91 99887 76655',
        tradeId: 'web-developer-l5'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('valid email address');
  });

  it('VALIDATION: should reject registration with password under 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `shortpass.${Date.now()}@test.com`,
        password: 'short',
        fullName: 'Valid Name',
        phone: '+91 99887 76655',
        tradeId: 'web-developer-l5'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('at least 8 characters');
  });

  it('VALIDATION: should reject registration with empty or single-character full name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `noname.${Date.now()}@test.com`,
        password: 'ValidPassword123',
        fullName: 'A',
        phone: '+91 99887 76655',
        tradeId: 'web-developer-l5'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Full legal name must be at least 2 characters');
  });

  it('RBAC: candidate role cannot create candidate profiles via POST /api/candidates', async () => {
    const res = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        fullName: 'Unauthorized Creation',
        email: `unauth.${Date.now()}@test.com`,
        tradeId: 'web-developer-l5'
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Access forbidden');
  });

  it('TEMPLATE: should retrieve assessment template by both trade_id and template id', async () => {
    const resById = await request(app).get('/api/assessment-templates/tpl-web-developer-v1');
    expect(resById.statusCode).toBe(200);
    expect(resById.body.id).toBe('tpl-web-developer-v1');
    expect(resById.body.tradeId).toBe('web-developer-l5');

    const resByTrade = await request(app).get('/api/assessment-templates/web-developer-l5');
    expect(resByTrade.statusCode).toBe(200);
    expect(resByTrade.body.id).toBe('tpl-web-developer-v1');
  });

  it('AUTO-PROVISIONING: candidate without pre-existing profile auto-provisions profile on starting assessment', async () => {
    const uniqueUser = `autoprov.${Date.now()}@skillindia.rpl`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueUser,
        password: 'Kaushal@2026',
        fullName: 'Auto Provision Test',
        tradeId: 'electrician-l3'
      });
    expect(regRes.statusCode).toBe(201);
    const userToken = regRes.body.token;

    const startRes = await request(app)
      .post('/api/assessments/start')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ tradeId: 'electrician-l3' });

    expect([200, 201]).toContain(startRes.statusCode);
    expect(startRes.body.assessment?.id).toBeDefined();
    expect(startRes.body.assessment?.candidate_id).toBeDefined();
  });
});
