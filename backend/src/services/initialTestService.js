/**
 * Initial Skill Test Service for Kaushal AI
 * Delivers occupation-specific short tests during candidate onboarding.
 * Evaluates candidate responses strictly server-side to prevent client-side answer key exposure.
 */

const { db, logAuditEvent } = require('../data/database');
const crypto = require('crypto');

// Initial Skill Tests per Trade
const INITIAL_TEST_BANKS = {
  'web-developer-l5': {
    tradeId: 'web-developer-l5',
    tradeName: 'Web Developer (NSQF Level 5)',
    version: '1.0.0',
    passingThreshold: 60,
    questions: [
      {
        id: 'init-wd-1',
        category: 'HTML & Accessibility',
        prompt: 'Which HTML markup correctly associates a visible text label with a text input for screen reader users and assistive technology?',
        options: [
          'A. <label for="candidate-email">Email</label><input type="email" id="candidate-email" name="email" required />',
          'B. <span class="label">Email</span><input type="email" name="email" placeholder="Email" />',
          'C. <input type="email" name="email" value="Email" />',
          'D. <div onclick="focusInput()">Email</div><input type="email" name="email" />'
        ],
        correctAnswer: 'A',
        explanation: 'Explicit <label for="id"> pairing creates an accessible name relation in the accessibility tree and allows clicking the label to focus the input.'
      },
      {
        id: 'init-wd-2',
        category: 'CSS & Responsive Design',
        prompt: 'To ensure a website layout renders responsively on mobile viewports without horizontal scrolling, which viewport meta tag and CSS technique is essential?',
        options: [
          'A. <meta name="viewport" content="width=1024"> with hardcoded 960px container widths',
          'B. <meta name="viewport" content="width=device-width, initial-scale=1.0"> with percentage/rem units and CSS Flexbox/Grid',
          'C. <meta name="viewport" content="user-scalable=no"> with fixed absolute positioning',
          'D. Disabling CSS media queries and using JavaScript screen.width detection'
        ],
        correctAnswer: 'B',
        explanation: 'The standard viewport meta tag combined with fluid units (rem/%) and CSS Flexbox/Grid ensures layouts adapt fluidly across varying screen sizes.'
      },
      {
        id: 'init-wd-3',
        category: 'JavaScript Fundamentals',
        prompt: 'What will be output to the console by the following asynchronous JavaScript code snippet?\n\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");',
        options: [
          'A. 1, 2, 3, 4',
          'B. 1, 4, 2, 3',
          'C. 1, 4, 3, 2',
          'D. 1, 3, 4, 2'
        ],
        correctAnswer: 'C',
        explanation: 'Synchronous execution runs first (1, 4). Microtasks (Promise.then) run next (3). Macrotasks (setTimeout) execute in the subsequent event loop tick (2).'
      },
      {
        id: 'init-wd-4',
        category: 'Security & Web Safety',
        prompt: 'When rendering user-submitted text content into an HTML document, how do you prevent Stored Cross-Site Scripting (XSS)?',
        options: [
          'A. Using element.innerHTML = userContent directly',
          'B. Using element.textContent or properly escaping HTML entities (&, <, >, ", \') before insertion',
          'C. Storing the input in localStorage instead of a database',
          'D. Base64 encoding the input before assigning to innerHTML'
        ],
        correctAnswer: 'B',
        explanation: 'Assigning to textContent or escaping HTML special characters treats input as plain text rather than executable markup, neutralizing script injection.'
      },
      {
        id: 'init-wd-5',
        category: 'Debugging & State Management',
        prompt: 'A React component has the following bug: task items added to the list do not trigger a re-render. What is the root cause?\n\nfunction addTask(item) {\n  tasks.push(item);\n  setTasks(tasks);\n}',
        options: [
          'A. setTasks must be called inside setTimeout',
          'B. tasks.push mutates the existing array reference in-place, so React sees identical object identity and skips re-rendering',
          'C. push() is deprecated in modern JavaScript',
          'D. Array state must always be converted to JSON strings'
        ],
        correctAnswer: 'B',
        explanation: 'Direct mutation violates immutability. Creating a new reference with setTasks([...tasks, item]) notifies React of state changes.'
      }
    ]
  }
};

/**
 * Returns public question set for candidate (scrubbed of answer keys).
 */
function getPublicInitialTest(tradeId = 'web-developer-l5') {
  const bank = INITIAL_TEST_BANKS[tradeId] || INITIAL_TEST_BANKS['web-developer-l5'];
  return {
    tradeId: bank.tradeId,
    tradeName: bank.tradeName,
    version: bank.version,
    totalQuestions: bank.questions.length,
    passingThreshold: bank.passingThreshold,
    questions: bank.questions.map(q => ({
      id: q.id,
      category: q.category,
      prompt: q.prompt,
      options: q.options
    }))
  };
}

/**
 * Evaluates candidate submission server-side.
 */
function evaluateInitialTestSubmission({ tradeId = 'web-developer-l5', email, candidateId, answers = {} }) {
  const bank = INITIAL_TEST_BANKS[tradeId] || INITIAL_TEST_BANKS['web-developer-l5'];
  
  let correctCount = 0;
  const breakdown = [];

  bank.questions.forEach(q => {
    const candidateAnswer = (answers[q.id] || '').trim().toUpperCase();
    const isCorrect = candidateAnswer === q.correctAnswer;
    if (isCorrect) correctCount++;

    breakdown.push({
      questionId: q.id,
      category: q.category,
      candidateAnswer: candidateAnswer || 'UNANSWERED',
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation
    });
  });

  const totalQuestions = bank.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  let readinessLevel = 'Foundational';
  let recommendation = 'Recommended for RPL Foundation & Practical Skill Assessment';

  if (percentage >= 80) {
    readinessLevel = 'Advanced Practical';
    recommendation = 'Strong conceptual foundation. Ready for Level 5 Practical Coding & Assessor Verification.';
  } else if (percentage >= 60) {
    readinessLevel = 'Competent Practitioner';
    recommendation = 'Solid working knowledge. Proceed to full Web Developer Practical Verification.';
  } else {
    readinessLevel = 'Foundational / Developing';
    recommendation = 'Eligible for RPL assessment with recommended preparatory review in modern ES6 and responsive layouts.';
  }

  const testId = `inittest-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  // Persist attempt in database
  db.prepare(`
    INSERT INTO candidate_initial_tests (
      id, candidate_id, email, trade_id, version, score,
      total_questions, percentage, readiness_level, recommendation,
      answers_json, evaluations_json, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    testId,
    candidateId || null,
    (email || 'guest@candidate.rpl').trim().toLowerCase(),
    bank.tradeId,
    bank.version,
    correctCount,
    totalQuestions,
    percentage,
    readinessLevel,
    recommendation,
    JSON.stringify(answers),
    JSON.stringify(breakdown)
  );

  return {
    testId,
    tradeId: bank.tradeId,
    tradeName: bank.tradeName,
    score: correctCount,
    totalQuestions,
    percentage,
    readinessLevel,
    recommendation,
    breakdown
  };
}

module.exports = {
  INITIAL_TEST_BANKS,
  getPublicInitialTest,
  evaluateInitialTestSubmission
};
