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
  Briefcase,
  Zap
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
      className="sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-all duration-300
        bg-slate-950/90 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Gov RPL Badge */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div 
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white
              bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)]
              border border-white/20 transform transition-transform group-hover:scale-105 group-hover:rotate-1"
            aria-hidden="true"
          >
            <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 opacity-20 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-white drop-shadow-sm flex items-center gap-1.5">
                {t.appTitle}
                <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-bold uppercase tracking-wider">
                  3D AI
                </span>
              </span>
              <span 
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full
                  bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                aria-label="Certified by Skill India and NSQF"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {t.govTag}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 truncate max-w-[210px] sm:max-w-none">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3" role="toolbar" aria-label="Accessibility and preferences controls">
          
          {/* Candidate Profile / Supabase Login Trigger */}
          <button
            type="button"
            onClick={onOpenLogin}
            className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all duration-300 border ${
              candidateProfile 
                ? 'bg-slate-900/90 border-blue-500/40 text-blue-300 hover:border-blue-400 hover:bg-blue-950/40 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.3)]'
                : 'btn-3d bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/30'
            }`}
          >
            {candidateProfile ? (
              <>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {candidateProfile.fullName ? candidateProfile.fullName.charAt(0) : 'C'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="block truncate max-w-[120px] font-extrabold text-white text-xs leading-none">
                    {candidateProfile.fullName || 'Candidate'}
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold">
                    {candidateProfile.experienceYears || '5'}y Exp • {candidateProfile.tradeName?.split(' ')[0] || 'Electrician'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'hi' ? 'लॉगिन / कार्य विवरण' : 'Login / Job Details'}</span>
              </>
            )}
          </button>

          {/* Audio Assistance Speaker Button */}
          <button
            type="button"
            onClick={onSpeakHelp}
            className="min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-2xl flex items-center gap-1.5 font-bold text-xs transition-all duration-200
              bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 hover:border-amber-300
              shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-95"
            title={lang === 'hi' ? "निर्देश बोलकर सुनें" : "Listen to page instructions"}
            aria-label={lang === 'hi' ? "आवाज़ में निर्देश सुनें" : "Hear voice instructions"}
          >
            <Volume2 className="w-4 h-4 animate-bounce text-amber-300" />
            <span className="hidden lg:inline">{t.listenPrompt}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl flex items-center justify-center transition-all duration-200
              bg-slate-900/90 text-slate-300 border border-white/10 hover:border-blue-500/50 hover:text-white
              active:scale-95 shadow-sm"
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          {/* Prominent High-Contrast Fixed Language Toggle */}
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
              className={`min-h-[38px] px-3 sm:px-3.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all duration-200 ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.4)] scale-100'
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
              className={`min-h-[38px] px-3 sm:px-3.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all duration-200 ${
                lang === 'hi'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.4)] scale-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'hi' && <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />}
              <span>हिंदी</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
