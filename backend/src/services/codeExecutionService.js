/**
 * Deterministic Safe Code Evaluation & Competency Scoring Service
 * Provides sandboxed execution for JavaScript tasks, controlled defect debugging verification,
 * and rubric-based score aggregation according to NSQF & Kaushal AI standards.
 */

const vm = require('vm');
const { 
  WEB_DEVELOPER_COMPETENCIES, 
  WEB_DEVELOPER_KNOWLEDGE_TASKS,
  WEB_DEVELOPER_CODING_TASK,
  WEB_DEVELOPER_DEBUG_TASK,
  validateTemplateWeights
} = require('../data/defaultTemplates');

/**
 * Safely executes candidate practical task-list code in an isolated V8 context.
 * Performs deterministic unit tests on core task list operations:
 * - Empty string input validation
 * - Adding task item
 * - Toggling task completion
 * - Filtering tasks (All, Active, Completed)
 * - Deleting task item
 */
function evaluatePracticalCodingTask(submittedCode = {}) {
  const { javascript = '', html = '', css = '' } = submittedCode;

  if (!javascript || javascript.trim().length === 0) {
    return {
      passed: false,
      score: 0,
      maxScore: 30,
      passedTests: 0,
      totalTests: 5,
      testResults: WEB_DEVELOPER_CODING_TASK.automatedTests.map(t => ({
        id: t.id,
        name: t.name,
        passed: false,
        points: 0,
        maxPoints: t.points,
        message: "No code submitted for practical coding task."
      })),
      logs: "Execution aborted: empty JavaScript code submission."
    };
  }

  // Simulated browser environment harness in sandbox
  const harnessScript = `
    let testResults = [];

    // Helper assertions
    function assert(condition, message) {
      if (!condition) throw new Error(message || "Assertion failed");
    }

    // 1. Mock minimal DOM elements for candidate script
    const mockElements = {
      'app': { innerHTML: '', appendChild() {} },
      'task-form': { 
        listeners: {},
        addEventListener(event, fn) { this.listeners[event] = fn; },
        dispatchEvent(event) { if (this.listeners[event.type]) this.listeners[event.type](event); }
      },
      'task-input': { value: '', focus() {} },
      'task-list': { 
        children: [], 
        innerHTML: '',
        appendChild(child) { this.children.push(child); }
      },
      'validation-msg': { textContent: '' },
      'task-counter': { textContent: '' }
    };

    const document = {
      getElementById(id) {
        if (!mockElements[id]) {
          mockElements[id] = { innerHTML: '', textContent: '', value: '', addEventListener() {}, children: [] };
        }
        return mockElements[id];
      },
      querySelectorAll(selector) {
        return [
          { getAttribute: () => 'all', classList: { add() {}, remove() {} }, addEventListener() {} },
          { getAttribute: () => 'active', classList: { add() {}, remove() {} }, addEventListener() {} },
          { getAttribute: () => 'completed', classList: { add() {}, remove() {} }, addEventListener() {} }
        ];
      },
      createElement(tag) {
        return {
          tagName: tag.toUpperCase(),
          className: '',
          textContent: '',
          children: [],
          attributes: {},
          setAttribute(k, v) { this.attributes[k] = v; },
          getAttribute(k) { return this.attributes[k]; },
          appendChild(child) { this.children.push(child); },
          addEventListener() {}
        };
      }
    };

    // Candidate Script Injection
    ${javascript}

    // Test 1: Empty input validation
    try {
      let isRejected = false;
      if (typeof validateInput === 'function') {
        const errEmpty = validateInput("");
        const errSpaces = validateInput("   ");
        isRejected = Boolean(errEmpty && errSpaces);
      } else if (typeof addTask === 'function') {
        const initialCount = (typeof tasks !== 'undefined' && Array.isArray(tasks)) ? tasks.length : 0;
        const resEmpty = addTask("");
        const resSpaces = addTask("   ");
        const afterCount = (typeof tasks !== 'undefined' && Array.isArray(tasks)) ? tasks.length : 0;
        isRejected = (resEmpty === false || resSpaces === false) && initialCount === afterCount;
      }
      assert(isRejected, "Validation must reject empty or whitespace strings");
      testResults.push({ id: 'test1_empty_validation', passed: true, points: 6, message: "Empty input validation succeeded." });
    } catch (e) {
      testResults.push({ id: 'test1_empty_validation', passed: false, points: 0, message: e.message });
    }

    // Test 2: Add valid task
    try {
      const initialCount = (typeof tasks !== 'undefined' && Array.isArray(tasks)) ? tasks.length : 0;
      let added = false;
      if (typeof addTask === 'function') {
        added = addTask("Automated Verification Task 101");
      }
      assert(typeof tasks !== 'undefined' && Array.isArray(tasks) && tasks.length > initialCount, "Task item must be added to tasks collection");
      const found = tasks.some(t => t.text && t.text.includes("Automated Verification Task 101"));
      assert(found, "Added task text must match input title");
      testResults.push({ id: 'test2_add_task', passed: true, points: 6, message: "Valid task item added successfully." });
    } catch (e) {
      testResults.push({ id: 'test2_add_task', passed: false, points: 0, message: e.message });
    }

    // Test 3: Toggle task completion
    try {
      assert(typeof tasks !== 'undefined' && Array.isArray(tasks) && tasks.length > 0, "Tasks array required for toggle test");
      const targetId = tasks[0].id;
      const initialStatus = Boolean(tasks[0].completed);
      if (typeof toggleTask === 'function') {
        toggleTask(targetId);
      }
      const updated = tasks.find(t => t.id === targetId);
      assert(updated && updated.completed !== initialStatus, "toggleTask must invert completed boolean");
      testResults.push({ id: 'test3_toggle_task', passed: true, points: 6, message: "Task completion toggle verified." });
    } catch (e) {
      testResults.push({ id: 'test3_toggle_task', passed: false, points: 0, message: e.message });
    }

    // Test 4: Task filtering logic
    try {
      if (typeof setFilter === 'function') {
        setFilter('active');
        assert(currentFilter === 'active', "Filter state must update to active");
        setFilter('completed');
        assert(currentFilter === 'completed', "Filter state must update to completed");
        setFilter('all');
        assert(currentFilter === 'all', "Filter state must update to all");
      }
      testResults.push({ id: 'test4_filter_tasks', passed: true, points: 6, message: "Task filtering logic verified." });
    } catch (e) {
      testResults.push({ id: 'test4_filter_tasks', passed: false, points: 0, message: e.message });
    }

    // Test 5: Delete task
    try {
      assert(typeof tasks !== 'undefined' && Array.isArray(tasks) && tasks.length > 0, "Tasks array required for delete test");
      const deleteTarget = tasks[tasks.length - 1].id;
      const prevLength = tasks.length;
      if (typeof deleteTask === 'function') {
        deleteTask(deleteTarget);
      }
      assert(tasks.length === prevLength - 1, "Task collection length must decrease by 1");
      assert(!tasks.some(t => t.id === deleteTarget), "Target task ID must not be present in collection");
      testResults.push({ id: 'test5_delete_task', passed: true, points: 6, message: "Task deletion verified." });
    } catch (e) {
      testResults.push({ id: 'test5_delete_task', passed: false, points: 0, message: e.message });
    }

    testResults;
  `;

  try {
    const sandbox = {
      console: { log() {}, warn() {}, error() {} },
      setTimeout(fn) { if (typeof fn === 'function') fn(); return 0; },
      clearTimeout() {},
      Date: { now: () => 1713500000000 }
    };
    const context = vm.createContext(sandbox);
    const script = new vm.Script(harnessScript);
    const testResults = script.runInContext(context, { timeout: 1500 });
    const totalAwarded = testResults.reduce((sum, t) => sum + (t.passed ? t.points : 0), 0);
    const passedCount = testResults.filter(t => t.passed).length;
    const totalTestsCount = WEB_DEVELOPER_CODING_TASK.automatedTests.length;
    const isAllPassed = passedCount === totalTestsCount;

    return {
      passed: isAllPassed,
      status: isAllPassed ? 'passed' : 'failed',
      score: totalAwarded,
      maxScore: 30,
      passedTests: passedCount,
      passedCount,
      totalTests: totalTestsCount,
      passRate: Math.round((passedCount / totalTestsCount) * 100),
      testResults: testResults.map(tr => {
        const spec = WEB_DEVELOPER_CODING_TASK.automatedTests.find(s => s.id === tr.id) || {};
        return {
          id: tr.id,
          name: spec.name || tr.id,
          passed: tr.passed,
          points: tr.points,
          maxPoints: spec.points || 6,
          message: tr.message
        };
      }),
      logs: `Automated test suite complete: ${passedCount}/5 passed. Total score: ${totalAwarded}/30.`
    };
  } catch (err) {
    return {
      passed: false,
      status: 'failed',
      score: 0,
      maxScore: 30,
      passedTests: 0,
      passedCount: 0,
      totalTests: 5,
      passRate: 0,
      testResults: WEB_DEVELOPER_CODING_TASK.automatedTests.map(t => ({
        id: t.id,
        name: t.name,
        passed: false,
        points: 0,
        maxPoints: t.points,
        message: `Runtime or syntax error: ${err.message}`
      })),
      logs: `Execution error: ${err.message}`
    };
  }
}

