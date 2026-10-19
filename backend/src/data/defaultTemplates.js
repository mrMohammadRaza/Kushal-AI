/**
 * Default Assessment Templates for Kaushal AI Practical Skill Verification
 * Mapped to Occupational Standards (e.g. SSC/Q0501 - Web Developer NSQF Level 5).
 * Initial weights strictly total 100%:
 * - HTML and accessibility: 15%
 * - CSS and responsive design: 15%
 * - JavaScript fundamentals: 20%
 * - Practical development: 30%
 * - Debugging and problem-solving: 15%
 * - Technical explanation: 5%
 */

const WEB_DEVELOPER_COMPETENCIES = [
  {
    id: "comp-html-a11y",
    nosCode: "SSC/N0501",
    title: "HTML and accessibility",
    weight: 15,
    description: "Semantic markup, keyboard navigation, accessible form controls, and ARIA attributes"
  },
  {
    id: "comp-css-resp",
    nosCode: "SSC/N0502",
    title: "CSS and responsive design",
    weight: 15,
    description: "Flexbox, CSS Grid, mobile-first breakpoints, and color contrast compliance"
  },
  {
    id: "comp-js-fund",
    nosCode: "SSC/N0503",
    title: "JavaScript fundamentals",
    weight: 20,
    description: "ES6+ syntax, state immutability, asynchronous programming, and event delegation"
  },
  {
    id: "comp-practical-dev",
    nosCode: "SSC/N0504",
    title: "Practical development",
    weight: 30,
    description: "Building the interactive, responsive task-list application with full CRUD and validation"
  },
  {
    id: "comp-debugging",
    nosCode: "SSC/N0505",
    title: "Debugging and problem-solving",
    weight: 15,
    description: "Diagnosing controlled defects, fixing state mutation bugs, and passing test suites"
  },
  {
    id: "comp-explanation",
    nosCode: "SSC/N0506",
    title: "Technical explanation",
    weight: 5,
    description: "Documenting architectural trade-offs, defensive sanitization, and accessibility choices"
  }
];

// Helper to validate total weights equal exactly 100
function validateTemplateWeights(competencies) {
  if (!Array.isArray(competencies) || competencies.length === 0) return false;
  const total = competencies.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
  return total === 100;
}

const WEB_DEVELOPER_KNOWLEDGE_TASKS = [
  {
    id: "q1",
    type: "mcq",
    competencyId: "comp-html-a11y",
    prompt: "When implementing a clickable button to delete a task item, which HTML markup pattern ensures native keyboard accessibility (Tab, Enter, Space) and screen-reader support without requiring synthetic tabindex or ARIA role hacks?",
    options: [
      "A. <div onclick=\"deleteTask(id)\" tabindex=\"0\">Delete</div>",
      "B. <button type=\"button\" aria-label=\"Delete task\">Delete</button>",
      "C. <a href=\"javascript:void(0)\" onclick=\"deleteTask(id)\">Delete</a>",
      "D. <span class=\"btn-delete\" onkeypress=\"deleteTask(id)\">Delete</span>"
    ],
    correctAnswer: "B",
    explanation: "The native <button type='button'> provides built-in keyboard activation via Enter/Space, automatically receives focus in the natural tab order, and exposes role='button' in the accessibility tree."
  },
  {
    id: "q2",
    type: "mcq",
    competencyId: "comp-css-resp",
    prompt: "Which CSS technique is best suited for laying out a responsive task list where task items should wrap gracefully on smaller mobile viewports while maintaining consistent row alignment on desktop screens?",
    options: [
      "A. Hardcoded pixel widths with float: left",
      "B. CSS Flexbox with flex-wrap: wrap and gap or CSS Grid with repeat(auto-fit, minmax(280px, 1fr))",
      "C. Fixed HTML table with inline widths",
      "D. Absolute positioning with percentage offsets"
    ],
    correctAnswer: "B",
    explanation: "CSS Flexbox with flex-wrap or CSS Grid auto-fit automatically adapts items across different viewport sizes without requiring brittle fixed dimensions or hardcoded breakpoints."
  },
  {
    id: "q3",
    type: "mcq",
    competencyId: "comp-js-fund",
    prompt: "In modern client-side state management, what is the recommended immutable pattern for updating an array of tasks by toggling the completed status of task with id: 3?",
    options: [
      "A. tasks.find(t => t.id === 3).completed = !tasks.find(t => t.id === 3).completed;",
      "B. tasks.map(t => t.id === 3 ? { ...t, completed: !t.completed } : t);",
      "C. for (let t of tasks) { if (t.id === 3) t.completed = true; }",
      "D. delete tasks[3].completed;"
    ],
    correctAnswer: "B",
    explanation: "Array.prototype.map returning shallow-copied objects ({ ...t, completed: !t.completed }) preserves state immutability, ensuring predictable renders and avoiding state side-effects."
  },
  {
    id: "q4",
    type: "short_answer",
    competencyId: "comp-js-fund",
    prompt: "When rendering user-entered task titles into the DOM dynamically, why is element.textContent preferred over element.innerHTML, and what vulnerability does this prevent?",
    acceptedKeywords: ["xss", "cross-site scripting", "injection", "script injection", "escaping", "plain text", "sanitization", "malicious", "raw html"],
    minCharacters: 15,
    explanation: "element.textContent treats data strictly as raw text rather than executable markup, neutralizing Cross-Site Scripting (XSS) attacks by preventing malicious <script> tags or inline event handlers from executing."
  }
];

