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
  Volume2
} from 'lucide-react';

export default function ViewA_Dashboard({
  lang,
  t,
  onSelectTrade,
  selectedTrade,
  onOpenCertificates,
  onSpeakPrompt
}) {
  const tradeList = [
    {
      id: 'electrician',
      icon: Zap,
      gradient: 'from-blue-600 via-indigo-600 to-blue-500',
      bgGlow: 'group-hover:bg-blue-600/15',
      borderColor: 'border-blue-500/30 group-hover:border-blue-400',
      iconColor: 'text-amber-300',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/40',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      tags: ['3-Phase Panel', 'Star-Delta', 'Megger Test'],
      ...t.trades.electrician
    },
    {
      id: 'mechanic',
      icon: Wrench,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-500',
      bgGlow: 'group-hover:bg-emerald-600/15',
      borderColor: 'border-emerald-500/30 group-hover:border-emerald-400',
      iconColor: 'text-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/40',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      tags: ['Engine Overhaul', 'Brake Bleeding', 'OBD-II'],
      ...t.trades.mechanic
    },
    {
      id: 'plumber',
      icon: Droplets,
      gradient: 'from-sky-600 via-cyan-600 to-sky-500',
      bgGlow: 'group-hover:bg-sky-600/15',
      borderColor: 'border-sky-500/30 group-hover:border-sky-400',
      iconColor: 'text-sky-300',
      iconBg: 'bg-gradient-to-br from-sky-600 to-cyan-700 shadow-sky-500/40',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
      tags: ['P-Trap Fitting', 'CPVC Solvent', 'Pressure Test'],
      ...t.trades.plumber
    },
    {
      id: 'tailor',
      icon: Scissors,
      gradient: 'from-amber-600 via-orange-600 to-amber-500',
      bgGlow: 'group-hover:bg-amber-600/15',
      borderColor: 'border-amber-500/30 group-hover:border-amber-400',
      iconColor: 'text-amber-300',
      iconBg: 'bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-500/40',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      tags: ['Pattern Drafting', 'Interlock Stitch', 'Hemming'],
      ...t.trades.tailor
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      aria-labelledby="dashboard-heading"
    >
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 sm:mb-12 border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 backdrop-blur-xl shadow-2xl">
        
        {/* Decorative Ambient Background Gradients */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase
              bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Skill India • Recognition of Prior Learning (RPL)</span>
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

            {/* Quick Audio Assist Voice Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSpeakPrompt?.()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold
                  bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all active:scale-95 shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>{lang === 'hi' ? 'आवाज़ में निर्देश सुनें (सुनें)' : 'Listen to Voice Instructions'}</span>
              </button>
            </div>
          </div>

          {/* Right Highlight Badge: Trust & Fast Track */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                  Govt. NSQF Standards
                </span>
                <span className="text-sm font-black text-white">Direct Recognition</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              {lang === 'hi'
                ? 'कागज़ी फॉर्म भरने की जरूरत नहीं है। सिर्फ काम की तस्वीर लें और बोलकर अपनी कारीगरी बताएं।'
                : 'No lengthy paperwork. Just snap a photo of your work and speak to explain your craft.'}
            </p>
          </div>

        </div>
      </div>

      {/* Grid of 4 Large Soft-UI Trade Cards */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
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
              whileHover={{ scale: 1.025, y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className={`group relative text-left p-6 sm:p-7 rounded-3xl transition-all duration-300 w-full flex flex-col justify-between min-h-[300px]
                border focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500
                bg-slate-900/80 backdrop-blur-xl
                ${isSelected 
                  ? 'border-blue-400 ring-4 ring-blue-500/30 shadow-glow-blue bg-slate-900' 
                  : `${trade.borderColor} shadow-soft-out hover:shadow-2xl`
                }`}
              aria-pressed={isSelected}
              aria-label={`${trade.title} - ${trade.roleHindi}, ${trade.level}`}
            >
              {/* Soft UI Top Accent Pill */}
              <div className="flex items-center justify-between w-full mb-4">
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${trade.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon className="w-9 h-9" />
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${trade.badge}`}>
                    {trade.level}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selected
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
                  <span className="text-sm font-bold text-amber-400">
                    {trade.roleHindi}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-300 line-clamp-2 leading-relaxed">
                  {trade.desc}
                </p>

                {/* Competency Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {trade.tags?.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tactile Bottom Action Bar (Min 44px touch area) */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between w-full">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 flex items-center gap-1.5">
                  <span>Start Assessment</span>
                </span>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                    bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 shadow-md"
                  aria-hidden="true"
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

            </motion.button>
          );
        })}
      </div>

      {/* Secondary Bottom Action: "View My Certificates" Button */}
      <div className="mt-12 sm:mt-16 p-6 rounded-3xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              Already assessed by Kaushal AI?
            </p>
            <p className="text-xs text-slate-400">
              Check your verified QR-coded NSQF e-Certificate and score history.
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onOpenCertificates}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all
            bg-slate-900 text-slate-200 border border-slate-700
            shadow-soft-out hover:border-amber-400 hover:text-amber-400 active:shadow-soft-in"
          aria-label={t.viewCertificates}
        >
          <Award className="w-5 h-5 text-amber-400" />
          <span>{t.viewCertificates}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </motion.button>
      </div>

    </motion.section>
  );
}
