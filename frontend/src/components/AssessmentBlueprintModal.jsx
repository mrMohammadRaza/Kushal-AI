import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCode2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  HelpCircle, 
  Sliders, 
  X, 
  ArrowRight,
  Code2,
  Bug,
  BookOpen,
  MessageSquare,
  Award,
  Layers,
  Scale
} from 'lucide-react';

export default function AssessmentBlueprintModal({
  isOpen,
  onClose,
  onStartAssessment,
  template,
  candidateProfile,
  lang = 'en'
}) {
  const [accessibilityOptions, setAccessibilityOptions] = useState({
    voiceGuidance: true,
    highContrast: false,
    fontSize: 'normal',
    extendedTime: false
  });

  if (!isOpen) return null;

  const isHi = lang === 'hi';

  const competencies = template?.competencies || [
    { id: 'c1', title: 'HTML and accessibility', weight: 15, nosCode: 'SSC/N0501' },
    { id: 'c2', title: 'CSS and responsive design', weight: 15, nosCode: 'SSC/N0502' },
    { id: 'c3', title: 'JavaScript fundamentals', weight: 20, nosCode: 'SSC/N0503' },
    { id: 'c4', title: 'Practical development', weight: 30, nosCode: 'SSC/N0504' },
    { id: 'c5', title: 'Debugging and problem-solving', weight: 15, nosCode: 'SSC/N0505' },
    { id: 'c6', title: 'Technical explanation', weight: 5, nosCode: 'SSC/N0506' }
  ];

  const totalWeight = competencies.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blueprint-title"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-900 dark:text-slate-100"
      >
        {/* Header Bar */}
        <div className="bg-[#0a192f] text-white px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Versioned Assessment Blueprint
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                  v{template?.version || '1.0.0'}
                </span>
              </div>
              <h2 id="blueprint-title" className="text-lg sm:text-xl font-black text-white">
                Web Developer Practical Skill Verification
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Close blueprint modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blueprint Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Target Qualification Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Standard Code</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">SSC/Q0501</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Level</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">NSQF Level 5</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Expected Duration</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                45 - 60 Minutes
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Assessment Mode</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">Hybrid (Auto + Assessor)</span>
            </div>
          </div>

          {/* Competency Template & Weights Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-500" />
                Competency Blueprint & Rubric Weights
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                totalWeight === 100 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}>
                {totalWeight === 100 ? 'Weights Validated: 100%' : `Weights Invalid: ${totalWeight}%`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {competencies.map((comp) => (
                <div 
                  key={comp.id || comp.nosCode}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">{comp.nosCode}</span>
                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-500/20">
                      {comp.weight}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {comp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {comp.description || 'Verified practical competency standard.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Four Assessment Stages */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-500" />
              Hybrid Assessment Workflow
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">A. Knowledge Questions (4 Tasks)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Multiple-choice and short-answer questions testing semantic HTML, CSS flexbox, state immutability, and XSS prevention.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">B. Practical Task-List App (30%)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Build a responsive task-list application in interactive workspace with live DOM preview and 5 automated unit test assertions.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">C. Defect Debugging Task (15%)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Inspect code with controlled state mutation and search defects. Fix flaws and verify with automated regression tests.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">D. Technical Explanation & Assessor Review</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    Submit architectural summary and optional evidence. Reviewed and signed off by a certified human assessor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Rules & Safe Sandbox Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Assessment Rules & Safe Deterministic Execution Policy</span>
            </div>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
              <li>Candidate answers and practical coding files are saved automatically, allowing progress resume.</li>
              <li>Practical code is executed safely in an isolated client sandbox and server-side deterministic unit test harness.</li>
              <li>No arbitrary host shell commands are executed on the application server.</li>
              <li>A certified assessor performs human sign-off with cryptographic integrity verification before report release.</li>
              <li className="font-semibold text-slate-700 dark:text-slate-200">
                Notice: Assessment weights and rubrics reflect the proposed versioned practical framework and do not represent statutory qualification conferral without accredited awarding body issuance.
              </li>
            </ul>
          </div>

          {/* Accessibility Preferences */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Accessibility Diagnostics & Accommodations:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={accessibilityOptions.voiceGuidance}
                  onChange={(e) => setAccessibilityOptions({ ...accessibilityOptions, voiceGuidance: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Voice Guidance / Screen Reader Audio</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={accessibilityOptions.extendedTime}
                  onChange={(e) => setAccessibilityOptions({ ...accessibilityOptions, extendedTime: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Extended Duration Accommodations</span>
              </label>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 dark:bg-slate-900/80 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onStartAssessment}
            className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 shadow-lg shadow-teal-600/30 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Begin Web Developer Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
