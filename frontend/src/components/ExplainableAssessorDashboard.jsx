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
  ExternalLink
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

  const vision = assessmentData?.visionAnalysis || {
    boundingBoxes: [
      {
        label: "Dielectric Safety Gloves (Class 1)",
        box_2d: [0.18, 0.22, 0.44, 0.48],
        confidence: 0.96,
        pcCode: "PC1.1"
      },
      {
        label: "3-Phase Industrial Busbar & Lug Termination",
        box_2d: [0.42, 0.45, 0.88, 0.85],
        confidence: 0.94,
        pcCode: "PC1.2"
      },
      {
        label: "Calibrated 1000V Megger Insulation Tester",
        box_2d: [0.55, 0.12, 0.85, 0.38],
        confidence: 0.92,
        pcCode: "PC2.1"
      }
    ]
  };

  const transcript = assessmentData?.vivaTranscript || {
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8" aria-label="Explainable AI Assessor Dashboard">
      
      {/* Top Banner: Verification Audit Header */}
      <div className="p-6 rounded-3xl border border-blue-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Explainable AI (XAI) Audit Console
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Anti-Fraud Verified
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Candidate Evidence & Criteria Explainability
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Audit why AI awarded competencies by inspecting visual bounding boxes and timestamped voice citations.
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700 shadow-inner">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Overall Score</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">92%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
            A+
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Visual XAI (Left) & Audio/Text XAI (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Span 7): Interactive Photo with Bounding Box Overlays */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-blue-400" />
              <span>Visual Object & Safety Detection</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Click a box to audit criteria</span>
          </div>

          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl group">
            {/* Base Evidence Photo */}
            <img 
              src={photoUrl} 
              alt="Assessed trade work" 
              className="w-full h-full object-cover"
            />

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
                      fill={isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(34, 197, 94, 0.15)"}
                      stroke={isSelected ? "#60a5fa" : "#22c55e"}
                      strokeWidth={isSelected ? "1.5" : "1"}
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
                  className={`absolute transform -translate-y-full mb-1 cursor-pointer transition-all duration-200 z-10 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-lg ${
                    isSelected 
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                      : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 hover:bg-emerald-800'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{box.label}</span>
                  <span className="text-white bg-emerald-600 px-1 rounded text-[9px]">
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
              className="p-4 rounded-2xl bg-slate-900 border border-blue-500/50 shadow-lg text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Detected: {selectedBox.label}
                </span>
                <span className="text-amber-400">Linked to Standard {selectedBox.pcCode}</span>
              </div>
              <p className="text-slate-300">
                Confidence: <strong className="text-white">{(selectedBox.confidence * 100).toFixed(1)}%</strong> • Model: Gemini 1.5 Pro Multimodal Vision Object Detector.
              </p>
            </motion.div>
          )}
        </div>

        {/* Right Column (Span 5): Audio Citations & Explainable Transcript */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-amber-400" />
                <span>Bhashini Audio Citations</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Timestamps Verified
              </span>
            </div>

            {/* Transcript Display */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Original Audio Transcript (Hindi / Vernacular)
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 italic leading-relaxed">
                "{transcript.transcript}"
              </p>
              
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Bhashini English Translation (NSQF Normalized)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "{transcript.transcriptEnglish}"
                </p>
              </div>
            </div>

            {/* Timestamp Citations Timeline */}
            <div className="space-y-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                Evidence Quotes Mapped to NSQF Rubrics:
              </span>

              {transcript.timestampCitations?.map((cit, idx) => {
                const isActive = activeCitation?.matchedKeyword === cit.matchedKeyword;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveCitation(cit)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs ${
                      isActive 
                        ? 'border-blue-400 bg-blue-950/40 ring-2 ring-blue-500/40' 
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                        00:{Math.floor(cit.start_sec).toString().padStart(2, '0')} - 00:{Math.floor(cit.end_sec).toString().padStart(2, '0')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                        {cit.pcCode}
                      </span>
                    </div>

                    <p className="font-semibold text-white">
                      "{cit.text_hi}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target Competency: <span className="text-emerald-400 font-bold">{cit.matchedKeyword}</span>
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Assessor Sign-Off & DigiLocker Push Card */}
          <div className="p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 to-emerald-950/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <FileCheck2 className="w-5 h-5" />
              <span>Government Assessor Verification Sign-Off</span>
            </div>

            <textarea
              value={assessorNotes}
              onChange={(e) => setAssessorNotes(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Assessor remarks..."
            />

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onSignOff?.(assessorNotes)}
                className="w-full sm:flex-1 min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Certify Candidate (Sign Off)</span>
              </button>

              <button
                type="button"
                onClick={() => onPushToDigiLocker?.()}
                className="w-full sm:flex-1 min-h-[46px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95"
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