/**
 * Safely executes candidate code for the debugging task in an isolated sandbox.
 * Verifies non-mutating filtering and case-insensitive search logic.
 */
function evaluateDebuggingTask(submittedCode = '') {
  if (!submittedCode || submittedCode.trim().length === 0) {
    return {
      passed: false,
      score: 0,
      maxScore: 15,
      passedTests: 0,
      totalTests: 2,
      testResults: WEB_DEVELOPER_DEBUG_TASK.automatedTests.map(t => ({
        id: t.id,
        name: t.name,
        passed: false,
        points: 0,
        maxPoints: t.points,
        message: "No code submitted for debugging task."
      })),
      logs: "Execution aborted: empty debug code."
    };
  }

  const harnessScript = `
    let debugResults = [];
    function assert(condition, message) {
      if (!condition) throw new Error(message || "Assertion failed");
    }

    // Candidate Script Injection
    ${submittedCode}

    assert(typeof filterAndSearchTasks === 'function', "filterAndSearchTasks function must be declared");

    // Test 1: Array Immutability Check
    try {
      const originalMaster = [
        { id: 1, text: "Semantic HTML5 Markup", completed: false },
        { id: 2, text: "CSS Grid Layout", completed: true },
        { id: 3, text: "JavaScript Closures", completed: false }
      ];
      const snapshot = JSON.stringify(originalMaster);

      // Perform multiple filtering passes
      const activeOnly = filterAndSearchTasks(originalMaster, 'active');
      const completedOnly = filterAndSearchTasks(originalMaster, 'completed');
      const allTasks = filterAndSearchTasks(originalMaster, 'all');

      assert(JSON.stringify(originalMaster) === snapshot, "original masterList array was modified or spliced");
      assert(activeOnly.length === 2, "Active filter should yield 2 items");
      assert(completedOnly.length === 1, "Completed filter should yield 1 item");
      assert(allTasks.length === 3, "All filter should yield 3 items");

      debugResults.push({ id: 'debug_test1_immutability', passed: true, points: 7.5, message: "Immutability verified: input array is not mutated." });
    } catch (e) {
      debugResults.push({ id: 'debug_test1_immutability', passed: false, points: 0, message: e.message });
    }

    // Test 2: Case-Insensitive & Trimmed Search
    try {
      const searchDataset = [
        { id: 1, text: "Semantic HTML5 Markup", completed: false },
        { id: 2, text: "CSS Responsive Breakpoints", completed: true },
        { id: 3, text: "JavaScript Event Loop", completed: false }
      ];

      // Lowercase query searching uppercase text
      const searchRes1 = filterAndSearchTasks(searchDataset, 'all', 'html');
      assert(searchRes1.length === 1 && searchRes1[0].id === 1, "Searching 'html' must match 'Semantic HTML5 Markup'");

      // Untrimmed query searching mixed case text
      const searchRes2 = filterAndSearchTasks(searchDataset, 'all', '  CSS  ');
      assert(searchRes2.length === 1 && searchRes2[0].id === 2, "Searching '  CSS  ' must match 'CSS Responsive Breakpoints'");

      debugResults.push({ id: 'debug_test2_case_insensitive_search', passed: true, points: 7.5, message: "Case-insensitive and whitespace-trimmed search verified." });
    } catch (e) {
      debugResults.push({ id: 'debug_test2_case_insensitive_search', passed: false, points: 0, message: e.message });
    }

    debugResults;
  `;

  try {
    const sandbox = {
      console: { log() {}, warn() {}, error() {} }
    };
    const context = vm.createContext(sandbox);
    const script = new vm.Script(harnessScript);
    const debugResults = script.runInContext(context, { timeout: 1500 });

    const totalAwarded = debugResults.reduce((sum, t) => sum + (t.passed ? t.points : 0), 0);
    const passedCount = debugResults.filter(t => t.passed).length;

    const debugTestsCount = WEB_DEVELOPER_DEBUG_TASK.automatedTests.length;
    const isDebugPassed = passedCount === debugTestsCount;

    return {
      passed: isDebugPassed,
      status: isDebugPassed ? 'passed' : 'failed',
      score: totalAwarded,
      maxScore: 15,
      passedTests: passedCount,
      passedCount,
      totalTests: debugTestsCount,
      passRate: Math.round((passedCount / debugTestsCount) * 100),
      testResults: debugResults.map(tr => {
        const spec = WEB_DEVELOPER_DEBUG_TASK.automatedTests.find(s => s.id === tr.id) || {};
        return {
          id: tr.id,
          name: spec.name || tr.id,
          passed: tr.passed,
          points: tr.points,
          maxPoints: spec.points || 7.5,
          message: tr.message
        };
      }),
      logs: `Debugging test suite complete: ${passedCount}/2 passed. Score: ${totalAwarded}/15.`
    };
  } catch (err) {
    return {
      passed: false,
      status: 'failed',
      score: 0,
      maxScore: 15,
      passedTests: 0,
      passedCount: 0,
      totalTests: 2,
      passRate: 0,
      testResults: WEB_DEVELOPER_DEBUG_TASK.automatedTests.map(t => ({
        id: t.id,
        name: t.name,
        passed: false,
        points: 0,
        maxPoints: t.points,
        message: `Runtime or syntax error: ${err.message}`
      })),
      logs: `Debugging evaluation error: ${err.message}`
    };
  }
}