const WEB_DEVELOPER_CODING_TASK = {
  id: "task-coding-01",
  title: "Build a Responsive Task-List Application",
  competencyId: "comp-practical-dev",
  weight: 30,
  description: "Build a responsive task-list application that allows users to add, complete, filter, and remove tasks. Validate that empty inputs cannot be added, toggle completion state, provide All/Active/Completed filters, and delete tasks cleanly.",
  starterCode: {
    html: `<div class="task-app" id="app">
  <header class="app-header">
    <h1>My Practical Tasks</h1>
    <p class="subtitle">Organize, filter, and track daily deliverables</p>
  </header>

  <form id="task-form" class="task-input-bar">
    <label for="task-input" class="sr-only">New task title</label>
    <input 
      type="text" 
      id="task-input" 
      placeholder="What needs to be done?" 
      autocomplete="off"
    />
    <button type="submit" id="add-btn">Add Task</button>
  </form>
  <div id="validation-msg" class="validation-msg" role="alert" aria-live="polite"></div>

  <nav class="filter-bar" aria-label="Task filters">
    <button type="button" class="filter-btn active" data-filter="all">All</button>
    <button type="button" class="filter-btn" data-filter="active">Active</button>
    <button type="button" class="filter-btn" data-filter="completed">Completed</button>
  </nav>

  <ul id="task-list" class="task-list" aria-label="Tasks list">
    <!-- Tasks rendered dynamically here -->
  </ul>

  <footer class="app-footer">
    <span id="task-counter">0 items left</span>
  </footer>
</div>`,
    css: `/* Responsive Task-List Styling */
:root {
  --primary: #0284c7;
  --primary-hover: #0369a1;
  --bg-surface: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --danger: #ef4444;
  --success: #10b981;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f1f5f9;
  color: var(--text-main);
  padding: 16px;
  margin: 0;
}

.task-app {
  max-width: 580px;
  margin: 0 auto;
  background: var(--bg-surface);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

.app-header h1 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  color: var(--text-main);
}
.subtitle {
  margin: 0 0 16px 0;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.task-input-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}
.task-input-bar input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
}
.task-input-bar input:focus {
  outline: 2px solid var(--primary);
  border-color: transparent;
}
.task-input-bar button {
  padding: 10px 18px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.task-input-bar button:hover {
  background: var(--primary-hover);
}

.validation-msg {
  min-height: 20px;
  font-size: 0.8rem;
  color: var(--danger);
  margin-bottom: 12px;
}

.filter-bar {
  display: flex;
  gap: 6px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 12px;
}
.filter-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.825rem;
  cursor: pointer;
  color: var(--text-muted);
}
.filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fafafa;
}
.task-item.completed .task-text {
  text-decoration: line-through;
  color: var(--text-muted);
}
.task-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.delete-btn {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.delete-btn:hover {
  background: #fee2e2;
}

.app-footer {
  font-size: 0.825rem;
  color: var(--text-muted);
  display: flex;
  justify-content: space-between;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}`,
    javascript: `// Interactive Task-List Application
let tasks = [
  { id: 1, text: "Review semantic HTML checklist", completed: false },
  { id: 2, text: "Verify CSS Flexbox responsiveness", completed: true }
];
let currentFilter = 'all';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const validationMsg = document.getElementById('validation-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskCounter = document.getElementById('task-counter');

function validateInput(text) {
  if (!text || text.trim().length === 0) {
    return "Task title cannot be empty.";
  }
  return null;
}

function renderTasks() {
  if (!taskList) return;
  taskList.innerHTML = '';
  
  const filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as completed');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(span);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete task "' + task.text + '"');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  if (taskCounter) {
    taskCounter.textContent = activeCount + ' item' + (activeCount === 1 ? '' : 's') + ' left';
  }
}

function addTask(title) {
  const error = validateInput(title);
  if (error) {
    if (validationMsg) validationMsg.textContent = error;
    return false;
  }
  if (validationMsg) validationMsg.textContent = '';

  const newTask = {
    id: Date.now(),
    text: title.trim(),
    completed: false
  };

  tasks.push(newTask);
  renderTasks();
  if (taskInput) taskInput.value = '';
  return true;
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === Number(id) ? { ...t, completed: !t.completed } : t);
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== Number(id));
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderTasks();
}

if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (taskInput) addTask(taskInput.value);
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');
    if (filter) setFilter(filter);
  });
});

renderTasks();`
  },
  automatedTests: [
    {
      id: "test1_empty_validation",
      name: "Input validation rejects empty or whitespace-only inputs",
      points: 6,
      criterion: "Validation check returns error and prevents empty task creation"
    },
    {
      id: "test2_add_task",
      name: "Adds valid task item to list with correct title",
      points: 6,
      criterion: "Task is appended to collection with active state"
    },
    {
      id: "test3_toggle_task",
      name: "Toggles completion status and updates task state",
      points: 6,
      criterion: "Completed state is toggled immutably"
    },
    {
      id: "test4_filter_tasks",
      name: "Filters tasks accurately across All, Active, and Completed views",
      points: 6,
      criterion: "Filtering returns exact matching task subsets"
    },
    {
      id: "test5_delete_task",
      name: "Deletes selected task and updates remaining active count",
      points: 6,
      criterion: "Task is removed from collection"
    }
  ]
};

