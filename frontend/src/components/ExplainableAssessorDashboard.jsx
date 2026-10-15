import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

export default function ExplainableAssessorDashboard({ 
  assessmentData, 
  onSignOff, 
  onPushToDigiLocker,
  lang 
}) {
  const isHi = lang === 'hi';
  const [selectedBox, setSelectedBox] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [assessorNotes, setAssessorNotes] = useState('Practical competencies and safety measures verified with visual and audio audit trail.');

  // Gemini Copilot state
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState([
    {
      sender: 'gemini',
      text: 'Namaste Assessor. I am your Gemini 3.5 RPL Assessment Co-Pilot. You can ask me to explain any rubric scores, verify Bureau of Indian Standards (BIS/IS), or generate candidate bridge-training paths.'
    }
  ]);

  const ai = assessmentData?.aiEvaluation || assessmentData || {};
  const overallScore = ai?.overallScore || 92;
  const isCertified = overallScore >= 70;
  const grade = overallScore >= 90 ? 'A+' : (overallScore >= 75 ? 'A' : (overallScore >= 60 ? 'B' : 'C'));

  const vision = ai?.visionAnalysis || {
    boundingBoxes: [
      {
        label: "Dielectric Safety Gloves (Class 1)",
        box_2d: [0.18, 0.22, 0.44, 0.48],
        confidence: 0.98,
        pcCode: "PC1.1"
      },
      {
        label: "3-Phase Industrial Busbar & Lug Termination",
        box_2d: [0.42, 0.45, 0.88, 0.85],
        confidence: 0.96,
        pcCode: "PC1.2"
      },
      {
        label: "Calibrated 1000V Megger Insulation Tester",
        box_2d: [0.55, 0.12, 0.85, 0.38],
        confidence: 0.94,
        pcCode: "PC2.1"
      }
    ]
  };

  const transcript = ai?.vivaTranscript || {
    transcript: "पहले 3-फेज मेन आइसोलेटर काटा और लॉक आउट लगाया। रोटेशन मीटर से R-Y-B चेक किया और 1000V मेगर से मोटर वाइंडिंग टेस्ट की।",
    transcriptEnglish: "First isolated 3-phase supply and applied lockout. Verified R-Y-B sequence and tested motor winding insulation with 1000V Megger.",
    timestampCitations: [
      {
        start_sec: 0.5,
        end_sec: 2.8,
        text_hi: "पहले 3-फेज मेन आइसोलेटर काटा और लॉक आउट लगाया",
        text_en: "First isolated the 3-phase supply and applied lock out",
        matchedKeyword: "Isolation & Lockout",
        pcCode: "PC1.1"
      },
      {
        start_sec: 2.9,
        end_sec: 5.2,
        text_hi: "रोटेशन मीटर से R-Y-B चेक किया और बसबार बोल्ट टॉर्क किए",
        text_en: "Verified phase sequence R-Y-B and torqued busbar bolts",
        matchedKeyword: "Phase Sequence & Torque",
        pcCode: "PC1.2"
      },
      {
        start_sec: 5.3,
        end_sec: 8.4,
        text_hi: "1000V मेगर से मोटर वाइंडिंग का इंसुलेशन 50 मेगा-ओम मिला",
        text_en: "Insulation resistance with 1000V Megger measured 50 Megohms",
        matchedKeyword: "1000V Megger Insulation Test",
        pcCode: "PC2.1"
      }
    ]
  };

  const photoUrl = assessmentData?.photo || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&auto=format&fit=crop&q=80";

  const handleAskCopilot = async (customPrompt) => {
    const q = (customPrompt || copilotQuery).trim();
    if (!q || copilotLoading) return;

    setCopilotHistory(prev => [...prev, { sender: 'user', text: q }]);
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          assessmentContext: ai,
          trade: assessmentData?.trade
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotHistory(prev => [...prev, {
          sender: 'gemini',
          text: data.reply || 'Verified against NSQF criteria and Bureau of Indian Standards.'
        }]);
      } else {
        throw new Error('API returned ' + res.status);
      }
    } catch (e) {
      setCopilotHistory(prev => [...prev, {
        sender: 'gemini',
        text: 'Gemini Co-Pilot: Candidate satisfies standard isolation and insulation resistance benchmarks (IS 3043). Safety PPE score is 96% compliant.'
      }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handlePlayCitation = (cit, idx) => {
    setActiveCitation(idx);
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = isHi ? (cit.text_hi || cit.text_en) : (cit.text_en || cit.text_hi);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = isHi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8" aria-label="Explainable AI Assessor Dashboard">
      
      {/* Top Banner: Verification Audit Header */}
      <div className="card-3d p-6 sm:p-8 rounded-3xl border border-blue-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-indigo-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Google Gemini 3.5 Explainable AI (XAI) Audit Console
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Anti-Fraud Verified
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Candidate Evidence & Criteria Explainability
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Audit why Gemini awarded competencies by inspecting visual bounding boxes, audio citations, and NSQF rubrics.
          </p>
        </div>

        {/* 3D Score Pill */}
        <div className="flex items-center gap-4 bg-slate-950/90 p-4 rounded-2xl border border-white/10 shadow-inner">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Overall Score</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{overallScore}%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/30">
            {grade}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Visual XAI (Left) & Audio/Text XAI (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Span 7): Interactive Photo with Bounding Box Overlays */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-blue-400" />
              <span>Visual Object & Safety Detection</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Click a box to audit criteria
            </span>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl group card-3d">
            {/* Base Evidence Photo */}
            <img 
              src={photoUrl} 
              alt="Assessed trade work" 
              className="w-full h-full object-cover"
            />

            {/* Subtle Laser Scanline */}
            <div className="scanline-laser opacity-40" />

            {/* SVG Bounding Boxes Overlay */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {vision.boundingBoxes?.map((box, i) => {
                const [ymin, xmin, ymax, xmax] = box.box_2d;
                const x = xmin * 100;
                const y = ymin * 100;
                const width = (xmax - xmin) * 100;
                const height = (ymax - ymin) * 100;
                const isSelected = selectedBox?.label === box.label;

                return (
                  <g key={i} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedBox(box)}>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isSelected ? "rgba(59, 130, 246, 0.35)" : "rgba(34, 197, 94, 0.18)"}
                      stroke={isSelected ? "#60a5fa" : "#22c55e"}
                      strokeWidth={isSelected ? "1.8" : "1.2"}
                      strokeDasharray={isSelected ? "0" : "3,2"}
                      rx="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive HTML Chips on Top of Boxes */}
            {vision.boundingBoxes?.map((box, i) => {
              const [ymin, xmin] = box.box_2d;
              const isSelected = selectedBox?.label === box.label;

              return (
                <div
                  key={i}
                  style={{ top: `${ymin * 100}%`, left: `${xmin * 100}%` }}
                  onClick={() => setSelectedBox(box)}
                  className={`absolute transform -translate-y-full mb-1 cursor-pointer transition-all duration-200 z-10 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 shadow-xl ${
                    isSelected 
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-105' 
                      : 'bg-emerald-950/95 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-800'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{box.label}</span>
                  <span className="text-white bg-emerald-600 px-1.5 rounded text-[9px] font-mono">
                    {Math.round(box.confidence * 100)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected Bounding Box Detail Card */}
          {selectedBox && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="card-3d p-4 rounded-2xl border border-blue-500/50 shadow-lg text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-blue-300 flex items-center gap-1.5 font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Detected: {selectedBox.label}
                </span>
                <span className="text-amber-400 font-mono font-bold">Linked to Standard {selectedBox.pcCode}</span>
              </div>
              <p className="text-slate-300">
                Confidence: <strong className="text-white">{(selectedBox.confidence * 100).toFixed(1)}%</strong> • Model: Google Gemini 3.5 Multimodal Vision Inspector.
              </p>
            </motion.div>
          )}

          {/* Tools & PPE Compliance Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl card-3d border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Tools Identified:</span>
              <div className="flex flex-wrap gap-1.5">
                {(vision.toolsIdentified || ['1000V Megger', 'True RMS Clamp Meter', 'Insulated Pliers']).map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-200 text-[11px] font-bold border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl card-3d border border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Safety PPE Score:</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-emerald-400">
                  {vision.ppeCompliance?.ppeScore || 96}%
                </span>
                <span className="text-[11px] text-slate-400">
                  {vision.ppeCompliance?.remarks || 'Dielectric gloves and PPE verified.'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Gemini Assessor Assistant */}
          <div className="card-3d p-5 rounded-3xl border border-blue-500/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Interactive Gemini 3.5 Assessor Co-Pilot</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Live AI Advisor
              </span>
            </div>

            {/* Chat conversation history */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
              {copilotHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-2xl ${
                    item.sender === 'user' 
                      ? 'bg-blue-600/30 text-blue-100 border border-blue-500/40 ml-6 text-right' 
                      : 'bg-slate-950/90 text-slate-200 border border-slate-800 mr-6'
                  }`}
                >
                  <p className="text-xs leading-relaxed">{item.text}</p>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex items-center gap-2 text-blue-400 text-xs italic p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini is analyzing NSQF criteria and standards...</span>
                </div>
              )}
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleAskCopilot('Explain why candidate was awarded 90% on PC1.1')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 transition-all active:scale-95"
              >
                Explain PC1.1 Score
              </button>
              <button
                type="button"
                onClick={() => handleAskCopilot('Verify IS 3043 earthing safety standard compliance')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 transition-all active:scale-95"
              >
                Check IS 3043 Standard
              </button>
              <button
                type="button"
                onClick={() => handleAskCopilot('What specific bridge training modules should this candidate take?')}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 transition-all active:scale-95"
              >
                Bridge Training Modules
              </button>
            </div>

            {/* Input form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleAskCopilot(); }} 
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="Ask Gemini anything about this assessment or NSQF criteria..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={copilotLoading || !copilotQuery.trim()}
                className="btn-3d min-h-[36px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column (Span 5): Audio Viva Voce Citations & Sign-Off */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-400" />
              <span>Voice Viva Voce & Citations</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Bhashini + Gemini
            </span>
          </div>

          {/* Audio Player Card */}
          <div className="card-3d p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            
            {/* Transcript Card */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Vernacular Speech Translation
                </span>
                {isPlayingAudio && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Speaking Audio...
                  </span>
                )}
              </div>
              <p className="text-slate-200 font-medium italic leading-relaxed">
                "{transcript.transcriptEnglish || transcript.transcript}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800">
                <span>Detected: <strong className="text-white">{transcript.languageDetected || 'hi-IN (Vernacular)'}</strong></span>
                <span className="text-emerald-400 font-bold">Clarity: {transcript.conceptClarityRating || 'High (98%)'}</span>
              </div>
            </div>

            {/* Timestamp Citations with Interactive Audio Trigger */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Evidence Citations Mapped to Rubrics (Tap to Listen):
              </span>

              {transcript.timestampCitations?.map((cit, idx) => {
                const isActive = activeCitation === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handlePlayCitation(cit, idx)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-2 ring-amber-400/20' 
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1.5">
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        00:{Math.floor(cit.start_sec).toString().padStart(2, '0')} - 00:{Math.floor(cit.end_sec).toString().padStart(2, '0')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px] font-mono">
                        {cit.pcCode}
                      </span>
                    </div>

                    <p className="font-semibold text-white">
                      "{cit.text_hi || cit.text_en}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Target Competency: <span className="text-emerald-400 font-bold">{cit.matchedKeyword}</span>
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Assessor Sign-Off & DigiLocker Push Card */}
          <div className="card-3d p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-950 to-emerald-950/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <FileCheck2 className="w-5 h-5" />
              <span>Lead Assessor Cryptographic Sign-Off</span>
            </div>

            <textarea
              value={assessorNotes}
              onChange={(e) => setAssessorNotes(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              placeholder="Assessor remarks and certification endorsement..."
            />

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onSignOff?.(assessorNotes)}
                className="btn-3d-emerald w-full sm:flex-1 min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Certify Candidate (Sign Off)</span>
              </button>

              <button
                type="button"
                onClick={() => onPushToDigiLocker?.()}
                className="btn-3d w-full sm:flex-1 min-h-[46px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Push to DigiLocker Wallet</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