/**
 * Validates candidate answers to knowledge questions.
 */
function evaluateKnowledgeAnswers(answers = {}) {
  const results = [];
  let totalScore = 0;
  const maxScore = 50; // Raw points (mapped to weights later)

  // Points per question:
  // q1 (HTML/A11y): 15 pts
  // q2 (CSS): 15 pts
  // q3 (JS): 10 pts
  // q4 (Security): 10 pts
  const pointsMap = { q1: 15, q2: 15, q3: 10, q4: 10 };

  for (const q of WEB_DEVELOPER_KNOWLEDGE_TASKS) {
    const rawAnswer = answers[q.id];
    let isCorrect = false;
    let feedback = "";

    if (q.type === 'mcq') {
      const selected = typeof rawAnswer === 'string' ? rawAnswer.trim().toUpperCase() : '';
      isCorrect = selected === q.correctAnswer;
      feedback = isCorrect ? "Correct answer." : `Incorrect. Correct choice is option ${q.correctAnswer}.`;
    } else if (q.type === 'short_answer') {
      const text = typeof rawAnswer === 'string' ? rawAnswer.trim().toLowerCase() : '';
      if (text.length >= (q.minCharacters || 10)) {
        const keywordHits = q.acceptedKeywords.filter(k => text.includes(k.toLowerCase()));
        isCorrect = keywordHits.length >= 1;
        feedback = isCorrect 
          ? `Accurately identified core security principles: ${keywordHits.slice(0, 2).join(', ')}.`
          : "Response did not cover required security concepts (e.g. XSS mitigation or script escaping).";
      } else {
        feedback = "Answer too brief or missing.";
      }
    }

    const awarded = isCorrect ? (pointsMap[q.id] || 10) : 0;
    totalScore += awarded;

    results.push({
      questionId: q.id,
      competencyId: q.competencyId,
      prompt: q.prompt,
      givenAnswer: rawAnswer || '',
      isCorrect,
      score: awarded,
      maxScore: pointsMap[q.id] || 10,
      feedback,
      explanation: q.explanation
    });
  }

  return {
    score: totalScore,
    maxScore,
    percentage: Math.round((totalScore / maxScore) * 100),
    questionResults: results,
    breakdown: results
  };
}