const WEB_DEVELOPER_DEBUG_TASK = {
  id: "task-debug-01",
  title: "Debug Task Filtering & State Immutability Flaws",
  competencyId: "comp-debugging",
  weight: 15,
  description: "A junior developer implemented task filtering and keyword search in `filterAndSearchTasks`. However, it mutates the input array with splice (permanently destroying tasks upon filtering) and performs case-sensitive search missing matching tasks. Fix both defects so all test assertions pass.",
  defectiveCode: `/**
 * DEFECTIVE IMPLEMENTATION:
 * Flaw 1: Mutates masterList in place with splice(), permanently destroying items.
 * Flaw 2: Untrimmed, case-sensitive matching fails for mixed case searches.
 */
function filterAndSearchTasks(masterList, filterType, searchQuery) {
  // BUG: Direct reference mutation!
  var result = masterList;

  if (filterType === 'active') {
    for (var i = result.length - 1; i >= 0; i--) {
      if (result[i].completed === true) {
        result.splice(i, 1); // DESTRUCTIVE IN-PLACE MUTATION
      }
    }
  } else if (filterType === 'completed') {
    for (var i = result.length - 1; i >= 0; i--) {
      if (result[i].completed === false) {
        result.splice(i, 1); // DESTRUCTIVE IN-PLACE MUTATION
      }
    }
  }

  // BUG: Case-sensitive and untrimmed search
  if (searchQuery) {
    result = result.filter(function(task) {
      return task.text.indexOf(searchQuery) !== -1;
    });
  }

  return result;
}`,
  fixedReferenceCode: `function filterAndSearchTasks(masterList, filterType, searchQuery) {
  if (!Array.isArray(masterList)) return [];

  // Non-destructive shallow copy / filter
  let result = masterList.filter(task => {
    if (filterType === 'active') return !task.completed;
    if (filterType === 'completed') return task.completed;
    return true; // 'all'
  });

  if (searchQuery && typeof searchQuery === 'string') {
    const normalized = searchQuery.trim().toLowerCase();
    if (normalized.length > 0) {
      result = result.filter(task => 
        task.text && task.text.toLowerCase().includes(normalized)
      );
    }
  }

  return result;
}`,
  automatedTests: [
    {
      id: "debug_test1_immutability",
      name: "Filtering does not mutate the original masterList array",
      points: 7.5,
      criterion: "Original array length and elements remain intact after multiple filter calls"
    },
    {
      id: "debug_test2_case_insensitive_search",
      name: "Search is case-insensitive and trims leading/trailing whitespace",
      points: 7.5,
      criterion: "Search query '  html ' correctly matches 'Semantic HTML5 Markup'"
    }
  ]
};

