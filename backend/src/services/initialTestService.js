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
  },
  'electrician-l3': {
    tradeId: 'electrician-l3',
    tradeName: 'Assistant Electrician (NSQF Level 3)',
    version: '1.0.0',
    passingThreshold: 60,
    questions: [
      {
        id: 'init-elec-1',
        category: 'Safety & PPE',
        prompt: 'Before working on a domestic 230V distribution board, what is the mandatory safety step to ensure de-energization?',
        options: [
          'A. Turn off the main MCB/isolator, lockout/tagout (LOTO), and verify zero voltage using an approved rated voltage tester',
          'B. Wear cotton gloves and touch the neutral conductor first',
          'C. Turn off only the local room switch while keeping the phase energized',
          'D. Pour water on the grounding electrode'
        ],
        correctAnswer: 'A',
        explanation: 'Isolation at the source with lockout/tagout and testing for dead voltage with a verified tester is mandatory under electrical safety codes.'
      },
      {
        id: 'init-elec-2',
        category: 'Tools & Measurement',
        prompt: 'Which multimeter setting and procedure is correct for testing continuity of an earth wire circuit?',
        options: [
          'A. Set to AC Voltage 600V with circuit energized',
          'B. Set to Low Resistance / Continuity beeper with circuit completely de-energized',
          'C. Set to DC Amperes 10A in parallel with the load',
          'D. Set to Frequency (Hz) on the ground terminal'
        ],
        correctAnswer: 'B',
        explanation: 'Continuity testing measures electrical continuity via resistance and must strictly be performed on de-energized circuits to protect the operator and meter.'
      },
      {
        id: 'init-elec-3',
        category: 'Wiring Standards',
        prompt: 'According to Indian Standard (IS 732) color coding for single-phase AC domestic wiring, what is the standard color for the Phase, Neutral, and Protective Earth conductors?',
        options: [
          'A. Phase: Red/Brown, Neutral: Black/Blue, Earth: Green/Green-Yellow',
          'B. Phase: Green, Neutral: Red, Earth: Black',
          'C. Phase: Black, Neutral: Yellow, Earth: Blue',
          'D. Any color can be used interchangeably'
        ],
        correctAnswer: 'A',
        explanation: 'Standard single-phase wiring identifies Phase as Red (or Brown), Neutral as Black (or Blue), and Protective Earth as Green or Green-Yellow.'
      },
      {
        id: 'init-elec-4',
        category: 'Protection Devices',
        prompt: 'What is the primary function of an Earth Leakage Circuit Breaker (ELCB) or Residual Current Circuit Breaker (RCCB)?',
        options: [
          'A. To boost system voltage during peak load hours',
          'B. To detect current leaking to earth and trip quickly (typically <=30mA) to prevent fatal electric shocks',
          'C. To count total kilowatt-hours consumed',
          'D. To convert AC electricity to DC electricity'
        ],
        correctAnswer: 'B',
        explanation: 'RCCBs detect imbalanced current between phase and neutral and trip rapidly at 30mA to protect human life against electrocution.'
      },
      {
        id: 'init-elec-5',
        category: 'Earthing & Grounding',
        prompt: 'Why is chemical pipe/plate earthing with salt and charcoal/bentonite maintained in soil around domestic and commercial installations?',
        options: [
          'A. To increase earth resistance above 100 Ohms',
          'B. To maintain low soil resistivity and ensure a low impedance path (typically < 5 Ohms) to ground for fault currents',
          'C. To generate backup electricity for emergency lighting',
          'D. To prevent cables from getting warm'
        ],
        correctAnswer: 'B',
        explanation: 'Proper earthing ensures that ground fault current flows directly to earth, tripping circuit protection before metal enclosures reach hazardous voltages.'
      }
    ]
  },
  'automotive-l4': {
    tradeId: 'automotive-l4',
    tradeName: 'Automotive Service Technician (NSQF Level 4)',
    version: '1.0.0',
    passingThreshold: 60,
    questions: [
      {
        id: 'init-auto-1',
        category: 'Workshop Safety',
        prompt: 'When raising a vehicle on a hydraulic twin-post workshop lift, which safety requirement is mandatory before working underneath?',
        options: [
          'A. Ensure all lift mechanical safety lock latches are fully engaged and vehicle balance points are secure',
          'B. Keep the hydraulic pressure release valve open',
          'C. Rely solely on hydraulic pressure without mechanical lock arms',
          'D. Start the engine while the vehicle is elevated'
        ],
        correctAnswer: 'A',
        explanation: 'Mechanical locks must be fully engaged on structural lift points to prevent accidental hydraulic descent while technicians work underneath.'
      },
      {
        id: 'init-auto-2',
        category: 'Diagnostics & Electronics',
        prompt: 'What does a flashing Check Engine Light (MIL) and an OBD-II Diagnostic Trouble Code starting with P0300 typically indicate?',
        options: [
          'A. Engine random/multiple cylinder misfire capable of damaging the catalytic converter',
          'B. Low tire inflation pressure in the spare wheel',
          'C. Normal vehicle break-in reminder',
          'D. Radio antenna signal loss'
        ],
        correctAnswer: 'A',
        explanation: 'A flashing Check Engine Light signals a severe cylinder misfire (P0300 series) that allows unburnt fuel into the exhaust, threatening catastrophic catalytic converter overheating.'
      },
      {
        id: 'init-auto-3',
        category: 'Braking Systems',
        prompt: 'During disc brake inspection, what minimum measurement checks must be conducted on the brake disc rotor before fitting new friction pads?',
        options: [
          'A. Measure rotor thickness with a micrometer against manufacturer minimum discard thickness and check lateral runout with a dial indicator',
          'B. Spray water on the rotor while hot',
          'C. Check only the paint color on the caliper bracket',
          'D. Tighten wheel nuts with an uncalibrated pneumatic wrench'
        ],
        correctAnswer: 'A',
        explanation: 'Measuring rotor thickness and lateral runout against OEM minimum discard specifications prevents brake pulsation, fading, and catastrophic rotor failure.'
      },
      {
        id: 'init-auto-4',
        category: 'Engine Lubrication & Cooling',
        prompt: 'Why must engine coolant never be inspected or topped up by removing the radiator pressure cap while the engine is hot?',
        options: [
          'A. The pressurized boiling coolant (over 100°C) will flash into steam and cause severe burn injuries',
          'B. It drains the vehicle 12V battery',
          'C. It changes the oil viscosity grade',
          'D. It causes spark plug fouling'
        ],
        correctAnswer: 'A',
        explanation: 'Under operating temperature, cooling systems operate at 0.9 to 1.3 bar. Releasing the cap causes explosive boiling and severe scald burns.'
      },
      {
        id: 'init-auto-5',
        category: 'Electrical & Battery',
        prompt: 'When disconnecting a lead-acid vehicle battery, which terminal must be disconnected first, and why?',
        options: [
          'A. The negative (Ground) terminal first, to prevent accidental short circuits if a tool contacts the vehicle chassis',
          'B. The positive terminal first with a steel wrench touching the body',
          'C. Both terminals simultaneously with bare hands',
          'D. Battery terminals must never be disconnected during service'
        ],
        correctAnswer: 'A',
        explanation: 'Removing the ground (negative) terminal first breaks the return path so that if a wrench accidentally touches the metal chassis while loosening the positive terminal, no dead short occurs.'
      }
    ]
  },
  'solar-l4': {
    tradeId: 'solar-l4',
    tradeName: 'Solar PV Installation Technician (NSQF Level 4)',
    version: '1.0.0',
    passingThreshold: 60,
    questions: [
      {
        id: 'init-solar-1',
        category: 'PV Safety & High Voltage DC',
        prompt: 'Why are solar PV array strings considered energized whenever exposed to sunlight, even when the inverter is turned off?',
        options: [
          'A. Solar photovoltaic cells generate open-circuit direct current (Voc) as soon as daylight strikes them; they cannot be switched off at the cell',
          'B. Because batteries back-feed the panels constantly',
          'C. Panels only produce power at night',
          'D. DC current does not pose an electric shock hazard'
        ],
        correctAnswer: 'A',
        explanation: 'Photovoltaic modules generate hazardous DC voltage upon exposure to light. The array remains live until covered or mechanically disconnected.'
      },
      {
        id: 'init-solar-2',
        category: 'Orientation & Tilt',
        prompt: 'In India (Northern Hemisphere), in which direction should fixed rooftop solar panels face, and at what approximate tilt angle for optimal annual yield?',
        options: [
          'A. True South, at an angle approximately equal to the local site latitude',
          'B. True North, at 90 degrees vertical',
          'C. True East, flat at 0 degrees',
          'D. Direction does not affect solar yield'
        ],
        correctAnswer: 'A',
        explanation: 'In the Northern hemisphere, facing True South with a tilt angle close to the installation latitude maximizes total solar irradiation over the entire year.'
      },
      {
        id: 'init-solar-3',
        category: 'Inverter & MPPT',
        prompt: 'What is the role of Maximum Power Point Tracking (MPPT) in modern solar grid-tie inverters?',
        options: [
          'A. Dynamically adjusting electrical operating point to extract peak power from PV strings under fluctuating irradiance and temperature',
          'B. Cooling the solar panel glass with fans',
          'C. Turning off grid power during sunny days',
          'D. Converting AC into battery DC power'
        ],
        correctAnswer: 'A',
        explanation: 'MPPT algorithms dynamically sweep the current-voltage curve to keep the array operating at its Pmax (Vmp x Imp) point under changing sun and heat.'
      },
      {
        id: 'init-solar-4',
        category: 'System Protection',
        prompt: 'What is the purpose of Surge Protection Devices (SPD) in the DC Array Junction Box (AJB)?',
        options: [
          'A. To protect sensitive inverters and panels from transient overvoltages caused by nearby lightning discharges',
          'B. To increase solar panel efficiency in winter',
          'C. To prevent dust accumulation on panels',
          'D. To measure power factor'
        ],
        correctAnswer: 'A',
        explanation: 'Type II DC SPDs clamp transient surge spikes induced by lightning and shunt excessive surge currents safely to earth.'
      },
      {
        id: 'init-solar-5',
        category: 'Earthing & Structural Safety',
        prompt: 'Why must metallic mounting structures (MMS) and PV module aluminum frames be bonded with equipotential earthing conductors?',
        options: [
          'A. To ensure all exposed metalwork is held at earth potential, preventing lethal touch voltages in case of insulation breakdown',
          'B. To increase weight of the structure against wind',
          'C. To improve wireless Wi-Fi signals from the inverter',
          'D. To reduce panel surface temperature'
        ],
        correctAnswer: 'A',
        explanation: 'Equipotential bonding ensures that any frame insulation failure immediately causes the ground fault protection device to trip without shocking personnel.'
      }
    ]
  },
  'generic-vocational': {
    tradeId: 'generic-vocational',
    tradeName: 'Vocational Safety & Practical Foundation Screening',
    version: '1.0.0',
    passingThreshold: 60,
    questions: [
      {
        id: 'init-gen-1',
        category: 'Workplace Safety & PPE',
        prompt: 'What is the first and most critical rule when entering any vocational workshop, construction site, or industrial plant?',
        options: [
          'A. Don all required Personal Protective Equipment (PPE) including safety footwear, eye protection, and helmet before entering the work area',
          'B. Begin operating machinery immediately without checking guards',
          'C. Store tools on walkways',
          'D. Disable all emergency stop switches'
        ],
        correctAnswer: 'A',
        explanation: 'Mandatory PPE compliance prevents physical, mechanical, and chemical injuries before entering any active work zone.'
      },
      {
        id: 'init-gen-2',
        category: 'Hazard Identification',
        prompt: 'If you notice damaged electrical cords, fluid leaks on the floor, or missing safety guards on a tool, what must you do immediately?',
        options: [
          'A. Stop using the equipment, report the hazard, tag it out of service, and inform your supervisor',
          'B. Continue working and ignore the issue',
          'C. Cover the hazard with paper or cardboard',
          'D. Attempt improvised repairs while energized'
        ],
        correctAnswer: 'A',
        explanation: 'Hazard identification, immediate cessation of dangerous equipment, and proper tagging out prevents catastrophic workplace accidents.'
      },
      {
        id: 'init-gen-3',
        category: 'Quality & Measurement',
        prompt: 'Why is it essential to verify that precision measuring tools (such as calipers, meters, or torque wrenches) are in calibration before starting a task?',
        options: [
          'A. To ensure measurements are accurate and within technical tolerances, preventing costly rework or safety failures',
          'B. Calibrating tools is optional and not required in vocational work',
          'C. It speeds up the work clock',
          'D. It replaces the need for blueprints'
        ],
        correctAnswer: 'A',
        explanation: 'Calibrated measurement tools ensure dimensional, electrical, and mechanical accuracy according to occupational specifications.'
      },
      {
        id: 'init-gen-4',
        category: 'Emergency Response',
        prompt: 'In case of an electrical fire in equipment or panels, which type of fire extinguisher is safe to use?',
        options: [
          'A. Carbon Dioxide (CO2) or Clean Agent / Dry Chemical Powder extinguisher',
          'B. Water stream extinguisher',
          'C. Foam extinguisher conductive to electricity',
          'D. Wet blanket soaked in conductive water'
        ],
        correctAnswer: 'A',
        explanation: 'CO2 and non-conductive Dry Chemical Powder extinguish electrical fires safely without conducting current back to the operator.'
      },
      {
        id: 'init-gen-5',
        category: 'Standard Operating Procedures',
        prompt: 'What is the purpose of following Standard Operating Procedures (SOP) and Technical Blueprints during practical tasks?',
        options: [
          'A. To guarantee consistent quality, safety compliance, and repeatability according to national standards',
          'B. To avoid talking with colleagues',
          'C. Blueprints are only suggestions that can be ignored',
          'D. To eliminate testing requirements'
        ],
        correctAnswer: 'A',
        explanation: 'SOPs and blueprints provide established engineering guidelines that ensure workmanship meets statutory and safety requirements.'
      }
    ]
  }
};