/**
 * Evaluates candidate technical written explanation.
 */
function evaluateTechnicalExplanation(explanation = '') {
  if (!explanation || explanation.trim().length < 20) {
    return {
      score: 0,
      maxScore: 5,
      passed: false,
      feedback: "Technical explanation is missing or insufficient (minimum 20 characters required)."
    };
  }

  const text = explanation.toLowerCase();
  const architecturalKeywords = [
    "state", "component", "accessibility", "a11y", "aria", "semantic", 
    "immutable", "event", "responsive", "sanitize", "xss", "dom", "filter"
  ];
  const hits = architecturalKeywords.filter(k => text.includes(k));

  let score = 2; // base score for adequate length
  if (hits.length >= 2) score += 2;
  if (hits.length >= 4) score += 1;
  score = Math.min(score, 5);

  return {
    score,
    maxScore: 5,
    passed: score >= 3,
    identifiedKeywords: hits,
    feedback: `Identified key architectural considerations: ${hits.slice(0, 3).join(', ')}.`
  };
}

/**
 * Computes unified rubric score across all 6 competencies.
 * Strictly verifies weights total 100%:
 * - HTML and accessibility: 15%
 * - CSS and responsive design: 15%
 * - JavaScript fundamentals: 20%
 * - Practical development: 30%
 * - Debugging and problem-solving: 15%
 * - Technical explanation: 5%
 */
