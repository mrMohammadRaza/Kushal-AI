import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Wrench, 
  Droplets, 
  Scissors, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Star,
  Flame,
  Volume2,
  Activity,
  Layers,
  Sliders,
  UserCheck,
  Cpu,
  BadgeCheck,
  Briefcase,
  MapPin
} from 'lucide-react';

export default function ViewA_Dashboard({
  lang,
  t,
  onSelectTrade,
  selectedTrade,
  onOpenCertificates,
  onSpeakPrompt,
  candidateProfile,
  onOpenLogin,
  onOpenAccessibility
}) {
  const isHi = lang === 'hi';

  const tradeList = [
    {
      id: 'electrician',
      icon: Zap,
      gradient: 'from-blue-600 via-indigo-600 to-blue-500',
      bgGlow: 'group-hover:bg-blue-600/20',
      borderColor: 'border-blue-500/30 group-hover:border-blue-400',
      iconColor: 'text-amber-300',
      iconBg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.6)]',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      tags: ['3-Phase Panel', 'Star-Delta Starter', 'Megger 1000V', 'IS 3043 Earthing'],
      ...t.trades.electrician
    },
    {
      id: 'mechanic',
      icon: Wrench,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-500',
      bgGlow: 'group-hover:bg-emerald-600/20',
      borderColor: 'border-emerald-500/30 group-hover:border-emerald-400',
      iconColor: 'text-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-lime-500 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.6)]',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      tags: ['Engine Overhaul', 'Brake Caliper Bleed', 'OBD-II Scan', 'Torque Spec'],
      ...t.trades.mechanic
    },
    {
      id: 'plumber',
      icon: Droplets,
      gradient: 'from-sky-600 via-cyan-600 to-sky-500',
      bgGlow: 'group-hover:bg-sky-600/20',
      borderColor: 'border-sky-500/30 group-hover:border-sky-400',
      iconColor: 'text-sky-300',
      iconBg: 'bg-gradient-to-br from-sky-600 via-cyan-600 to-blue-500 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.6)]',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
      tags: ['P-Trap Alignment', 'CPVC Solvent Weld', 'Hydro Pressure Test', 'PPR Fusion'],
      ...t.trades.plumber
    },
    {
      id: 'tailor',
      icon: Scissors,
      gradient: 'from-amber-600 via-orange-600 to-amber-500',
      bgGlow: 'group-hover:bg-amber-600/20',
      borderColor: 'border-amber-500/30 group-hover:border-amber-400',
      iconColor: 'text-amber-300',
      iconBg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-rose-500 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.6)]',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      tags: ['Dart Drafting', 'Interlock 5-Thread', 'French Seam', 'Bias Binding'],
      ...t.trades.tailor
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8"
      aria-labelledby="dashboard-heading"
    >
      
      {/* 1. Hero 3D Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 card-3d border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        
        {/* Dynamic 3D ambient glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase
              bg-blue-500/15 text-blue-300 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Skill India • RPL 4.0 Multimodal AI Co-Pilot</span>
            </div>

            <h1 
              id="dashboard-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
            >
              {t.welcomeTitle}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
              {t.welcomeSub}
            </p>

            {/* Voice Guidance Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSpeakPrompt?.()}
                className="btn-3d-amber inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold
                  bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border border-amber-300/40"
              >
                <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>{isHi ? 'आवाज़ में निर्देश सुनें (Voice Guide)' : 'Listen to Voice Instructions'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenAccessibility}
                className="btn-3d inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold
                  bg-gradient-to-r from-slate-900 to-slate-800 text-emerald-300 border border-emerald-500/40"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>{isHi ? 'सुलभता व हार्डवेयर टेस्ट' : 'Accessibility Diagnostic Test'}</span>
              </button>
            </div>
          </div>

          {/* Right 3D Highlight Card: NSQF Direct Standard */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-md shadow-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                  Govt. NSQF Level 3/4
                </span>
                <span className="text-sm font-black text-white">Direct Recognition of Prior Learning</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isHi
                ? 'कोई लंबा लिखित फॉर्म नहीं। सिर्फ काम की तस्वीर लें और अपनी मातृभाषा में बोलकर अपने काम का विवरण दें।'
                : 'Zero complex paperwork. Simply snap a photo of your practical work and speak in your vernacular language.'}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1 text-blue-400">
                <Cpu className="w-3.5 h-3.5" /> Gemini 3.5 Multimodal
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> DigiLocker Ready
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Candidate Active Profile & Job Details Bar */}
      {candidateProfile && (
        <div className="card-3d p-4 sm:p-5 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-blue-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/40">
                {candidateProfile.fullName ? candidateProfile.fullName.charAt(0) : 'R'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base">
                  {candidateProfile.fullName || 'Candidate'}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Confirmed Candidate
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {candidateProfile.tradeName || 'Assistant Electrician'}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">
                  {candidateProfile.experienceYears || '5'} Yrs Experience
                </span>
                <span>•</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {candidateProfile.workLocation || 'Varanasi, UP'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95 border border-slate-700"
            >
              {isHi ? 'विवरण बदलें' : 'Change Job Info'}
            </button>
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="btn-3d-emerald px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHi ? 'सुलभता जांच लें' : 'Run Diagnostics'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Operational Integrity & Verification Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="card-3d p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Automated Tests</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">20 / 20</span>
          <span className="text-[10px] text-emerald-400 font-bold block">✓ 15 Jest + 5 Pytest Passing</span>
        </div>
        <div className="card-3d p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Indexed NSQF Standards</span>
          <span className="text-xl sm:text-2xl font-black text-blue-400">5 Trades</span>
          <span className="text-[10px] text-blue-300 font-bold block">NSQF Level 3 & 4 QPs</span>
        </div>
        <div className="card-3d p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Resilient Architecture</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400">3-Tier</span>
          <span className="text-[10px] text-slate-400 font-bold block">FastAPI ➔ Gemini ➔ Local Rules</span>
        </div>
        <div className="card-3d p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Report Verification</span>
          <span className="text-xl sm:text-2xl font-black text-purple-400">SHA-256</span>
          <span className="text-[10px] text-purple-300 font-bold block">Tamper-Evident QR Digest</span>
        </div>
      </div>

      {/* 4. Grid of 4 Elevated 3D Interactive Trade Cards */}
      <div 
        className="perspective-1000 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        role="group"
        aria-label="Trade selection options"
      >
        {tradeList.map((trade) => {
          const Icon = trade.icon;
          const isSelected = selectedTrade?.id === trade.id;

          return (
            <motion.button
              key={trade.id}
              type="button"
              onClick={() => onSelectTrade(trade)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className={`group relative text-left p-6 sm:p-7 rounded-3xl transition-all duration-300 w-full flex flex-col justify-between min-h-[320px]
                border focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500
                card-3d
                ${isSelected 
                  ? 'border-blue-400 ring-4 ring-blue-500/40 shadow-[0_0_35px_rgba(59,130,246,0.4)]' 
                  : `${trade.borderColor} hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]`
                }`}
              aria-pressed={isSelected}
              aria-label={`${trade.title} - ${trade.roleHindi}, ${trade.level}`}
            >
              {/* Top Row: Floating 3D Icon & NSQF Badge */}
              <div className="flex items-center justify-between w-full mb-5">
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white transform transition-transform group-hover:scale-110 group-hover:rotate-2 ${trade.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon className="w-8 h-8 drop-shadow-md" />
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${trade.badge}`}>
                    {trade.level}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle with High-Contrast Typography */}
              <div className="space-y-2 mb-4">
                <div>
                  <h3 className="text-2xl sm:text-[26px] font-black tracking-tight text-white group-hover:text-blue-300 transition-colors">
                    {trade.title}
                  </h3>
                  <span className="text-sm font-extrabold text-amber-400 block mt-0.5">
                    {trade.roleHindi}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-300 line-clamp-2 leading-relaxed">
                  {trade.desc}
                </p>

                {/* Competency Standard Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {trade.tags?.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 border border-slate-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tactile 3D Action Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between w-full">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-blue-400 flex items-center gap-1.5">
                  <span>Start Practical Test</span>
                </span>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                    bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 shadow-lg"
                  aria-hidden="true"
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

            </motion.button>
          );
        })}
      </div>

      {/* 5. Secondary Bottom Action: "View My Certificates" Banner */}
      <div className="card-3d p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-black text-white">
              Already assessed by Kaushal AI?
            </p>
            <p className="text-xs text-slate-400">
              Check your verified QR-coded NSQF e-Certificate, skill score report, and DigiLocker status.
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onOpenCertificates}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn-3d-amber w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all
            bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950"
          aria-label={t.viewCertificates}
        >
          <Award className="w-4 h-4 text-slate-950" />
          <span>{t.viewCertificates}</span>
          <ChevronRight className="w-4 h-4 text-slate-950" />
        </motion.button>
      </div>

    </motion.section>
  );
}