const WEB_DEVELOPER_RULES = {
  timeLimitMinutes: 60,
  passingScore: 70,
  partialScore: 50,
  instructions: [
    "Part 1: Answer 4 knowledge questions testing HTML, CSS, JavaScript, and Web Security.",
    "Part 2: Implement the responsive Task-List application according to automated test requirements.",
    "Part 3: Fix 2 controlled defects in the provided task filtering code and pass test assertions.",
    "Part 4: Submit a brief architectural explanation of your solution and optional multimodal evidence.",
    "An authorized human assessor will review your automated results, code quality, and explanation before sign-off."
  ],
  accessibilityOptions: [
    "Voice instruction synthesis",
    "High contrast theme support",
    "Screen reader semantic landmarks",
    "Full keyboard navigability"
  ]
};

const WEB_DEVELOPER_TEMPLATE = {
  id: "tpl-web-developer-v1",
  trade_id: "web-developer-l5",
  title: "Web Developer Practical Verification Blueprint (Level 5)",
  version: "1.0.0",
  description: "Comprehensive hybrid assessment verifying semantic HTML, responsive CSS, JavaScript DOM & state management, practical task-list development, defect debugging, and architectural explanation.",
  level: 5,
  competencies: WEB_DEVELOPER_COMPETENCIES,
  knowledge_tasks: WEB_DEVELOPER_KNOWLEDGE_TASKS,
  coding_task: WEB_DEVELOPER_CODING_TASK,
  debug_task: WEB_DEVELOPER_DEBUG_TASK,
  scoring_rubric: {
    totalMaxScore: 100,
    passingThreshold: 70,
    competencies: WEB_DEVELOPER_COMPETENCIES
  },
  rules: WEB_DEVELOPER_RULES,
  active: 1
};

/**
 * Validates that competency weights in an assessment template total exactly 100%.
 */
function validateAssessmentWeights(competencies = []) {
  if (!Array.isArray(competencies) || competencies.length === 0) {
    return {
      isValid: false,
      total: 0,
      error: "Competencies must be a non-empty array."
    };
  }

  const total = competencies.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
  const isValid = Math.abs(total - 100) < 0.001;

  return {
    isValid,
    total,
    error: isValid ? null : `Total weight must equal 100%. Currently totals ${total}%.`
  };
}

module.exports = {
  WEB_DEVELOPER_TEMPLATE,
  WEB_DEVELOPER_COMPETENCIES,
  WEB_DEVELOPER_KNOWLEDGE_TASKS,
  WEB_DEVELOPER_CODING_TASK,
  WEB_DEVELOPER_DEBUG_TASK,
  WEB_DEVELOPER_RULES,
  validateTemplateWeights,
  validateAssessmentWeights
};
