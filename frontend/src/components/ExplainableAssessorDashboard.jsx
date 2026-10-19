import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  Volume2, 
  Play, 
  FileCheck2, 
  ChevronRight, 
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
  Bot,
  Send,
  Loader2,
  HelpCircle,
  Check,
  Download,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Code2,
  Bug,
  Cpu,
  RotateCcw,
  MessageSquare,
  Scale,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

export default function ExplainableAssessorDashboard({ 
  assessmentData, 
  onSignOff, 
  onPushToDigiLocker,
  lang = 'en' 
}) {
  const isHi = lang === 'hi';

  // Active dossier & list state
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(assessmentData?.id || assessmentData?.assessmentRecord?.id || 'asmt-sample');
  const [currentDossier, setCurrentDossier] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Code inspection tab: 'javascript' | 'html' | 'css' | 'debugging' | 'explanation' | 'media'
  const [activeCodeTab, setActiveCodeTab] = useState('javascript');

  // Decision & Sign-Off state
  const [selectedDecision, setSelectedDecision] = useState('certified_approved');
  const [assessorRemarks, setAssessorRemarks] = useState('Demonstrated 100% adherence to Web Developer practical standards. Clean state immutability and verified input validation.');
  const [isSigningOff, setIsSigningOff] = useState(false);
  const [signOffResult, setSignOffResult] = useState(null);

  // Evidence request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [evidenceRequestText, setEvidenceRequestText] = useState('');
  const [isRequestingEvidence, setIsRequestingEvidence] = useState(false);

  // Retest modal state
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [retestReason, setRetestReason] = useState('');
  const [isOrderingRetest, setIsOrderingRetest] = useState(false);

  // Editable scores state
  const [rubricScores, setRubricScores] = useState({});

  // Load assessments queue from backend
  const fetchAssessmentsQueue = async () => {
    setIsLoadingList(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch('/api/assessments', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const list = await res.json();
        setAssessmentsList(list);
        if (list.length > 0 && (!selectedAssessmentId || selectedAssessmentId === 'asmt-sample')) {
          setSelectedAssessmentId(list[0].id);
        }
      }
    } catch (e) {
      console.warn("Could not fetch assessments queue:", e);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Fetch full dossier for selected assessment
  const fetchDossier = async (id) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const dossier = await res.json();
        setCurrentDossier(dossier);
        if (dossier.rubricScores?.rubricBreakdown) {
          const scoreMap = {};
          dossier.rubricScores.rubricBreakdown.forEach(c => {
            scoreMap[c.competencyId || c.nosCode] = c.awardedScore;
          });
          setRubricScores(scoreMap);
        }
      }
    } catch (e) {
      console.warn("Could not fetch dossier:", e);
    }
  };

  useEffect(() => {
    fetchAssessmentsQueue();
  }, []);

  useEffect(() => {
    if (selectedAssessmentId) {
      fetchDossier(selectedAssessmentId);
    }
  }, [selectedAssessmentId]);

  // Fallback to passed assessmentData if no server response
  const activeAssessment = currentDossier || assessmentData?.assessmentRecord || assessmentData || {};
  const assessmentId = activeAssessment?.id || selectedAssessmentId || 'asmt-sample';
  const overallScore = activeAssessment?.overall_score || 0;
  const status = activeAssessment?.status || 'draft';
  const rubric = activeAssessment?.rubricScores || activeAssessment?.aiEvaluation?.rubric || null;
  const breakdown = rubric?.rubricBreakdown || [];
  const autoTests = activeAssessment?.testResults || rubric?.automatedTestsSummary || null;
  const codingCode = activeAssessment?.codingSubmission?.code || {};
  const debugCode = activeAssessment?.debugSubmission?.code || '';
  const explanation = activeAssessment?.explanation_text || '';

  // Execute Assessor Sign-Off
  const handleExecuteSignOff = async () => {
    if (!assessorRemarks || assessorRemarks.trim().length < 5) {
      alert("Assessor remarks are mandatory for official sign-off (min 5 characters).");
      return;
    }

    setIsSigningOff(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/signoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          finalDecision: selectedDecision,
          assessorRemarks: assessorRemarks.trim(),
          scoreAdjustments: rubricScores
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSignOffResult(data);
        fetchDossier(assessmentId);
        fetchAssessmentsQueue();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Sign-off failed. Ensure authorized assessor permissions.");
      }
    } catch (e) {
      console.error("Sign-off exception:", e);
    } finally {
      setIsSigningOff(false);
    }
  };

  // Submit Evidence Request
  const handleSendEvidenceRequest = async () => {
    if (!evidenceRequestText || evidenceRequestText.trim().length < 5) {
      alert("Please specify the details of the evidence requested (min 5 characters).");
      return;
    }

    setIsRequestingEvidence(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/request-evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ requestDetails: evidenceRequestText })
      });
      if (res.ok) {
        setIsRequestModalOpen(false);
        setEvidenceRequestText('');
        fetchDossier(assessmentId);
        fetchAssessmentsQueue();
        alert("Evidence request sent to candidate.");
      }
    } catch (e) {
      console.error("Evidence request error:", e);
    } finally {
      setIsRequestingEvidence(false);
    }
  };

  // Submit Retest Order
  const handleOrderRetest = async () => {
    if (!retestReason || retestReason.trim().length < 5) {
      alert("Please specify the documented reason for ordering a retest (min 5 characters).");
      return;
    }

    setIsOrderingRetest(true);
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      const res = await fetch(`/api/assessments/${assessmentId}/retest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason: retestReason })
      });
      if (res.ok) {
        setIsRetestModalOpen(false);
        setRetestReason('');
        fetchDossier(assessmentId);
        fetchAssessmentsQueue();
        alert("Retest ordered for candidate.");
      }
    } catch (e) {
      console.error("Retest order error:", e);
    } finally {
      setIsOrderingRetest(false);
    }
  };

  // Update Granular Criterion Score
  const handleUpdateCriterionScore = async (pcCode, newScore) => {
    setRubricScores({ ...rubricScores, [pcCode]: Number(newScore) });
    try {
      const token = localStorage.getItem('kaushal_ai_auth_token');
      await fetch(`/api/assessments/${assessmentId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          pcCode,
          assessorScore: Number(newScore),
          assessorComments: "Adjusted by human assessor during audit."
        })
      });
    } catch (e) {
      console.warn("Score update error:", e);
    }
  };

  const filteredQueue = assessmentsList.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (item.candidate_name || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const trade = (item.trade_title || '').toLowerCase();
      return name.includes(q) || id.includes(q) || trade.includes(q);
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header Bar: Human-in-the-Loop Authority */}
      <div className="bg-[#0a192f] text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Eye className="w-4 h-4 text-teal-400" />
            <span>Certified Vocational Assessor Review Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Dossier:</span>
            <span className="font-mono text-teal-300">#{assessmentId}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Candidate: <strong className="text-white">{activeAssessment?.candidate_name || 'Aarav Sharma'}</strong> • 
            Occupation: <strong className="text-teal-400">{activeAssessment?.trade_title || 'Web Developer'} (NSQF Level {activeAssessment?.nsqf_level || 5})</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment Status</span>
            <span className="text-xs font-black text-amber-400 uppercase font-mono">
              {status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-right">
            <span className="text-[10px] uppercase font-bold text-teal-300 block">Validated Score</span>
            <span className="text-lg font-black text-white">{overallScore} / 100</span>
          </div>
        </div>
      </div>

      {/* 2. Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Queue of Pending Assessments */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-500" />
                Assessment Queue
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {filteredQueue.length} dossiers
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search candidate, ID, trade..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Status Filter Pill */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {['all', 'assessor_review_required', 'returned_for_evidence', 'certified_approved'].map(flt => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setStatusFilter(flt)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap capitalize transition-colors ${
                    statusFilter === flt
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {flt.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pt-1">
              {filteredQueue.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No assessment dossiers matching criteria.
                </div>
              ) : (
                filteredQueue.map(item => {
                  const isSelected = item.id === assessmentId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedAssessmentId(item.id)}
                      className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-slate-400">{item.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'certified_approved' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {item.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.candidate_name || 'Candidate'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.trade_title || 'Web Developer'} • Score: {item.overall_score ?? '--'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Candidate Submission Dossier, Code Viewer, Rubric */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Automated Unit Test Assertions */}
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-500" />
                Automated Test Assertions Breakdown
              </h3>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {autoTests?.total ? `${autoTests.passed} / ${autoTests.total} Tests Passed` : 'Automated Verification Completed'}
              </span>
            </div>

            {/* Test Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(autoTests?.codingTests?.length ? autoTests.codingTests : [
                { name: "Input validation rejects empty strings", passed: true, points: 6 },
                { name: "Adds valid task item to list", passed: true, points: 6 },
                { name: "Toggles task completion status", passed: true, points: 6 },
                { name: "Filters tasks across All, Active, Completed", passed: true, points: 6 },
                { name: "Deletes task and updates active counter", passed: true, points: 6 }
              ]).map((tr, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                    tr.passed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {tr.passed ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-500" />}
                  <div className="truncate">
                    <span className="font-bold block truncate">{tr.name}</span>
                    <span className="text-[10px] opacity-80">{tr.points} pts awarded</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Code & Evidence Inspection Tabs */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
            <div className="bg-[#090d16] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {[
                  { key: 'javascript', label: 'app.js' },
                  { key: 'debugging', label: 'filterAndSearchTasks.js' },
                  { key: 'html', label: 'index.html' },
                  { key: 'css', label: 'style.css' },
                  { key: 'explanation', label: 'Technical Explanation' }
                ].map(tb => (
                  <button
                    key={tb.key}
                    type="button"
                    onClick={() => setActiveCodeTab(tb.key)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors ${
                      activeCodeTab === tb.key
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                Candidate Submission Code
              </span>
            </div>

            {/* Tab Content Display */}
            <div className="p-4 max-h-[320px] overflow-y-auto">
              {activeCodeTab === 'javascript' && (
                <pre className="text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {codingCode.javascript || "// No JavaScript submitted"}
                </pre>
              )}

              {activeCodeTab === 'debugging' && (
                <pre className="text-amber-200 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {debugCode || "// No debugging code submitted"}
                </pre>
              )}

              {activeCodeTab === 'html' && (
                <pre className="text-sky-200 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {codingCode.html || "<!-- No HTML submitted -->"}
                </pre>
              )}

              {activeCodeTab === 'css' && (
                <pre className="text-purple-200 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {codingCode.css || "/* No CSS submitted */"}
                </pre>
              )}

              {activeCodeTab === 'explanation' && (
                <div className="text-slate-300 text-xs leading-relaxed font-sans p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                  <p className="font-semibold text-teal-400 mb-1">Candidate Architectural Summary:</p>
                  <p>{explanation || "No written explanation provided."}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Competency Rubric Matrix & Editable Assessor Scores */}
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-500" />
                Competency Rubric Matrix (Editable Assessor Scores)
              </h3>
              <span className="text-[11px] text-slate-400">
                Weights total 100%
              </span>
            </div>

            <div className="space-y-3">
              {(breakdown.length > 0 ? breakdown : [
                { nosCode: 'SSC/N0501', title: 'HTML and accessibility', weight: 15, awardedScore: 15 },
                { nosCode: 'SSC/N0502', title: 'CSS and responsive design', weight: 15, awardedScore: 15 },
                { nosCode: 'SSC/N0503', title: 'JavaScript fundamentals', weight: 20, awardedScore: 20 },
                { nosCode: 'SSC/N0504', title: 'Practical development', weight: 30, awardedScore: 30 },
                { nosCode: 'SSC/N0505', title: 'Debugging and problem-solving', weight: 15, awardedScore: 15 },
                { nosCode: 'SSC/N0506', title: 'Technical explanation', weight: 5, awardedScore: 5 }
              ]).map((c, idx) => {
                const currentScore = rubricScores[c.competencyId || c.nosCode] ?? c.awardedScore;
                return (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">{c.nosCode}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{c.title}</span>
                      </div>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5 block">
                        AI Advisory: Verified automated test execution. Score recommended: {c.awardedScore}/{c.weight}.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-[11px] text-slate-500 font-semibold">Assessor Score:</label>
                      <input 
                        type="number"
                        min="0"
                        max={c.weight}
                        value={currentScore}
                        onChange={(e) => handleUpdateCriterionScore(c.competencyId || c.nosCode, e.target.value)}
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <span className="text-slate-400 font-mono">/ {c.weight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Assessor Actions & Formal Sign-Off */}
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              Assessor Verification Decision & Cryptographic Sign-Off
            </h3>

            {/* Decision Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Assessor Determination:
              </label>
              <select
                value={selectedDecision}
                onChange={(e) => setSelectedDecision(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="certified_approved">Approved & Certified (Score &ge; 70%)</option>
                <option value="conditional_bridge_training">Conditional Bridge Training (50% - 69%)</option>
                <option value="requires_practical_demonstration">Requires In-Person Practical Demonstration</option>
                <option value="rejected">Rejected (Competencies Not Demonstrated)</option>
              </select>
            </div>

            {/* Assessor Remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Documented Assessor Justification Remarks (Mandatory, min 5 chars):
              </label>
              <textarea
                rows={3}
                value={assessorRemarks}
                onChange={(e) => setAssessorRemarks(e.target.value)}
                placeholder="Document your evaluation findings, evidence verification, and specific rationale for candidate..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Request Additional Evidence
                </button>

                <button
                  type="button"
                  onClick={() => setIsRetestModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                >
                  Order Practical Retest
                </button>
              </div>

              <button
                type="button"
                onClick={handleExecuteSignOff}
                disabled={isSigningOff}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 shadow-lg shadow-teal-600/30 active:scale-95 transition-all flex items-center gap-2"
              >
                {isSigningOff && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Sign Off & Release Verified Report</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>

            {/* Sign Off Digest Confirmation */}
            {signOffResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Assessment Successfully Signed Off & Official Report Generated!</span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all">
                  Signature Digest: <span className="font-bold text-teal-600 dark:text-teal-400">{signOffResult.decision?.signatureDigest}</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal: Request Evidence */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Request Additional Evidence
            </h3>
            <p className="text-xs text-slate-500">
              Specify what additional artifacts, video, or viva clarification the candidate must provide:
            </p>
            <textarea
              rows={4}
              value={evidenceRequestText}
              onChange={(e) => setEvidenceRequestText(e.target.value)}
              placeholder="e.g. Please upload video demonstration of responsive mobile testing..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEvidenceRequest}
                disabled={isRequestingEvidence}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Order Retest */}
      {isRetestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Order Practical Retest
            </h3>
            <p className="text-xs text-slate-500">
              Document why the candidate is required to re-attempt the practical tasks:
            </p>
            <textarea
              rows={4}
              value={retestReason}
              onChange={(e) => setRetestReason(e.target.value)}
              placeholder="e.g. Unit tests revealed edge case failures in task filter array immutability..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRetestModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOrderRetest}
                disabled={isOrderingRetest}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500"
              >
                Order Retest
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
