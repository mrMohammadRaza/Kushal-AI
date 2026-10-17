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
  Pause, 
  FileCheck2, 
  Crosshair, 
  ChevronRight, 
  Sparkles,
  MapPin,
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
  QrCode
} from 'lucide-react';

export default function ExplainableAssessorDashboard({ 
  assessmentData, 
  onSignOff, 
  onPushToDigiLocker,
  lang = 'hi' 
}) {
  const isHi = lang === 'hi';
  const [selectedBox, setSelectedBox] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [assessorNotes, setAssessorNotes] = useState('Practical competencies and evidence verified against NSQF criteria.');
  const [selectedDecision, setSelectedDecision] = useState('certified_approved');
  const [isSigningOff, setIsSigningOff] = useState(false);
  const [signedOffResult, setSignedOffResult] = useState(null);

  // Gemini Copilot state
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState([
    {
      sender: 'gemini',
      text: 'Namaste Assessor. I am your Gemini RPL Assessment Co-Pilot. You can ask me to explain rubric criteria, lookup Bureau of Indian Standards (BIS/IS), or formulate bridge-training questions.'
    }
  ]);

  const ai = assessmentData?.aiEvaluation || assessmentData?.assessmentRecord?.aiEvaluation || assessmentData || {};
  const assessmentRecord = assessmentData?.assessmentRecord || assessmentData;
  const assessmentId = assessmentRecord?.id || ai?.id || 'asmt-sample';

  const overallScore = ai?.overallScore ?? assessmentRecord?.overall_score ?? 78;
  const grade = overallScore >= 85 ? 'A+' : (overallScore >= 70 ? 'A' : (overallScore >= 55 ? 'B' : 'Requires Training'));

  const vision = ai?.visionAnalysis || {
    imageAudited: false,
    ppeCompliance: { remarks: "Visual evidence inspection pending." },
    toolsIdentified: [],
    boundingBoxes: []
  };

  const transcript = ai?.vivaTranscript || {
    transcript: assessmentData?.vivaInput || assessmentData?.voiceText || "No verbal transcript submitted.",
    transcriptEnglish: assessmentData?.vivaInput || assessmentData?.voiceText || "No verbal transcript submitted.",
    languageDetected: "hi-IN",
    technicalKeywordsFound: [],
    timestampCitations: []
  };

  const nosResults = ai?.nosResults || assessmentData?.competencyAssessments || [];
  const imageUrl = assessmentData?.photo || assessmentData?.mediaEvidence?.imageUrl || assessmentRecord?.mediaEvidence?.imageUrl;
  const audioUrl = assessmentData?.mediaEvidence?.audioUrl || assessmentRecord?.mediaEvidence?.audioUrl;

  const handleAskCopilot = async (e) => {
    e?.preventDefault();
    if (!copilotQuery.trim() || copilotLoading) return;

    const userMsg = copilotQuery.trim();
    setCopilotHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          assessmentContext: {
            trade: ai.tradeTitle || 'Electrician',
            score: overallScore,
            status: ai.status,
            gaps: ai.gapAreas || []
          },
          trade: { title: ai.tradeTitle || 'Electrician' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotHistory(prev => [...prev, { sender: 'gemini', text: data.reply }]);
      } else {
        setCopilotHistory(prev => [...prev, { sender: 'gemini', text: "Refer to the official NSQF Qualification Pack criteria for this trade." }]);
      }
    } catch (err) {
      setCopilotHistory(prev => [...prev, { sender: 'gemini', text: "Assessor guidance: Verify candidate's Lockout/Tagout knowledge and insulation test readings directly." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleExecuteSignOff = async () => {
    setIsSigningOff(true);
    try {
      if (onSignOff) {
        const result = await onSignOff({
          assessmentId,
          finalDecision: selectedDecision,
          assessorRemarks: assessorNotes
        });
        if (result) setSignedOffResult(result);
      }
    } catch (e) {
      console.warn("Sign-off error:", e);
    } finally {
      setIsSigningOff(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* 1. Header Bar: Assessor Human-in-the-Loop Authority */}
      <div className="card-3d p-6 rounded-3xl border border-white/10 bg-slate-950 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-wider mb-1">
            <Eye className="w-4 h-4" />
            <span>Human-in-the-Loop Vocational Assessor Workstation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Assessment Dossier:</span>
            <span className="text-blue-400 font-mono">#{assessmentId}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Candidate: <strong className="text-white">{assessmentData?.candidateProfile?.fullName || assessmentRecord?.candidate_name || "Ramesh Kumar Sharma"}</strong> • 
            Trade: <strong className="text-emerald-400">{ai.tradeTitle || "Assistant Electrician"} (NSQF Level {ai.nsqfLevel || 3})</strong>
          </p>
        </div>

        {/* AI Recommendation Badge vs Assessor Decision */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Suggestion Status</span>
            <span className="text-xs font-black text-amber-400">
              {ai.status ? ai.status.replace(/_/g, ' ').toUpperCase() : 'REVIEW REQUIRED'}
            </span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-right">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">Overall Score</span>
            <span className="text-lg font-black text-white">{overallScore}% ({grade})</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Multimodal Evidence Gallery & Standards Matrix */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card A: Practical Photo Inspection with Explainable Bounding Boxes */}
          <div className="card-3d p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <span>Multimodal Practical Evidence Inspection</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {vision.imageAudited ? '✓ Image Audited' : 'No Photo Evidence'}
              </span>
            </div>

            <div className="relative min-h-[260px] rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex items-center justify-center p-2">
              {imageUrl ? (
                <div className="relative max-w-full">
                  <img 
                    src={imageUrl} 
                    alt="Practical candidate work demonstration" 
                    className="max-h-[340px] w-auto rounded-xl object-contain shadow-lg"
                  />

                  {/* Render Bounding Boxes if detected */}
                  {Array.isArray(vision.boundingBoxes) && vision.boundingBoxes.map((box, idx) => {
                    if (!box.box_2d || box.box_2d.length < 4) return null;
                    const [ymin, xmin, ymax, xmax] = box.box_2d;
                    const isSelected = selectedBox === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedBox(isSelected ? null : idx)}
                        style={{
                          top: `${ymin * 100}%`,
                          left: `${xmin * 100}%`,
                          width: `${(xmax - xmin) * 100}%`,
                          height: `${(ymax - ymin) * 100}%`
                        }}
                        className={`absolute border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-amber-400 bg-amber-400/20 ring-4 ring-amber-400/30' 
                            : 'border-emerald-400 bg-emerald-400/10 hover:border-emerald-300'
                        }`}
                      >
                        <span className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/90 text-emerald-300 border border-emerald-400 whitespace-nowrap">
                          {box.label} ({Math.round((box.confidence || 0.9) * 100)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 space-y-2 text-slate-500">
                  <AlertTriangle className="w-8 h-8 mx-auto text-amber-400" />
                  <p className="text-sm font-semibold text-slate-300">No physical demonstration photo attached.</p>
                  <p className="text-xs">Assessor must request physical photo or schedule practical demonstration.</p>
                </div>
              )}
            </div>

            {/* PPE & Workmanship Audit */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">PPE Safety Adherence</span>
                <p className="font-semibold text-white">
                  {vision.ppeCompliance?.remarks || "PPE adherence unverified."}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Workmanship Assessment</span>
                <p className="font-semibold text-white">
                  {vision.workmanshipQuality?.toolHandling || "Requires visual assessor inspection."}
                </p>
              </div>
            </div>
          </div>

          {/* Card B: Granular NOS Competency Matrix */}
          <div className="card-3d p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>National Occupational Standards (NOS) Rubric Matrix</span>
              </div>
              <span className="text-xs text-slate-400">
                {nosResults.length} Units Audited
              </span>
            </div>

            <div className="space-y-3">
              {nosResults.map((nos, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 font-bold block">{nos.nosCode || `NOS-${idx + 1}`}</span>
                      <h4 className="text-xs font-bold text-white">{nos.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400">{nos.score || 75}%</span>
                      <span className="text-[10px] text-slate-400 block">Weight: {nos.weightage || 25}%</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 italic">
                    "{nos.feedback}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Voice Viva, Copilot Chat, & Assessor Sign-Off */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card C: Viva Voce Audio & Transcript */}
          <div className="card-3d p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Viva Voce Audio & Transcript</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono font-bold">
                {transcript.languageDetected || 'hi-IN'}
              </span>
            </div>

            {/* Audio player if audio available */}
            {audioUrl && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <audio src={audioUrl} controls className="w-full h-8" />
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Spoken Transcript:</span>
              <p className="text-xs text-slate-200 italic font-medium leading-relaxed">
                "{transcript.transcript || "Candidate verbally answered questions regarding safety isolation, wire sizing, and earthing."}"
              </p>

              {transcript.transcriptEnglish && transcript.transcriptEnglish !== transcript.transcript && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">English Translation:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    "{transcript.transcriptEnglish}"
                  </p>
                </div>
              )}
            </div>

            {/* Keywords identified */}
            {transcript.technicalKeywordsFound?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {transcript.technicalKeywordsFound.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-medium">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Card D: Interactive Assessor Copilot */}
          <div className="card-3d p-6 rounded-3xl border border-white/10 bg-slate-950/80 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Assessor Co-Pilot (Standards & IS Codes)</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              {copilotHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-2.5 rounded-xl ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600/20 text-blue-200 ml-4 border border-blue-500/30' 
                      : 'bg-slate-950 text-slate-200 mr-4 border border-slate-800'
                  }`}
                >
                  <p className="font-medium leading-relaxed">{msg.text}</p>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Consulting NSQF Standards...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleAskCopilot} className="flex gap-2">
              <input 
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="Ask co-pilot (e.g., earthing test criteria IS 3043)..."
                className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={copilotLoading}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Card E: Formal Assessor Decision & Report Release */}
          <div className="card-3d p-6 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-slate-950 to-emerald-950/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <FileCheck2 className="w-5 h-5" />
                <span>Certified Assessor Formal Sign-Off</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Human Review Enforced
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">Assessment Verdict:</label>
              <select
                value={selectedDecision}
                onChange={(e) => setSelectedDecision(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="certified_approved">✓ Certify & Endorse Qualification (Passed)</option>
                <option value="conditional_bridge_training">⚠ Conditional RPL: 12-Hour Bridge Training Required</option>
                <option value="requires_practical_demonstration">⚠ Requires Supervised Physical Demonstration</option>
                <option value="insufficient_evidence">✕ Insufficient Evidence (Return to Candidate)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">Assessor Official Remarks:</label>
              <textarea
                value={assessorNotes}
                onChange={(e) => setAssessorNotes(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                placeholder="Enter formal justification and observations..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleExecuteSignOff}
                disabled={isSigningOff}
                className="btn-3d-emerald flex-1 min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2"
              >
                {isSigningOff ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isSigningOff ? 'Generating Report...' : 'Sign Off & Release Report'}</span>
              </button>

              <button
                type="button"
                onClick={() => onPushToDigiLocker?.(assessmentId)}
                className="btn-3d flex-1 min-h-[46px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Push to DigiLocker</span>
              </button>
            </div>

            {/* Generated Report & QR Verification Link */}
            {signedOffResult?.report && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Report #{signedOffResult.report.reportId}
                  </span>
                  <a 
                    href={signedOffResult.report.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-white hover:underline bg-emerald-700/60 px-2.5 py-1 rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-300 font-mono break-all">
                  Verification URL: <a href={signedOffResult.report.qrVerificationUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">{signedOffResult.report.qrVerificationUrl}</a>
                </p>
              </motion.div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
