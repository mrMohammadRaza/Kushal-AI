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
  Briefcase
} from 'lucide-react';

export default function ViewA_Dashboard({
  lang,
  t,
  onSelectTrade,
  selectedTrade,
  onOpenCertificates
}) {
  const tradeList = [
    {
      id: 'electrician',
      icon: Zap,
      gradient: 'from-blue-600 to-indigo-700',
      borderGlow: 'hover:border-blue-500/80 hover:shadow-blue-500/20',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      accentBar: 'bg-blue-500',
      ...t.trades.electrician
    },
    {
      id: 'mechanic',
      icon: Wrench,
      gradient: 'from-emerald-600 to-teal-700',
      borderGlow: 'hover:border-emerald-500/80 hover:shadow-emerald-500/20',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      accentBar: 'bg-emerald-500',
      ...t.trades.mechanic
    },
    {
      id: 'plumber',
      icon: Droplets,
      gradient: 'from-sky-500 to-cyan-700',
      borderGlow: 'hover:border-sky-500/80 hover:shadow-sky-500/20',
      badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      accentBar: 'bg-sky-500',
      ...t.trades.plumber
    },
    {
      id: 'tailor',
      icon: Scissors,
      gradient: 'from-amber-500 to-orange-600',
      borderGlow: 'hover:border-amber-500/80 hover:shadow-amber-500/20',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      accentBar: 'bg-amber-500',
      ...t.trades.tailor
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      aria-labelledby="dashboard-heading"
    >
      {/* 12-Column Responsive Layout Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 sm:mb-12">
        
        {/* Left Column (Span 12 on mobile, 8 on desktop): Bold, Friendly Greeting */}
        <div className="lg:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase
            bg-blue-500/10 text-blue-400 border border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 light:bg-blue-100 light:text-blue-800">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI-Assisted RPL Skill Assessment</span>
          </div>

          <h1 
            id="dashboard-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 leading-tight"
          >
            {t.welcomeTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-2xl leading-relaxed">
            {t.welcomeSub}
          </p>
        </div>

        {/* Right Column (Span 12 on mobile, 4 on desktop): RPL Trust Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl border backdrop-blur-md transition-all
          bg-slate-900/60 dark:bg-slate-900/60 light:bg-white/80
          border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-1.5">
                <span>Direct Govt. Recognition</span>
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 leading-normal">
                No lengthy paperwork. Just snap a photo of your work and speak to explain your skills.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Grid of 4 Large Soft-UI Trade Cards (12-Column Grid on Desktop, 2x2 on Tablet, Full-width stack on Mobile) */}
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
              className={`relative text-left p-6 sm:p-7 rounded-3xl transition-all duration-300 w-full flex flex-col justify-between min-h-[260px]
                border focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500
                ${isSelected 
                  ? 'bg-slate-900/95 dark:bg-slate-900/95 light:bg-white border-blue-500 ring-2 ring-blue-500/50 shadow-glow-blue' 
                  : 'bg-slate-900/70 dark:bg-slate-900/70 light:bg-slate-50 border-slate-800/90 dark:border-slate-800/90 light:border-slate-200 shadow-soft-out dark:shadow-soft-out light:shadow-soft-out-light'
                }
                ${trade.borderGlow}`}
              aria-pressed={isSelected}
              aria-label={`${trade.title} - ${trade.roleHindi}, ${trade.level}`}
            >
              {/* Soft UI Top Accent Pill */}
              <div className="flex items-center justify-between w-full mb-5">
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform shadow-md ${trade.iconBg}`}
                  aria-hidden="true"
                >
                  <Icon className="w-9 h-9" />
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${trade.badgeColor}`}>
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

              {/* Title & Subtitle with High-Contrast Typography (Min 24px headings) */}
              <div className="space-y-1.5 mb-6">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-white dark:text-white light:text-slate-900">
                    {trade.title}
                  </h3>
                  <span className="text-sm font-semibold text-slate-400 dark:text-slate-400 light:text-slate-500">
                    ({trade.roleHindi})
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 line-clamp-2">
                  {trade.desc}
                </p>
              </div>

              {/* Tactile Bottom Action Bar (Min 44px touch area) */}
              <div className="pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between w-full">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Start Assessment</span>
                </span>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                    bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-200 text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
                  aria-hidden="true"
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

            </motion.button>
          );
        })}
      </div>

      {/* Secondary Bottom Action: "View My Certificates" Button (Min 44px touch target, physical tactile button) */}
      <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-300 dark:text-slate-300 light:text-slate-600">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white dark:text-white light:text-slate-900">
              Already assessed by Kaushal AI?
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
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
            bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-200 dark:text-slate-200 light:text-slate-800
            border border-slate-700 dark:border-slate-700 light:border-slate-300
            shadow-soft-out dark:shadow-soft-out light:shadow-soft-out-light
            hover:border-amber-400/80 hover:text-amber-400 active:shadow-soft-in"
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
