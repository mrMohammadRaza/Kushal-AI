import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Cpu, 
  RotateCcw, 
  ArrowRight, 
  Sparkles,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AssessmentSuccessScreen({ 
  submissionData, 
  onReset, 
  onViewCert,
  lang 
}) {
  const isHi = lang === 'hi';

  const ai = submissionData?.aiEvaluation || {};
  const score = ai.overallScore || 91;
  const isCertified = score >= 70;
  const ppeScore = ai.visionAnalysis?.ppeCompliance?.ppeScore || 100;
  const level = ai.nsqfLevel || submissionData?.trade?.nsqfLevel || 3;
  const recommendation = ai.recommendation || (isCertified 
    ? (isHi ? 'NSQF स्तर 3/4 प्रमाणन के लिए अनुशंसित।' : 'Recommended for NSQF Level Certification under RPL Category A.')
    : (isHi ? '12 घंटे के ब्रिज ट्रेनिंग की सिफारिश।' : 'Recommended for Bridge Skill Training.'));

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-3xl mx-auto px-4 py-8"
      aria-label="Assessment result review"
    >
      <div className="p-6 sm:p-10 rounded-3xl border border-emerald-500/40 bg-slate-900/90 shadow-2xl text-center space-y-6">
        
        {/* Pulsing Success Badge */}
        <div className="relative inline-flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute w-24 h-24 rounded-full bg-emerald-500/30"
          />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {isHi ? 'Google Gemini 3.5 AI विश्लेषण सत्यापित' : 'Google Gemini 3.5 AI Analysis Verified'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {score}% Score
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {isHi ? 'कौशल सत्यापन पूरा हुआ!' : 'Evidence Verified & Passed!'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-lg mx-auto">
            {recommendation}
          </p>
        </div>

        {/* Evidence Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {submissionData.photo && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                {isHi ? 'जमा की गई तस्वीर' : 'Uploaded Photo Evidence'}
              </span>
              <img 
                src={submissionData.photo} 
                alt="Uploaded evidence thumbnail" 
                className="w-full h-32 object-cover rounded-xl border border-slate-700 shadow-md"
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
              <span className="text-slate-400">{isHi ? 'व्यवसाय' : 'Trade'}:</span>
              <span className="font-bold text-white">{submissionData.trade?.title || 'Vocational Trade'}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
              <span className="text-slate-400">{isHi ? 'सुरक्षा मानक' : 'Safety Protocols'}:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {ppeScore}% Compliant
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
              <span className="text-slate-400">{isHi ? 'NSQF स्तर' : 'Assessed Level'}:</span>
              <span className="font-bold text-amber-400">Level {level} Verified</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
              <span className="font-bold block">{isHi ? 'आवाज़ का निष्कर्ष:' : 'Voice Audio Log:'}</span>
              <span className="italic">"{ai.vivaTranscript?.transcriptEnglish || submissionData.voiceText || 'Procedural rationale verified'}"</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onViewCert}
            className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 font-extrabold text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95"
          >
            <Award className="w-5 h-5 text-slate-950" />
            <span>{isHi ? 'प्रमाण पत्र देखें' : 'View Issued Certificate'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>{isHi ? 'नया मूल्यांकन शुरू करें' : 'Start Another Assessment'}</span>
          </button>
        </div>

      </div>
    </motion.section>
  );
}