/**
 * Resolves trade ID to appropriate test bank, handling aliases and honest fallback.
 */
function resolveTestBank(tradeId) {
  if (!tradeId) return INITIAL_TEST_BANKS['web-developer-l5'];
  const clean = String(tradeId).toLowerCase().trim();

  if (INITIAL_TEST_BANKS[clean]) {
    return INITIAL_TEST_BANKS[clean];
  }

  // Alias resolution
  if (clean.includes('web') || clean.includes('developer') || clean.includes('frontend')) {
    return INITIAL_TEST_BANKS['web-developer-l5'];
  }
  if (clean.includes('electrician') || clean.includes('electrical')) {
    return clean.includes('l4') ? (INITIAL_TEST_BANKS['electrician-l4'] || INITIAL_TEST_BANKS['electrician-l3']) : INITIAL_TEST_BANKS['electrician-l3'];
  }
  if (clean.includes('auto') || clean.includes('mechanic') || clean.includes('vehicle')) {
    return INITIAL_TEST_BANKS['automotive-l4'];
  }
  if (clean.includes('solar') || clean.includes('pv')) {
    return INITIAL_TEST_BANKS['solar-l4'];
  }

  // Clearly marked honest vocational fallback
  return INITIAL_TEST_BANKS['generic-vocational'];
}

