import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  Send, 
  Save, 
  Code2, 
  Bug, 
  HelpCircle, 
  MessageSquare, 
  UploadCloud, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Layers, 
  Clock, 
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Eye,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Terminal
} from 'lucide-react';

export default function HybridTestEngine({
  assessment,
  template,
  candidateProfile,
  onCompleteSubmission,
  onCancel,
  lang = 'en'
}) {
  const isHi = lang === 'hi';
  const assessmentId = assessment?.id;

  // Active stage: 'knowledge' | 'coding' | 'debugging' | 'evidence'
  const [currentStage, setCurrentStage] = useState(assessment?.current_step || 'knowledge');

  // Stage 1: Knowledge Questions State
  const knowledgeQuestions = template?.knowledgeTasks || [];
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [knowledgeAnswers, setKnowledgeAnswers] = useState(() => {
    return assessment?.knowledgeSubmission?.answers || {};
  });
  const [knowledgeFeedback, setKnowledgeFeedback] = useState(() => {
    return assessment?.knowledgeSubmission?.evaluation || null;
  });
  const [isSubmittingKnowledge, setIsSubmittingKnowledge] = useState(false);

  // Stage 2: Practical Coding Task State
  const defaultCoding = template?.codingTask?.starterCode || { html: '', css: '', javascript: '' };
  const [codeTab, setCodeTab] = useState('javascript'); // 'html' | 'css' | 'javascript'
  const [htmlCode, setHtmlCode] = useState(() => {
    return assessment?.codingSubmission?.code?.html || defaultCoding.html;
  });
  const [cssCode, setCssCode] = useState(() => {
    return assessment?.codingSubmission?.code?.css || defaultCoding.css;
  });
  const [jsCode, setJsCode] = useState(() => {
    return assessment?.codingSubmission?.code?.javascript || defaultCoding.javascript;
  });
  const [codingTestResults, setCodingTestResults] = useState(() => {
    return assessment?.codingSubmission?.testResults || null;
  });
  const [isRunningCodingTests, setIsRunningCodingTests] = useState(false);
  const [isSubmittingCoding, setIsSubmittingCoding] = useState(false);

  // Stage 3: Debugging Task State
  const defaultDebugCode = template?.debugTask?.defectiveCode || '';
  const [debugCode, setDebugCode] = useState(() => {
    return assessment?.debugSubmission?.code || defaultDebugCode;
  });
  const [debugTestResults, setDebugTestResults] = useState(() => {
    return assessment?.debugSubmission?.testResults || null;
  });
  const [isRunningDebugTests, setIsRunningDebugTests] = useState(false);
  const [isSubmittingDebug, setIsSubmittingDebug] = useState(false);

  // Stage 4: Explanation & Evidence State
  const [explanationText, setExplanationText] = useState(assessment?.explanation_text || '');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedVoiceAudio, setRecordedVoiceAudio] = useState(null);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // Save Indicator
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const previewIframeRef = useRef(null);

  // Synchronize Live Preview Iframe for Practical Task
  useEffect(() => {
    if (previewIframeRef.current) {
      const combinedDoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              ${cssCode}
            </style>
          </head>
          <body>
            ${htmlCode}
            <script>
              try {
                ${jsCode}
              } catch(e) {
                console.error("User script error:", e);
              }
            </script>
          </body>
        </html>
      `;
      previewIframeRef.current.srcdoc = combinedDoc;
    }
  }, [htmlCode, cssCode, jsCode, codeTab, currentStage]);

  // Voice recording timer simulation
  useEffect(() => {
    let interval = null;
    if (isRecordingVoice) {
      interval = setInterval(() => setVoiceSeconds(s => s + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Auto-save draft progress to server
  const saveDraftProgress = async () => {
    if (!assessmentId) return;
    setIsAutoSaving(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      await fetch(`/api/assessments/${assessmentId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentStep: currentStage,
          knowledgeAnswers,
          codingSubmission: { code: { html: htmlCode, css: cssCode, javascript: jsCode } },
          debugSubmission: { code: debugCode },
          explanationText
        })
      });
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn("Auto-save failed:", e);
    } finally {
      setIsAutoSaving(false);
    }
  };

  // 1. Submit Knowledge Questions
  const handleSubmitKnowledge = async () => {
    setIsSubmittingKnowledge(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/submit-knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ answers: knowledgeAnswers })
      });
      if (res.ok) {
        const data = await res.json();
        setKnowledgeFeedback(data.evaluation);
        setCurrentStage('coding');
      } else {
        alert("Failed to submit knowledge questions. Please verify all questions are answered.");
      }
    } catch (err) {
      console.error("Knowledge submit error:", err);
      // Local fallback for offline mode
      setCurrentStage('coding');
    } finally {
      setIsSubmittingKnowledge(false);
    }
  };

  // 2. Run Practical Tests on Demand
  const handleRunPracticalTests = async () => {
    setIsRunningCodingTests(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/run-code-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ javascript: jsCode, html: htmlCode, css: cssCode })
      });
      if (res.ok) {
        const data = await res.json();
        setCodingTestResults(data);
      }
    } catch (e) {
      console.error("Test execution failed:", e);
    } finally {
      setIsRunningCodingTests(false);
    }
  };

  // Submit Practical Task Code
  const handleSubmitPracticalCode = async () => {
    setIsSubmittingCoding(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ javascript: jsCode, html: htmlCode, css: cssCode })
      });
      if (res.ok) {
        const data = await res.json();
        setCodingTestResults(data.testResults);
        setCurrentStage('debugging');
      }
    } catch (e) {
      console.error("Coding submission error:", e);
      setCurrentStage('debugging');
    } finally {
      setIsSubmittingCoding(false);
    }
  };

  // 3. Run Debugging Tests
  const handleRunDebugTests = async () => {
    setIsRunningDebugTests(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/submit-debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ javascript: debugCode })
      });
      if (res.ok) {
        const data = await res.json();
        setDebugTestResults(data.testResults);
      }
    } catch (e) {
      console.error("Debug test error:", e);
    } finally {
      setIsRunningDebugTests(false);
    }
  };

  const handleSubmitDebugFix = async () => {
    setIsSubmittingDebug(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/submit-debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ javascript: debugCode })
      });
      if (res.ok) {
        const data = await res.json();
        setDebugTestResults(data.testResults);
        setCurrentStage('evidence');
      }
    } catch (e) {
      console.error("Debug submission error:", e);
      setCurrentStage('evidence');
    } finally {
      setIsSubmittingDebug(false);
    }
  };

  // 4. Final Hybrid Submission
  const handleFinalizeSubmission = async () => {
    setIsSubmittingFinal(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const formData = new FormData();
      formData.append('explanationText', explanationText);
      if (selectedPhoto) {
        formData.append('practicalImage', selectedPhoto);
      }
      if (recordedVoiceAudio) {
        formData.append('audioViva', recordedVoiceAudio);
      }

      const res = await fetch(`/api/assessments/${assessmentId}/submit-hybrid`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (onCompleteSubmission) {
          onCompleteSubmission(data.assessment, data.rubric);
        }
      } else {
        alert("Failed to finalize assessment. Please review errors and retry.");
      }
    } catch (err) {
      console.error("Final submit error:", err);
      alert("Submission error. Please ensure network connectivity.");
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const stages = [
    { key: 'knowledge', label: '1. Knowledge Questions', icon: HelpCircle },
    { key: 'coding', label: '2. Practical Coding', icon: Code2 },
    { key: 'debugging', label: '3. Defect Debugging', icon: Bug },
    { key: 'evidence', label: '4. Explanation & Evidence', icon: MessageSquare }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Top Banner & Stepper Navigation */}
      <div className="bg-[#0a192f] text-white p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Web Developer Practical Skill Verification
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
              ID: {assessmentId || 'Active'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white">
            Hybrid Assessment Workspace
          </h1>
        </div>

        {/* Stage Pills */}
        <div className="flex flex-wrap items-center gap-2" role="tablist">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isActive = currentStage === st.key;
            return (
              <button
                key={st.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setCurrentStage(st.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive 
                    ? 'bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20' 
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Auto-Save & Cancel */}
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={saveDraftProgress}
            disabled={isAutoSaving}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white"
            title="Save draft progress to server"
          >
            <Save className={`w-3.5 h-3.5 ${isAutoSaving ? 'animate-spin text-teal-400' : ''}`} />
            <span>{lastSavedTime ? `Saved at ${lastSavedTime}` : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          >
            Exit
          </button>
        </div>
      </div>

      {/* STAGE 1: KNOWLEDGE QUESTIONS */}
      {currentStage === 'knowledge' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-500" />
                Section A: Knowledge Assessment Questions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Answer each question testing web fundamentals, responsive CSS, state immutability, and web security.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Question {currentQIndex + 1} of {knowledgeQuestions.length}
            </span>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2">
            {knowledgeQuestions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentQIndex(idx)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                  currentQIndex === idx
                    ? 'bg-teal-500 text-slate-950 border-teal-500'
                    : knowledgeAnswers[q.id]
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                Q{idx + 1} {knowledgeAnswers[q.id] ? '✓' : ''}
              </button>
            ))}
          </div>

          {/* Current Question View */}
          {knowledgeQuestions[currentQIndex] && (() => {
            const currentQ = knowledgeQuestions[currentQIndex];
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                      {currentQ.competencyId}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {currentQ.type === 'mcq' ? 'Multiple Choice' : 'Short Answer Written Response'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    {currentQ.prompt}
                  </p>
                </div>

                {/* MCQ Options */}
                {currentQ.type === 'mcq' && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oIdx) => {
                      const letter = opt.charAt(0);
                      const isSelected = knowledgeAnswers[currentQ.id] === letter;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setKnowledgeAnswers({ ...knowledgeAnswers, [currentQ.id]: letter })}
                          className={`w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold transition-all border flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20'
                              : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer Input */}
                {currentQ.type === 'short_answer' && (
                  <div className="space-y-2">
                    <label htmlFor="short-answer-input" className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Your Technical Answer:
                    </label>
                    <textarea
                      id="short-answer-input"
                      rows={4}
                      value={knowledgeAnswers[currentQ.id] || ''}
                      onChange={(e) => setKnowledgeAnswers({ ...knowledgeAnswers, [currentQ.id]: e.target.value })}
                      placeholder="Type your explanation here (e.g. explain how textContent escapes HTML and neutralizes XSS risks)..."
                      className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-[11px] text-slate-400">
                      Minimum 15 characters. Focus on domain technical concepts.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-5">
            <button
              type="button"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(i => i - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              Previous Question
            </button>

            {currentQIndex < knowledgeQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQIndex(i => i + 1)}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700"
              >
                Next Question
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitKnowledge}
                disabled={isSubmittingKnowledge}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 shadow-md shadow-teal-600/20 flex items-center gap-2"
              >
                {isSubmittingKnowledge && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Knowledge & Proceed to Practical Task</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* STAGE 2: PRACTICAL CODING TASK */}
      {currentStage === 'coding' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Instructions Card */}
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Section B: Practical Coding Workspace (Weight: 30%)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-500">
                  SSC/N0504
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Task: Build a Responsive Task-List Application
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Implement task addition with validation, completion toggle, filtering (All/Active/Completed), and task removal. Verify your code with automated test assertions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunPracticalTests}
                disabled={isRunningCodingTests}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-teal-400 hover:text-white border border-slate-700 flex items-center gap-2 shadow"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningCodingTests ? 'animate-spin' : ''}`} />
                <span>Run Automated Tests</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitPracticalCode}
                disabled={isSubmittingCoding}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 shadow-md shadow-teal-600/30 flex items-center gap-2"
              >
                {isSubmittingCoding && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Code & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Test Assertion Status Bar */}
          {codingTestResults && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Automated Test Results: {codingTestResults.passedTests} / {codingTestResults.totalTests} Passed
                </span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  Score: {codingTestResults.score} / {codingTestResults.maxScore} pts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-[11px]">
                {codingTestResults.testResults.map(tr => (
                  <div 
                    key={tr.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      tr.passed 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {tr.passed ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{tr.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two-Pane Workspace: Code Editor & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Left Pane: Code Editor */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[520px]">
              {/* Tab Bar */}
              <div className="bg-[#090d16] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCodeTab('javascript')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                      codeTab === 'javascript' 
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    app.js
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeTab('html')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                      codeTab === 'html' 
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    index.html
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeTab('css')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                      codeTab === 'css' 
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    style.css
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  Deterministic Client Sandbox
                </span>
              </div>

              {/* Textarea Code Workspace */}
              <div className="flex-1 p-3">
                {codeTab === 'javascript' && (
                  <textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="w-full h-full bg-transparent text-emerald-300 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                    spellCheck="false"
                  />
                )}

                {codeTab === 'html' && (
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="w-full h-full bg-transparent text-amber-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                    spellCheck="false"
                  />
                )}

                {codeTab === 'css' && (
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="w-full h-full bg-transparent text-sky-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
                    spellCheck="false"
                  />
                )}
              </div>
            </div>

            {/* Right Pane: Live Interactive Preview */}
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[520px]">
              <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-teal-500" />
                  Live Component Preview
                </span>
                <span className="text-[11px] text-slate-400">
                  Interactive sandbox
                </span>
              </div>

              <iframe
                ref={previewIframeRef}
                title="Task List Live Preview"
                sandbox="allow-scripts"
                className="w-full flex-1 border-none bg-slate-50"
              />
            </div>

          </div>
        </motion.div>
      )}

      {/* STAGE 3: DEFECT DEBUGGING TASK */}
      {currentStage === 'debugging' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Section C: Controlled Defect Debugging (Weight: 15%)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-500">
                  SSC/N0505
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Task: Fix State Immutability & Search Case Sensitivity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                A junior developer wrote a filtering function with 2 critical bugs: in-place array mutation using splice, and case-sensitive/untrimmed search. Identify and fix both bugs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunDebugTests}
                disabled={isRunningDebugTests}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-amber-400 hover:text-white border border-slate-700 flex items-center gap-2 shadow"
              >
                <Play className={`w-3.5 h-3.5 ${isRunningDebugTests ? 'animate-spin' : ''}`} />
                <span>Verify Debug Fix</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitDebugFix}
                disabled={isSubmittingDebug}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 shadow-md shadow-amber-600/30 flex items-center gap-2"
              >
                {isSubmittingDebug && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Fix & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Test Assertion Status Bar */}
          {debugTestResults && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Automated Regression Tests: {debugTestResults.passedTests} / {debugTestResults.totalTests} Passed
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  Score: {debugTestResults.score} / {debugTestResults.maxScore} pts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {debugTestResults.testResults.map(tr => (
                  <div 
                    key={tr.id}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                      tr.passed 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {tr.passed ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-500" />}
                    <div>
                      <span className="font-bold block">{tr.name}</span>
                      <span className="text-[11px] opacity-80">{tr.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debug Editor */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="font-mono text-slate-400 font-bold">
                filterAndSearchTasks.js
              </span>
              <button
                type="button"
                onClick={() => setDebugCode(template?.debugTask?.fixedReferenceCode || '')}
                className="text-[11px] text-teal-400 hover:text-teal-300 underline font-mono"
              >
                Load Clean Reference Solution
              </button>
            </div>
            <textarea
              rows={14}
              value={debugCode}
              onChange={(e) => setDebugCode(e.target.value)}
              className="w-full bg-transparent text-amber-200 font-mono text-xs leading-relaxed focus:outline-none"
              spellCheck="false"
            />
          </div>
        </motion.div>
      )}

      {/* STAGE 4: EXPLANATION & EVIDENCE */}
      {currentStage === 'evidence' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
              Section D: Technical Architecture & Evidence Submission (Weight: 5%)
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Document Solution Architecture & Attach Evidence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Provide a clear technical explanation of your component structure, accessibility focus handling, and defensive input validation. Attach code artifacts or record voice explanation.
            </p>
          </div>

          {/* Written Explanation Area */}
          <div className="space-y-2">
            <label htmlFor="tech-explanation" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Technical Solution Summary:</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {explanationText.length} characters (min 20)
              </span>
            </label>
            <textarea
              id="tech-explanation"
              rows={5}
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              placeholder="Explain component modularity, how immutability was preserved in state updates, how WCAG AA accessibility was satisfied, and your approach to sanitizing user inputs against XSS..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Multimodal Attachments: Screenshot / Artifact + Voice Recording */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Screenshot / File Evidence */}
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-teal-500 mx-auto" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Attach Screenshot or Code Evidence
              </div>
              <p className="text-[11px] text-slate-400">
                PNG, JPG, or PDF up to 30 MB
              </p>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedPhoto(e.target.files[0]);
                  }
                }}
                className="text-xs text-slate-500 mx-auto block"
              />
              {selectedPhoto && (
                <div className="text-[11px] text-emerald-600 font-bold">
                  ✓ Attached: {selectedPhoto.name}
                </div>
              )}
            </div>

            {/* Voice Viva Explanation Recording */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Mic className="w-4 h-4 text-teal-500" />
                  <span>Optional Audio Viva Explanation</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Explain your code verbally in English or Hindi for human assessor review.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isRecordingVoice 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-teal-600 text-white hover:bg-teal-500'
                  }`}
                >
                  {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecordingVoice ? `Recording... (${voiceSeconds}s)` : 'Record Voice Viva'}</span>
                </button>

                {voiceSeconds > 0 && !isRecordingVoice && (
                  <span className="text-xs text-emerald-500 font-bold">
                    ✓ Recorded ({voiceSeconds}s)
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Submission Pre-Flight Checklist */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 text-xs space-y-2">
            <span className="font-bold text-teal-800 dark:text-teal-300 block">
              Pre-Submission Verification Summary:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Knowledge Questions</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Practical Code Tested</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Debugging Unit Tests</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Explanation Ready</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStage('debugging')}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800"
            >
              Back to Debugging
            </button>

            <button
              type="button"
              onClick={handleFinalizeSubmission}
              disabled={isSubmittingFinal}
              className="px-8 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 shadow-xl shadow-teal-600/30 flex items-center gap-2 transform active:scale-95 transition-all"
            >
              {isSubmittingFinal && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Finalize & Submit for Assessor Review</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      )}

    </div>
  );
}
