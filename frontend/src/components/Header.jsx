import React, { useState } from 'react';
import { 
  Sparkles, 
  Languages, 
  Sun, 
  Moon, 
  Volume2, 
  ShieldCheck,
  Check,
  UserCheck,
  User,
  Briefcase,
  Code2,
  Eye,
  FileCheck2,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  Sliders,
  LogOut
} from 'lucide-react';

export default function Header({ 
  lang = 'en', 
  setLang, 
  theme, 
  setTheme, 
  onSpeakHelp,
  candidateProfile,
  onOpenLogin,
  onSwitchRole,
  currentView,
  setCurrentView,
  onOpenBlueprint,
  t 
}) {
  const isHi = lang === 'hi';
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const activeRole = candidateProfile?.role || (candidateProfile?.tradeId === 'assessor' ? 'assessor' : 'candidate');

  return (
    <header 
      className="sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-all duration-300
        bg-[#0a192f]/95 border-teal-900/40 shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
      role="banner"
    >
      {/* Top Institutional Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Platform Identity */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3.5 group cursor-pointer"
        >
          <div 
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white
              bg-gradient-to-tr from-teal-500 via-blue-600 to-indigo-600 shadow-[0_10px_25px_-5px_rgba(13,148,136,0.5)]
              border border-teal-400/30 transform transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            <ShieldCheck className="w-6 h-6 text-teal-200" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-500 opacity-20 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-white drop-shadow-sm flex items-center gap-1.5">
                Kaushal AI
                <span className="text-teal-400 text-xs px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 font-bold uppercase tracking-wider">
                  Skill Verification
                </span>
              </span>
              <span 
                className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full
                  bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                NSQF SSC/Q0501 Aligned
              </span>
            </div>
            <p className="text-xs font-medium text-slate-300 truncate max-w-[210px] sm:max-w-none">
              {isHi ? 'व्यावहारिक कौशल प्रमाणन व मूल्यांकन प्रणाली' : 'Job-Based Practical Skill Assessment Platform'}
            </p>
          </div>
        </div>

        {/* Action Controls & Fast Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3" role="toolbar" aria-label="Accessibility and preferences controls">
          
          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="header-role-switcher-btn"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="min-h-[42px] px-3 sm:px-3.5 py-1.5 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all duration-200
                bg-slate-900/90 border border-teal-500/40 hover:border-teal-400 text-teal-200 hover:text-white shadow-sm"
              title="Switch user role or account"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-600/30 text-teal-300 flex items-center justify-center font-black text-xs">
                {activeRole === 'assessor' ? 'A' : (activeRole === 'admin' ? 'Adm' : 'C')}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[11px] font-extrabold leading-none text-white">
                  {candidateProfile?.fullName?.split(' ')[0] || 'User'}
                </span>
                <span className="text-[10px] text-teal-400 font-semibold capitalize">
                  {activeRole === 'assessor' ? 'Assessor' : (candidateProfile?.tradeName?.split(' ')[0] || 'Candidate')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-teal-400" />
            </button>

            {showRoleMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-teal-500/30 shadow-2xl p-2 z-50 space-y-1"
                onMouseLeave={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select User Context
                </div>
                
                {/* 1. Candidate: Aarav Sharma (Web Developer) */}
                <button
                  type="button"
                  onClick={() => {
                    onSwitchRole?.('candidate_webdev');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-900 flex items-center gap-2.5 text-xs transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    C
                  </div>
                  <div>
                    <span className="font-extrabold text-white block">Aarav Sharma</span>
                    <span className="text-[10px] text-teal-400 font-medium">Candidate (Web Dev L5)</span>
                  </div>
                </button>

                {/* 2. Assessor: Rajesh Varma */}
                <button
                  type="button"
                  onClick={() => {
                    onSwitchRole?.('assessor');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-900 flex items-center gap-2.5 text-xs transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <span className="font-extrabold text-white block">Rajesh Varma</span>
                    <span className="text-[10px] text-indigo-400 font-medium">Lead Assessor (NCVET)</span>
                  </div>
                </button>

                {/* 3. Candidate: Ramesh Kumar (Electrician) */}
                <button
                  type="button"
                  onClick={() => {
                    onSwitchRole?.('candidate_electrician');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-900 flex items-center gap-2.5 text-xs transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                    E
                  </div>
                  <div>
                    <span className="font-extrabold text-white block">Ramesh Kumar Sharma</span>
                    <span className="text-[10px] text-blue-400 font-medium">Candidate (Electrician L3)</span>
                  </div>
                </button>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenLogin?.();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-900 text-slate-300 flex items-center gap-2 text-xs font-bold"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Custom Credentials Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audio Assistance Button */}
          <button
            type="button"
            onClick={onSpeakHelp}
            className="min-h-[42px] min-w-[42px] px-2.5 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-xs transition-all duration-200
              bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-300
              shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-95"
            title={isHi ? "निर्देश बोलकर सुनें" : "Listen to page instructions"}
            aria-label={isHi ? "आवाज़ में निर्देश सुनें" : "Hear voice instructions"}
          >
            <Volume2 className="w-4 h-4 animate-bounce text-amber-300" />
            <span className="hidden lg:inline">{t?.listenPrompt || 'Audio'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="min-h-[42px] min-w-[42px] p-2.5 rounded-2xl flex items-center justify-center transition-all duration-200
              bg-slate-900/90 text-slate-300 border border-white/10 hover:border-teal-500/50 hover:text-white
              active:scale-95 shadow-sm"
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-teal-400" />
            )}
          </button>

          {/* Language Toggle */}
          <div 
            className="flex items-center p-1 rounded-2xl border transition-all
              bg-slate-900/90 border-white/10 shadow-inner"
            role="radiogroup"
            aria-label="Language selection"
          >
            <button
              type="button"
              role="radio"
              aria-checked={lang === 'en'}
              onClick={() => setLang('en')}
              className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all duration-200 ${
                lang === 'en'
                  ? 'bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,0.4)] scale-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'en' && <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
              <span>EN</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={lang === 'hi'}
              onClick={() => setLang('hi')}
              className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all duration-200 ${
                lang === 'hi'
                  ? 'bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,0.4)] scale-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'hi' && <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
              <span>हिंदी</span>
            </button>
          </div>

        </div>

      </div>

      {/* Primary Navigation Bar (Phase 1 Deep Navy Sub-Navigation) */}
      <nav 
        className="w-full bg-[#071324] border-t border-teal-900/30 px-4 py-2"
        aria-label="Primary assessment navigation"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 py-0.5 text-xs font-bold scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* 1. Dashboard Tab */}
            <button
              type="button"
              id="nav-tab-dashboard"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'dashboard'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isHi ? 'डैशबोर्ड' : 'Candidate Dashboard'}</span>
            </button>

            {/* 2. Assessment Blueprint Tab */}
            <button
              type="button"
              id="nav-tab-blueprint"
              onClick={onOpenBlueprint}
              className="px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-900/80 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>{isHi ? 'मूल्यांकन ब्लूप्रिंट' : 'Assessment Blueprint'}</span>
            </button>

            {/* 3. Hybrid Test Engine Tab (Web Developer) */}
            <button
              type="button"
              id="nav-tab-hybrid"
              onClick={() => setCurrentView('hybrid_engine')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'hybrid_engine'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-teal-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-teal-300" />
              <span>{isHi ? 'वेब डेवलपर टेस्ट इंजन' : 'Web Dev Test Engine'}</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping ml-0.5" />
            </button>

            {/* 4. Assessor Console Tab */}
            <button
              type="button"
              id="nav-tab-assessor"
              onClick={() => setCurrentView('assessor')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'assessor'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isHi ? 'मूल्यांकनकर्ता कंसोल' : 'Assessor Console'}</span>
            </button>

            {/* 5. Competency Report Tab */}
            <button
              type="button"
              id="nav-tab-report"
              onClick={() => setCurrentView('report')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                currentView === 'report'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
              <span>{isHi ? 'दक्षता रिपोर्ट' : 'Competency Report'}</span>
            </button>
          </div>

          {/* Right Status Pill */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              V8 VM Sandbox Ready
            </span>
          </div>
        </div>
      </nav>

    </header>
  );
}