/**
 * Returns public question set for candidate (scrubbed of answer keys).
 */
function getPublicInitialTest(tradeId = 'web-developer-l5') {
  const bank = resolveTestBank(tradeId);
  return {
    tradeId: bank.tradeId,
    tradeName: bank.tradeName,
    version: bank.version,
    totalQuestions: bank.questions.length,
    passingThreshold: bank.passingThreshold,
    isFallback: bank.tradeId === 'generic-vocational' && tradeId !== 'generic-vocational',
    fallbackNote: bank.tradeId === 'generic-vocational' && tradeId !== 'generic-vocational'
      ? `Specific question bank for '${tradeId}' is pending formal indexing. Serving standard Vocational Safety & Practical Foundation Screening.`
      : null,
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
  const bank = resolveTestBank(tradeId);
  
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
    recommendation = `Strong conceptual foundation in ${bank.tradeName}. Ready for Practical Skill & Assessor Verification.`;
  } else if (percentage >= 60) {
    readinessLevel = 'Competent Practitioner';
    recommendation = `Solid working knowledge in ${bank.tradeName}. Proceed to Practical Skill Verification.`;
  } else {
    readinessLevel = 'Foundational / Developing';
    recommendation = `Eligible for RPL assessment with recommended preparatory review in core trade safety and standards.`;
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
    breakdown,
    disclaimer: "This initial screening test evaluates baseline occupational familiarity and does not confer official qualification or statutory certification."
  };
}

module.exports = {
  INITIAL_TEST_BANKS,
  resolveTestBank,
  getPublicInitialTest,
  evaluateInitialTestSubmission
};