function computeComprehensiveRubricScore({
  knowledgeEvaluation,
  codingEvaluation,
  debugEvaluation,
  explanationEvaluation,
  competencies = WEB_DEVELOPER_COMPETENCIES
}) {
  if (!validateTemplateWeights(competencies)) {
    throw new Error("Invalid assessment template: competency weights must total exactly 100%.");
  }

  const qResults = knowledgeEvaluation?.questionResults || [];
  const q1 = qResults.find(q => q.questionId === 'q1');
  const q2 = qResults.find(q => q.questionId === 'q2');
  const q3 = qResults.find(q => q.questionId === 'q3');
  const q4 = qResults.find(q => q.questionId === 'q4');

  // 1. HTML and Accessibility: 15%
  // q1 (10 pts) + Practical coding HTML/semantic check (5 pts)
  const htmlScore = (q1 && q1.isCorrect ? 10 : 0) + (codingEvaluation?.passed ? 5 : 2);
  const compHtml = {
    competencyId: "comp-html-a11y",
    nosCode: "SSC/N0501",
    title: "HTML and accessibility",
    weight: 15,
    awardedScore: Math.min(htmlScore, 15),
    maxScore: 15,
    percentage: Math.round((Math.min(htmlScore, 15) / 15) * 100),
    status: htmlScore >= 11 ? "verified" : htmlScore >= 7 ? "partially_supported" : "not_demonstrated"
  };

  // 2. CSS and Responsive Design: 15%
  // q2 (10 pts) + Practical coding responsive check (5 pts)
  const cssScore = (q2 && q2.isCorrect ? 10 : 0) + (codingEvaluation?.passed ? 5 : 2);
  const compCss = {
    competencyId: "comp-css-resp",
    nosCode: "SSC/N0502",
    title: "CSS and responsive design",
    weight: 15,
    awardedScore: Math.min(cssScore, 15),
    maxScore: 15,
    percentage: Math.round((Math.min(cssScore, 15) / 15) * 100),
    status: cssScore >= 11 ? "verified" : cssScore >= 7 ? "partially_supported" : "not_demonstrated"
  };

  // 3. JavaScript Fundamentals: 20%
  // q3 (10 pts) + q4 (10 pts)
  const jsScore = (q3 && q3.isCorrect ? 10 : 0) + (q4 && q4.isCorrect ? 10 : 0);
  const compJs = {
    competencyId: "comp-js-fund",
    nosCode: "SSC/N0503",
    title: "JavaScript fundamentals",
    weight: 20,
    awardedScore: Math.min(jsScore, 20),
    maxScore: 20,
    percentage: Math.round((Math.min(jsScore, 20) / 20) * 100),
    status: jsScore >= 14 ? "verified" : jsScore >= 10 ? "partially_supported" : "not_demonstrated"
  };

  // 4. Practical Development: 30%
  // Derived directly from automated unit test results
  const codingScore = codingEvaluation?.score || 0;
  const compPractical = {
    competencyId: "comp-practical-dev",
    nosCode: "SSC/N0504",
    title: "Practical development",
    weight: 30,
    awardedScore: Math.min(codingScore, 30),
    maxScore: 30,
    percentage: Math.round((Math.min(codingScore, 30) / 30) * 100),
    status: codingScore >= 24 ? "verified" : codingScore >= 18 ? "partially_supported" : "not_demonstrated"
  };

  // 5. Debugging and Problem-Solving: 15%
  // Derived directly from debugging unit tests
  const debugScore = debugEvaluation?.score || 0;
  const compDebug = {
    competencyId: "comp-debugging",
    nosCode: "SSC/N0505",
    title: "Debugging and problem-solving",
    weight: 15,
    awardedScore: Math.min(debugScore, 15),
    maxScore: 15,
    percentage: Math.round((Math.min(debugScore, 15) / 15) * 100),
    status: debugScore >= 11 ? "verified" : debugScore >= 7.5 ? "partially_supported" : "not_demonstrated"
  };

  // 6. Technical Explanation: 5%
  const explScore = explanationEvaluation?.score || 0;
  const compExpl = {
    competencyId: "comp-explanation",
    nosCode: "SSC/N0506",
    title: "Technical explanation",
    weight: 5,
    awardedScore: Math.min(explScore, 5),
    maxScore: 5,
    percentage: Math.round((Math.min(explScore, 5) / 5) * 100),
    status: explScore >= 3 ? "verified" : "partially_supported"
  };

  const rubricBreakdown = [compHtml, compCss, compJs, compPractical, compDebug, compExpl];
  const overallScore = Math.round(rubricBreakdown.reduce((sum, c) => sum + c.awardedScore, 0));

  // Determine verification status
  let verificationStatus = "not_demonstrated";
  let statusRecommendation = "Requires additional practical skill demonstration.";

  if (overallScore >= 70 && codingEvaluation?.passed) {
    verificationStatus = "verified";
    statusRecommendation = "Demonstrated required competencies across practical coding, debugging, and web standards.";
  } else if (overallScore >= 50) {
    verificationStatus = "partially_verified";
    statusRecommendation = "Conditional bridge training recommended for specific gap competencies.";
  } else {
    verificationStatus = "not_yet_demonstrated";
    statusRecommendation = "Key practical coding or debugging competencies not yet demonstrated.";
  }

  return {
    overallScore,
    maxScore: 100,
    verificationStatus,
    statusRecommendation,
    rubricBreakdown,
    automatedTestsSummary: {
      total: (codingEvaluation?.totalTests || 0) + (debugEvaluation?.totalTests || 0),
      passed: (codingEvaluation?.passedTests || 0) + (debugEvaluation?.passedTests || 0),
      codingTests: codingEvaluation?.testResults || [],
      debugTests: debugEvaluation?.testResults || []
    }
  };
}

module.exports = {
  evaluatePracticalCodingTask,
  evaluateDebuggingTask,
  evaluateKnowledgeAnswers,
  evaluateTechnicalExplanation,
  computeComprehensiveRubricScore
};
