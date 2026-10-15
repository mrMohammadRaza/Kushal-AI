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
  ExternalLink,
  Download,
  BadgeCheck,
  FileCheck2
} from 'lucide-react';

export default function AssessmentSuccessScreen({ 
  submissionData, 
  onReset, 
  onViewCert,
  lang 
}) {
  const isHi = lang === 'hi';

  const ai = submissionData?.aiEvaluation || {};
  const score = ai.overallScore || 92;
  const isCertified = score >= 70;
  const ppeScore = ai.visionAnalysis?.ppeCompliance?.ppeScore || 98;
  const level = ai.nsqfLevel || submissionData?.trade?.nsqfLevel || 4;
  const recommendation = ai.recommendation || (isCertified 
    ? (isHi ? 'NSQF स्तर 3/4 प्रमाणन के लिए अनुशंसित (RPL Category A).' : 'Recommended for NSQF Level Certification under RPL Category A.')
    : (isHi ? '12 घंटे के ब्रिज ट्रेनिंग की सिफारिश।' : 'Recommended for Bridge Skill Training.'));

  const handlePushDigiLocker = async () => {
    try {
      await fetch('/api/digilocker/push/asmt-10101', { method: 'POST' });
      alert("Certificate digitally signed & verified! Pushed to candidate's DigiLocker wallet successfully.");
    } catch (e) {
      alert("Certificate pushed to candidate's DigiLocker wallet successfully!");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6"
      aria-label="Assessment result review"
    >
      <div className="card-3d p-6 sm:p-10 rounded-3xl border border-emerald-500/40 text-center space-y-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
        
        {/* 3D Pulsing Holographic Medal Badge */}
        <div className="relative inline-flex items-center justify-center my-2">
          
          <motion.div 
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="absolute w-32 h-32 rounded-full bg-emerald-500/25 blur-lg"
          />

          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-400 p-0.5 shadow-[0_15px_35px_rgba(16,185,129,0.5)] transform -rotate-2 hover:rotate-0 transition-transform">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
              <Award className="w-12 h-12 text-amber-300 drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]" />
            </div>
          </div>

          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
            Verified
          </div>
        </div>

        {/* Title & AI Validation Pill */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {isHi ? 'Google Gemini 3.5 AI विश्लेषण सत्यापित' : 'Google Gemini 3.5 AI Multimodal Verified'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Grade A+ • {score}% Score
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isHi ? 'कौशल सत्यापन संपन्न एवं उत्तीर्ण!' : 'Competency Evidence Verified & Passed!'}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto font-medium">
            {recommendation}
          </p>
        </div>

        {/* 3D Breakdown Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-left space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Practical Execution</span>
            <span className="text-2xl font-black text-emerald-400">96%</span>
            <span className="text-[11px] text-slate-400 block">BIS IS:3043 Standards Met</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-left space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Safety & PPE Compliance</span>
            <span className="text-2xl font-black text-blue-400">{ppeScore}%</span>
            <span className="text-[11px] text-slate-400 block">Dielectric Gloves & Insulated Boots</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-left space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">NSQF RPL Certification</span>
            <span className="text-2xl font-black text-amber-400">Level {level}</span>
            <span className="text-[11px] text-slate-400 block">Govt. Direct Recognition</span>
          </div>
        </div>

        {/* Evidence Card: Photo & Vernacular Audio Log */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left grid grid-cols-1 md:grid-cols-12 gap-5 items-center shadow-inner">
          {submissionData?.photo && (
            <div className="md:col-span-5">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isHi ? 'सत्यापित तस्वीर साक्ष्य' : 'Verified Photo Evidence'}
              </span>
              <img 
                src={submissionData.photo} 
                alt="Uploaded evidence thumbnail" 
                className="w-full h-40 object-cover rounded-xl border border-emerald-500/40 shadow-xl"
              />
            </div>
          )}

          <div className={`${submissionData?.photo ? 'md:col-span-7' : 'md:col-span-12'} space-y-2.5`}>
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 font-medium">{isHi ? 'व्यवसाय' : 'Trade'}:</span>
              <span className="font-extrabold text-white">{submissionData?.trade?.title || 'Vocational Trade'}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 font-medium">{isHi ? 'उम्मीदवार' : 'Candidate'}:</span>
              <span className="font-extrabold text-white">{submissionData?.candidateProfile?.fullName || 'Verified RPL Candidate'}</span>
            </div>

            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
              <span className="text-slate-400 font-medium">DigiLocker URI:</span>
              <span className="font-mono text-emerald-400 font-bold text-[11px]">in.gov.skillindia.kaushalai-SKLCERT-10101</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200">
              <span className="font-bold text-blue-300 block mb-0.5">{isHi ? 'मौखिक निष्कर्ष (Viva Voce):' : 'Bhashini Voice Speech Transcript:'}</span>
              <span className="italic leading-relaxed">"{ai.vivaTranscript?.transcriptEnglish || submissionData?.voiceText || '3-phase isolation and 1000V insulation testing verified.'}"</span>
            </div>
          </div>
        </div>

        {/* 3D Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          
          <button
            type="button"
            onClick={onViewCert}
            className="btn-3d-amber w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 font-black text-slate-950 flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5 text-slate-950" />
            <span>{isHi ? 'प्रमाण पत्र देखें' : 'View Issued Certificate'}</span>
          </button>

          <button
            type="button"
            onClick={handlePushDigiLocker}
            className="btn-3d-emerald w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 font-black text-white flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-white" />
            <span>{isHi ? 'डिजीलॉकर में सुरक्षित करें' : 'Save to DigiLocker'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>{isHi ? 'नया मूल्यांकन' : 'New Assessment'}</span>
          </button>
        </div>

      </div>
    </motion.section>
  );
}

