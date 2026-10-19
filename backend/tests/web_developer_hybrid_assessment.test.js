const request = require('supertest');
const app = require('../src/server');
const { db } = require('../src/data/database');
const { validateAssessmentWeights } = require('../src/data/defaultTemplates');

describe('Web Developer Hybrid Skill Verification Test Suite', () => {
  jest.setTimeout(35000);

  let candidateToken;
  let candidateUser;
  let assessorToken;
  let assessorUser;
  let adminToken;
  let assessmentId;

  beforeAll(async () => {
    // 1. Authenticate Candidate (dev.candidate@skillindia.rpl)
    const candRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dev.candidate@skillindia.rpl', password: 'Kaushal@2026' });
    expect(candRes.statusCode).toBe(200);
    candidateToken = candRes.body.token;
    candidateUser = candRes.body.user;

    // 2. Authenticate Lead Assessor (assessor@kaushal.gov.in)
    const assrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'assessor@kaushal.gov.in', password: 'Kaushal@2026' });
    expect(assrRes.statusCode).toBe(200);
    assessorToken = assrRes.body.token;
    assessorUser = assrRes.body.user;

    // 3. Authenticate Platform Admin (admin@kaushal.gov.in)
    const admRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kaushal.gov.in', password: 'Kaushal@2026' });
    expect(admRes.statusCode).toBe(200);
    adminToken = admRes.body.token;
  });

  describe('Phase 3: Assessment Template Retrieval & Weight Validation', () => {
    it('should retrieve list of versioned assessment templates', async () => {
      const res = await request(app).get('/api/assessment-templates');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const webDev = res.body.find(t => t.tradeId === 'web-developer-l5');
      expect(webDev).toBeDefined();
      expect(webDev.totalWeight).toBe(100);
    });

    it('should retrieve Web Developer assessment template with validated 100% competencies', async () => {
      const res = await request(app).get('/api/assessment-templates/web-developer-l5');
      expect(res.statusCode).toBe(200);
      expect(res.body.tradeId).toBe('web-developer-l5');
      expect(res.body.nsqfLevel).toBe(5);

      const competencies = res.body.competencies;
      expect(competencies.length).toBe(6);

      // Verify individual competency weights
      const cMap = {};
      competencies.forEach(c => { 
        cMap[c.id] = c.weight; 
        if (c.nosCode) cMap[c.nosCode] = c.weight;
      });
      expect(cMap['comp-html-a11y'] || cMap['SSC/N0501']).toBe(15); // HTML and accessibility
      expect(cMap['comp-css-resp'] || cMap['SSC/N0502']).toBe(15);  // CSS and responsive design
      expect(cMap['comp-js-fund'] || cMap['SSC/N0503']).toBe(20);   // JavaScript fundamentals
      expect(cMap['comp-practical-dev'] || cMap['SSC/N0504']).toBe(30); // Practical development
      expect(cMap['comp-debugging'] || cMap['SSC/N0505']).toBe(15); // Debugging and problem-solving
      expect(cMap['comp-explanation'] || cMap['SSC/N0506']).toBe(5); // Technical explanation

      const sum = competencies.reduce((acc, c) => acc + c.weight, 0);
      expect(sum).toBe(100);

      // Verify helper validation
      const validation = validateAssessmentWeights(competencies);
      expect(validation.isValid).toBe(true);
      expect(validation.total).toBe(100);
    });

    it('should reject template creation if weights do not total 100%', async () => {
      const invalidTemplate = {
        id: 'tpl-invalid-test',
        tradeId: 'web-developer-l5',
        title: 'Invalid Template',
        version: '1.0-test',
        competencies: [
          { id: 'c1', title: 'HTML', weight: 40 },
          { id: 'c2', title: 'CSS', weight: 40 }
          // Totals 80%, not 100%
        ],
        knowledgeTasks: [],
        codingTask: {},
        debugTask: {},
        scoringRubric: {}
      };

      const res = await request(app)
        .post('/api/assessment-templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidTemplate);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Competency weights must total exactly 100%');
    });

    it('should prevent candidate from modifying assessment templates (RBAC)', async () => {
      const res = await request(app)
        .post('/api/assessment-templates')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ title: 'Hacked Template' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Phase 4: Candidate Hybrid Assessment Lifecycle & Sandbox Execution', () => {
    it('should start or resume Web Developer assessment session for candidate', async () => {
      const res = await request(app)
        .post('/api/assessments/start')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ tradeId: 'web-developer-l5' });

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.assessment).toBeDefined();
      expect(res.body.assessment.trade_id).toBe('web-developer-l5');
      expect(res.body.template).toBeDefined();

      assessmentId = res.body.assessment.id;
      expect(assessmentId).toBeDefined();
    });

    it('should save incremental draft progress', async () => {
      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/progress`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          currentStep: 'knowledge',
          knowledgeAnswers: { q1: 'b', q2: 'b' }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Progress saved.');
    });

    it('should evaluate knowledge answers server-side with deterministic feedback', async () => {
      const answers = {
        q1: 'b', // Correct: role="alert" or aria-live="polite"
        q2: 'b', // Correct: mobile-first responsive breakpoints
        q3: 'b', // Correct: filter returns shallow copy without mutating original
        q4: 'event delegation' // Short answer
      };

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/submit-knowledge`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ answers });

      expect(res.statusCode).toBe(200);
      expect(res.body.evaluation).toBeDefined();
      expect(res.body.evaluation.score).toBeGreaterThan(0);
      expect(res.body.evaluation.breakdown).toBeDefined();
      expect(res.body.nextStep).toBe('coding');
    });

    it('should safely run deterministic tests on practical coding task in isolated sandbox', async () => {
      const validCode = `
        let tasks = [
          { id: 1, text: "Initial Task", completed: false }
        ];
        let currentFilter = 'all';

        function validateInput(text) {
          if (!text || !text.trim()) return "Task title cannot be empty.";
          return null;
        }

        function addTask(title) {
          const err = validateInput(title);
          if (err) return false;
          tasks.push({
            id: Date.now() + Math.random(),
            text: title.trim(),
            completed: false
          });
          return true;
        }

        function toggleTask(id) {
          tasks = tasks.map(t => t.id == id ? { ...t, completed: !t.completed } : t);
        }

        function setFilter(filter) {
          currentFilter = filter;
        }

        function deleteTask(id) {
          tasks = tasks.filter(t => t.id != id);
        }
      `;

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/run-code-tests`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ javascript: validCode });

      expect(res.statusCode).toBe(200);
      expect(res.body.totalTests).toBe(5);
      expect(res.body.passedCount).toBe(5);
      expect(res.body.passRate).toBe(100);
      expect(res.body.status).toBe('passed');
    });

    it('should record failures when defective code is tested in sandbox', async () => {
      const defectiveCode = `
        let tasks = [];
        let currentFilter = 'all';
        function validateInput() { return null; }
        function addTask() { return true; } // Does not validate or add to tasks
        function toggleTask() {}
        function setFilter() {}
        function deleteTask() {}
      `;

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/run-code-tests`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ javascript: defectiveCode });

      expect(res.statusCode).toBe(200);
      expect(res.body.passedCount).toBe(0);
      expect(res.body.passRate).toBe(0);
      expect(res.body.status).toBe('failed');
    });

    it('should commit practical coding task submission and advance to debugging stage', async () => {
      const validCode = `
        let tasks = [
          { id: 1, text: "Initial Task", completed: false }
        ];
        let currentFilter = 'all';

        function validateInput(text) {
          if (!text || !text.trim()) return "Task title cannot be empty.";
          return null;
        }

        function addTask(title) {
          const err = validateInput(title);
          if (err) return false;
          tasks.push({
            id: Date.now() + Math.random(),
            text: title.trim(),
            completed: false
          });
          return true;
        }

        function toggleTask(id) {
          tasks = tasks.map(t => t.id == id ? { ...t, completed: !t.completed } : t);
        }

        function setFilter(filter) {
          currentFilter = filter;
        }

        function deleteTask(id) {
          tasks = tasks.filter(t => t.id != id);
        }
      `;

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/submit-code`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          javascript: validCode,
          html: '<main id="app"><button aria-label="Add Task">Add</button></main>',
          css: ':root { --primary: #0d9488; } @media (max-width: 640px) { .task { width: 100%; } }'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.testResults.passedCount).toBe(5);
      expect(res.body.nextStep).toBe('debugging');
    });

    it('should evaluate controlled defect debugging submission in sandbox', async () => {
      const fixedDebugCode = `
        function filterAndSearchTasks(taskList, filterOrQuery = 'all', queryOrFilter = '') {
          if (!Array.isArray(taskList)) return [];
          let filter = 'all';
          let query = '';
          const validFilters = ['all', 'active', 'completed'];
          if (validFilters.includes(String(filterOrQuery).toLowerCase())) {
            filter = String(filterOrQuery).toLowerCase();
            query = String(queryOrFilter || '');
          } else if (validFilters.includes(String(queryOrFilter).toLowerCase())) {
            filter = String(queryOrFilter).toLowerCase();
            query = String(filterOrQuery || '');
          } else {
            query = String(filterOrQuery || '');
          }
          const q = query.trim().toLowerCase();
          return taskList.filter(task => {
            let matchesStatus = true;
            if (filter === 'active') matchesStatus = !task.completed;
            if (filter === 'completed') matchesStatus = !!task.completed;
            const text = (task.text || task.title || '').toLowerCase();
            const matchesQuery = !q || text.includes(q);
            return matchesStatus && matchesQuery;
          });
        }
      `;

      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/submit-debug`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ javascript: fixedDebugCode });

      expect(res.statusCode).toBe(200);
      expect(res.body.testResults.totalTests).toBe(2);
      expect(res.body.testResults.passedCount).toBe(2);
      expect(res.body.testResults.passRate).toBe(100);
      expect(res.body.nextStep).toBe('evidence');
    });

    it('should finalize hybrid submission, calculate rubric score, and transition to assessor review', async () => {
      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/submit-hybrid`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .field('explanationText', 'Implemented task state management using immutable closures and pure functional array operations. Semantic HTML5 elements with aria labels ensure accessibility compliance. Filter searches operate case-insensitively without mutating source collections.')
        .field('antiFraudAudit', JSON.stringify({ livenessVerified: true, confidence: 0.96 }));

      expect(res.statusCode).toBe(200);
      expect(res.body.assessment).toBeDefined();
      expect(res.body.assessment.status).toBe('assessor_review_required');
      expect(res.body.rubric).toBeDefined();
      expect(res.body.rubric.overallScore).toBeGreaterThanOrEqual(75);
      expect(res.body.rubric.rubricBreakdown.length).toBe(6);
    });
  });

  describe('Phase 5 & 6: Scoring Engine & Assessor Authorization Checks', () => {
    it('should reject candidate attempts to sign off on an assessment (RBAC)', async () => {
      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/signoff`)
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          finalDecision: 'certified_approved',
          assessorRemarks: 'Self-approval attempt'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should allow authorized assessor to review evidence and sign off with HMAC', async () => {
      const res = await request(app)
        .post(`/api/assessments/${assessmentId}/signoff`)
        .set('Authorization', `Bearer ${assessorToken}`)
        .send({
          finalDecision: 'certified_approved',
          assessorRemarks: 'Candidate Aarav Sharma demonstrated 100% adherence to Web Developer standards. All unit tests passed, immutable state handling verified, and accessible markup confirmed.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('signed off');
      expect(res.body.decision.decision).toBe('certified_approved');
      expect(res.body.decision.signatureDigest).toBeDefined();
    });

    it('should verify finalized report integrity via public reference endpoint', async () => {
      const res = await request(app).get(`/api/reports/${assessmentId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.assessmentId).toBe(assessmentId);
      expect(res.body.verificationStatus).toBe('Verified');
      expect(res.body.reportIntegritySha256).toBeDefined();
      expect(res.body.statutoryDisclaimer).toBeDefined();
    });
  });
});
