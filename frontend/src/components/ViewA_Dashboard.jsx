import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
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
  Volume2,
  Activity,
  Layers,
  Sliders,
  UserCheck,
  Cpu,
  BadgeCheck,
  Briefcase,
  MapPin,
  Clock,
  FileCode2,
  Bug,
  HelpCircle,
  FileCheck2,
  AlertTriangle,
  Play,
  RotateCcw,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function ViewA_Dashboard({
  lang = 'en',
  t,
  onSelectTrade,
  selectedTrade,
  onOpenCertificates,
  onSpeakPrompt,
  candidateProfile,
  onOpenLogin,
  onOpenAccessibility,
  onStartWebDevAssessment,
  onOpenBlueprint,
  onViewReport,
  activeAssessment,
  assessmentHistory = [],
  webDevTemplate
}) {
  const isHi = lang === 'hi';

  const defaultCompetencies = [
    { title: 'HTML and accessibility', weight: '15%', nos: 'SSC/N0501' },
    { title: 'CSS and responsive design', weight: '15%', nos: 'SSC/N0502' },
    { title: 'JavaScript fundamentals', weight: '20%', nos: 'SSC/N0503' },
    { title: 'Practical development', weight: '30%', nos: 'SSC/N0504' },
    { title: 'Debugging & problem-solving', weight: '15%', nos: 'SSC/N0505' },
    { title: 'Technical explanation', weight: '5%', nos: 'SSC/N0506' }
  ];

  const otherTrades = [
    {
      id: 'electrician',
      icon: Zap,
      gradient: 'from-blue-600 via-indigo-600 to-blue-500',
      iconBg: 'bg-blue-600 text-amber-300',
      badge: 'NSQF Level 3 & 4',
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      tags: ['3-Phase Panel', 'Star-Delta Starter', 'Megger 1000V', 'Earthing Pit'],
      title: isHi ? 'इलेक्ट्रीशियन' : 'Electrician',
      subtitle: isHi ? 'सहायक इलेक्ट्रीशियन' : 'Assistant Electrician',
      desc: isHi ? '3-फेज वितरण पैनल, मोटर वायरिंग व इन्सुलेशन परीक्षण।' : '3-Phase distribution panels, motor wiring, and insulation resistance testing.'
    },
    {
      id: 'mechanic',
      icon: Wrench,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-500',
      iconBg: 'bg-emerald-600 text-emerald-200',
      badge: 'NSQF Level 3 & 4',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      tags: ['Engine Overhaul', 'Brake Caliper', 'OBD-II Scan', 'Torque Spec'],
      title: isHi ? 'मैकेनिक' : 'Mechanic',
      subtitle: isHi ? 'ऑटोमोटिव सर्विस' : 'Automotive Service',
      desc: isHi ? 'इंजन ओवरहाल, ब्रेक सिस्टम और ऑन-बोर्ड डायग्नोस्टिक्स।' : 'Two/Four-wheeler engine overhaul, brakes, and diagnostics.'
    },
    {
      id: 'plumber',
      icon: Droplets,
      gradient: 'from-sky-600 via-cyan-600 to-sky-500',
      iconBg: 'bg-sky-600 text-sky-200',
      badge: 'NSQF Level 3',
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
      tags: ['P-Trap Alignment', 'CPVC Solvent Weld', 'Hydro Pressure Test'],
      title: isHi ? 'प्लंबर' : 'Plumber',
      subtitle: isHi ? 'जनरल प्लंबिंग' : 'General Plumbing',
      desc: isHi ? 'पाइपलाइन फिटिंग, सैनिटरी कार्य और लीकेज प्रूफ़िंग।' : 'Piping, sanitary fittings, CPVC joints, and hydro testing.'
    },
    {
      id: 'tailor',
      icon: Scissors,
      gradient: 'from-amber-600 via-orange-600 to-amber-500',
      iconBg: 'bg-amber-600 text-amber-200',
      badge: 'NSQF Level 4',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      tags: ['Dart Drafting', 'Interlock 5-Thread', 'French Seam'],
      title: isHi ? 'दर्जी' : 'Tailor',
      subtitle: isHi ? 'सेल्फ एम्प्लॉयड दर्जी' : 'Self-Employed Tailor',
      desc: isHi ? 'पैटर्न कटिंग, मशीन सिलाई व गारमेंट फिनिशिंग।' : 'Pattern drafting, machine stitching, hem finishing & garment tailoring.'
    }
  ];

  // Active assessment display helpers
  const hasActiveWebDev = activeAssessment && (activeAssessment.trade_id === 'web-developer-l5' || activeAssessment.tradeId === 'web-developer-l5');
  const activeStatus = activeAssessment?.status || 'draft';
  const isReviewPending = activeStatus === 'assessor_review_required' || activeStatus === 'submitted';
  const isCertified = activeStatus === 'certified_approved' || activeStatus === 'verified_by_assessor' || activeAssessment?.signed_off;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8"
      aria-labelledby="dashboard-heading"
    >
      
      {/* 1. Institutional Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 card-3d border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase
              bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span>Kaushal AI • Job-Based Practical Skill Verification</span>
            </div>

            <h1 
              id="dashboard-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight"
            >
              {isHi ? 'व्यावहारिक कौशल सत्यापन और प्रमाणन' : 'Practical Skill Verification Platform'}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
              {isHi
                ? 'सिद्धांत मात्र नहीं—वास्तविक कोडिंग कार्य, स्वचालित परीक्षण, नियंत्रित डिबगिंग और स्वतंत्र मानव मूल्यांकनकर्ता समीक्षा के साथ अपना कौशल सिद्ध करें।'
                : 'Not just passive quizzes. Demonstrate competency through real coding tasks, automated test checks, controlled defect debugging, and transparent assessor review.'}
            </p>

            {/* Quick Action Toolbar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                id="btn-start-hero-webdev"
                onClick={() => onStartWebDevAssessment ? onStartWebDevAssessment() : (onOpenBlueprint && onOpenBlueprint())}
                className="btn-3d px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold
                  bg-gradient-to-r from-teal-500 to-blue-600 text-white border border-teal-400/40 flex items-center gap-2"
              >
                <Code2 className="w-4 h-4" />
                <span>{hasActiveWebDev ? (isHi ? 'परीक्षण जारी रखें' : 'Continue Web Developer Test') : (isHi ? 'वेब डेवलपर परीक्षा शुरू करें' : 'Start Web Developer Test')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-open-blueprint-hero"
                onClick={() => onOpenBlueprint?.()}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold
                  bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span>{isHi ? 'ब्लूप्रिंट देखें (100% भार)' : 'View Assessment Blueprint'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSpeakPrompt?.()}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold
                  bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 flex items-center gap-2 transition-all active:scale-95"
                title={isHi ? 'आवाज़ में निर्देश सुनें' : 'Listen to voice instructions'}
              >
                <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>{isHi ? 'ध्वनि निर्देश' : 'Voice Guide'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenAccessibility}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold
                  bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 flex items-center gap-2 transition-all active:scale-95"
              >
                <Sliders className="w-4 h-4" />
                <span>{isHi ? 'सुलभता जांच' : 'Hardware & Diagnostics'}</span>
              </button>
            </div>
          </div>

          {/* Right Highlight Box: Hybrid Method Card */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-md shadow-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
                  Hybrid Assessment Framework
                </span>
                <span className="text-sm font-black text-white">5-Stage Evaluation Pipeline</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">1</span>
                <span>Knowledge Questions (Server Validated)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px] font-black">2</span>
                <span>Practical Coding Task (Live Unit Tests)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-black">3</span>
                <span>Controlled Defect Debugging</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black">4</span>
                <span>Technical Explanation & Evidence Upload</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">5</span>
                <span>Human Assessor Review & HMAC Sign-Off</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="text-teal-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> V8 Sandbox Sandbox
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Rubric Audited
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Candidate Active Profile & Live Assessment Status Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Candidate Profile Strip */}
        <div className="lg:col-span-7 card-3d p-5 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-teal-950/40 flex flex-col justify-between gap-4">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-500/40">
                  {candidateProfile?.fullName ? candidateProfile.fullName.charAt(0) : 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-white text-base">
                    {candidateProfile?.fullName || 'Aarav Sharma'}
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    Candidate Profile
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                  <span className="text-teal-300 font-bold flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {candidateProfile?.tradeName || 'Web Developer (NSQF Level 5)'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    {candidateProfile?.experienceYears || '3'} Yrs Exp
                  </span>
                  <span>•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {candidateProfile?.workLocation || 'Bengaluru, Karnataka'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95 border border-slate-700"
            >
              {isHi ? 'विवरण बदलें' : 'Switch / Edit Profile'}
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-center">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Active Role</span>
              <span className="text-xs sm:text-sm font-black text-teal-400">Web Developer</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Standard</span>
              <span className="text-xs sm:text-sm font-black text-blue-400">SSC/Q0501 (L5)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Verified Weight</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">100% Validated</span>
            </div>
          </div>
        </div>

        {/* Live Progress Card */}
        <div className="lg:col-span-5 card-3d p-5 rounded-3xl border border-white/10 bg-slate-950/90 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {isHi ? 'मूल्यांकन प्रगति' : 'Assessment Status & Progress'}
                </h3>
              </div>
              
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                isCertified 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' 
                  : (isReviewPending 
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/40' 
                    : (hasActiveWebDev ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'))
              }`}>
                {isCertified ? 'Verified' : (isReviewPending ? 'Under Assessor Review' : (hasActiveWebDev ? 'In Progress / Saved' : 'Ready to Start'))}
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {hasActiveWebDev ? `Current Step: ${activeAssessment?.current_step || 'Stage 1'}` : 'No active session'}
                </span>
                <span className="font-bold text-teal-400">
                  {isCertified ? '100%' : (isReviewPending ? '90%' : (hasActiveWebDev ? '45%' : '0%'))}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500" 
                  style={{ width: isCertified ? '100%' : (isReviewPending ? '90%' : (hasActiveWebDev ? '45%' : '5%')) }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              id="btn-resume-assessment-card"
              onClick={() => onStartWebDevAssessment ? onStartWebDevAssessment() : (onOpenBlueprint && onOpenBlueprint())}
              className="flex-1 btn-3d px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-black text-xs flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{hasActiveWebDev ? (isHi ? 'परीक्षा जारी रखें' : 'Continue Assessment') : (isHi ? 'परीक्षा शुरू करें' : 'Start Assessment')}</span>
            </button>

            {(isCertified || isReviewPending || activeAssessment) && (
              <button
                type="button"
                id="btn-view-active-report"
                onClick={() => onViewReport?.(activeAssessment)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{isHi ? 'रिपोर्ट देखें' : 'View Report'}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. Primary Feature Card: Web Developer (First Supported Occupation) */}
      <div className="relative rounded-3xl p-6 sm:p-8 card-3d border-2 border-teal-500/40 bg-gradient-to-br from-slate-950 via-[#0a192f] to-teal-950/30 shadow-[0_20px_50px_rgba(13,148,136,0.15)]">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              First Supported Occupation
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
              NSQF Level 5 (SSC/Q0501)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-4 h-4 text-teal-400" />
              Est. Duration: 60 mins
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Automated V8 Tests
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-teal-500/30 border border-teal-400/40">
                <Code2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Web Developer
                </h3>
                <span className="text-xs font-bold text-teal-400 block">
                  IT-ITeS Sector Skill Council • National Qualification SSC/Q0501
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              Complete an end-to-end practical evaluation designed to verify front-end development capabilities: build a responsive task application with add, toggle, filter, and remove features, diagnose and fix controlled software defects, and submit technical explanations with automated test verification.
            </p>

            {/* 6 Competencies Grid */}
            <div className="pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                Assessment Blueprint Competencies (Weights Total 100%)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {defaultCompetencies.map((comp, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block truncate max-w-[140px] sm:max-w-[170px]" title={comp.title}>
                        {comp.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {comp.nos}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/30">
                      {comp.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Action Panel */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-950/90 border border-teal-500/30 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Practical Coding Demonstration
              </span>
              <h4 className="text-sm font-black text-white">
                "Build a responsive task-list application with filter and removal controls"
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Workspace includes multi-tab editor (JS, HTML, CSS), interactive live preview, and deterministic sandbox test execution.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                id="btn-start-webdev-primary"
                onClick={() => onStartWebDevAssessment ? onStartWebDevAssessment() : (onOpenBlueprint && onOpenBlueprint())}
                className="w-full btn-3d py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2
                  bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-500/30"
              >
                <Code2 className="w-4 h-4" />
                <span>{hasActiveWebDev ? 'Resume Assessment' : 'Start Web Developer Assessment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-open-blueprint-modal"
                onClick={() => onOpenBlueprint?.()}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2
                  bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/40 transition-all active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Review Assessment Blueprint</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" /> Zero Server Vulnerability
              </span>
              <span className="font-semibold text-slate-400">V8 Isolated VM</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Previous Results and Assessor Feedback Section */}
      <div className="card-3d p-6 rounded-3xl border border-white/10 bg-slate-950/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {isHi ? 'पिछला परिणाम व मूल्यांकनकर्ता प्रतिक्रिया' : 'Candidate Assessment History & Assessor Feedback'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHi ? 'सत्यापित दक्षता स्कोर, परीक्षक की टिप्पणियां और प्रमाणन स्थिति' : 'Review verified rubric scores, assessor feedback, and competency status.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-inspect-sample-report"
            onClick={() => onViewReport?.(activeAssessment || {
              id: 'asmt-sample-webdev',
              trade_id: 'web-developer-l5',
              candidate_id: candidateProfile?.id || 'cand-103',
              candidate_name: candidateProfile?.fullName || 'Aarav Sharma',
              status: 'verified_by_assessor',
              signed_off: 1,
              overall_score: 92,
              created_at: new Date().toISOString(),
              assessorRemarks: 'Candidate demonstrated outstanding mastery of responsive UI state, unit-tested array immutability, and accessible DOM structures.',
              rubricScores: {
                rubricBreakdown: [
                  { competencyId: 'c1', title: 'HTML and accessibility', score: 14, maxScore: 15, percentage: 93 },
                  { competencyId: 'c2', title: 'CSS and responsive design', score: 14, maxScore: 15, percentage: 93 },
                  { competencyId: 'c3', title: 'JavaScript fundamentals', score: 18, maxScore: 20, percentage: 90 },
                  { competencyId: 'c4', title: 'Practical development', score: 28, maxScore: 30, percentage: 93 },
                  { competencyId: 'c5', title: 'Debugging and problem-solving', score: 14, maxScore: 15, percentage: 93 },
                  { competencyId: 'c6', title: 'Technical explanation', score: 4, maxScore: 5, percentage: 80 }
                ]
              }
            })}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold text-xs flex items-center gap-2 border border-purple-500/40 transition-all active:scale-95"
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>{isHi ? 'नमूना रिपोर्ट देखें' : 'View Competency Report'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

        {/* History Item Row */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
              L5
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Web Developer Skill Verification</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {isCertified ? 'Verified' : (isReviewPending ? 'Under Review' : 'Template Ready')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard: SSC/Q0501 • 6 Competencies Assessed • Deterministic Tests: 7 / 7 Passed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Assessor Review</span>
              <span className="text-slate-300 font-medium">Rajesh Varma (Lead Assessor)</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Competency Score</span>
              <span className="text-sm font-black text-teal-400">{isCertified ? '92%' : (activeAssessment?.overall_score ? `${activeAssessment.overall_score}%` : 'Pending')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Additional Available Occupations in RPL Catalogue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">
              {isHi ? 'अन्य व्यावसायिक ट्रेड' : 'Other Vocational Trades in Catalogue'}
            </h3>
            <p className="text-xs text-slate-400">
              {isHi ? 'मल्टीमोडल फोटो व वॉइस आधारित व्यावहारिक मूल्यांकन उपलब्ध हैं।' : 'Available via multimodal photo and voice viva evidence capture.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            4 Additional Roles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherTrades.map((trade) => {
            const Icon = trade.icon;
            return (
              <div
                key={trade.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-slate-700 transition-all flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trade.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${trade.badgeColor}`}>
                      {trade.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white">
                    {trade.title}
                  </h4>
                  <span className="text-xs font-bold text-amber-400 block mb-1">
                    {trade.subtitle}
                  </span>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {trade.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Multimodal RPL
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectTrade?.(trade)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>View Role</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. DigiLocker & Verification Action Bar */}
      <div className="card-3d p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-black text-white">
              {isHi ? 'क्या आपने पूर्व में प्रमाणन पूरा कर लिया है?' : 'Already verified or assessed by Kaushal AI?'}
            </p>
            <p className="text-xs text-slate-400">
              {isHi ? 'अपना क्यूआर कोडित डिजिटल प्रमाणपत्र, डिजीलॉकर स्थिति और योग्यता रिपोर्ट देखें।' : 'Access verified tamper-evident QR reports, skill transcripts, and DigiLocker certificates.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-dashboard-view-certs"
          onClick={onOpenCertificates}
          className="btn-3d w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2
            bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30"
        >
          <Award className="w-4 h-4 text-slate-950" />
          <span>{isHi ? 'डिजिटल प्रमाणपत्र देखें' : 'View My Certificates'}</span>
          <ChevronRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

    </motion.section>
  );
}
