import React from 'react';
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
  Briefcase
} from 'lucide-react';

export default function Header({ 
  lang, 
  setLang, 
  theme, 
  setTheme, 
  onSpeakHelp,
  candidateProfile,
  onOpenLogin,
  t 
}) {
  return (
    <header 
      className="sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors duration-300
        bg-slate-950/85 dark:bg-slate-950/85 border-slate-800/80
        light:bg-white/90 light:border-slate-200"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Gov RPL Badge */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg
              bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 shadow-blue-500/25 ring-2 ring-blue-500/30"
            aria-hidden="true"
          >
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white dark:text-white light:text-slate-900">
                {t.appTitle}
              </span>
              <span 
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                  bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 light:bg-emerald-100 light:text-emerald-800"
                aria-label="Certified by Skill India and NSQF"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {t.govTag}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400 light:text-slate-600 truncate max-w-[210px] sm:max-w-none">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Candidate Login, Audio Assistant, Theme Toggle & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3" role="toolbar" aria-label="Accessibility and preferences controls">
          
          {/* Candidate Profile / Supabase Login Trigger */}
          <button
            type="button"
            onClick={onOpenLogin}
            className={`min-h-[44px] px-3 sm:px-3.5 rounded-xl flex items-center gap-2 font-bold text-xs transition-all duration-200 border ${
              candidateProfile 
                ? 'bg-blue-950/70 border-blue-500/50 text-blue-300 hover:bg-blue-900/60'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {candidateProfile ? (
              <>
                <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="hidden sm:inline truncate max-w-[140px]">{candidateProfile.fullName || 'Candidate'}</span>
                <span className="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded text-blue-200 font-extrabold hidden md:inline">
                  {candidateProfile.experienceYears}y Exp
                </span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'hi' ? 'लॉगिन / कार्य विवरण' : 'Login / Job Details'}</span>
              </>
            )}
          </button>

          {/* Audio Assistance Speaker Button */}
          <button
            type="button"
            onClick={onSpeakHelp}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl flex items-center gap-1.5 font-semibold text-xs transition-all duration-200
              bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 hover:border-amber-400
              shadow-sm hover:shadow-amber-500/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400"
            title={lang === 'hi' ? "निर्देश बोलकर सुनें" : "Listen to page instructions"}
            aria-label={lang === 'hi' ? "आवाज़ में निर्देश सुनें" : "Hear voice instructions"}
          >
            <Volume2 className="w-5 h-5 animate-bounce" />
            <span className="hidden lg:inline font-bold">{t.listenPrompt}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl flex items-center justify-center transition-all duration-200
              bg-slate-900 dark:bg-slate-900 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700
              border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-blue-500/50
              active:scale-95"
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-600" />
            )}
          </button>

          {/* Prominent High-Contrast Fixed Language Toggle */}
          <div 
            className="flex items-center p-1 rounded-2xl border transition-all
              bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-200/90
              border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 shadow-inner"
            role="radiogroup"
            aria-label="Language selection"
          >
            <button
              type="button"
              role="radio"
              aria-checked={lang === 'en'}
              onClick={() => setLang('en')}
              className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all duration-200 ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'en' && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
              <span>EN</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={lang === 'hi'}
              onClick={() => setLang('hi')}
              className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all duration-200 ${
                lang === 'hi'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'hi' && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
              <span>हिंदी</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
