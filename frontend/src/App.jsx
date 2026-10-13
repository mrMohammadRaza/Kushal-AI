import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import ViewA_Dashboard from './components/ViewA_Dashboard';
import ViewB_EvidenceCapture from './components/ViewB_EvidenceCapture';
import CertificatesModal from './components/CertificatesModal';
import AssessmentSuccessScreen from './components/AssessmentSuccessScreen';
import { translations } from './data/translations';
import { 
  Sparkles, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Volume2, 
  Info,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // Localization & Theme States
  const [lang, setLang] = useState('hi'); // Default to Hindi for informal Indian workforce, instant toggle to EN
  const [theme, setTheme] = useState('dark');
  
  // Navigation & Flow State
  // 'dashboard' (View A), 'evidence' (View B), 'completed' (Post-submission)
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [audioAnnounceText, setAudioAnnounceText] = useState('');

  const t = translations[lang];

  // Theme Synchronizer with document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Default to Electrician trade when entering wizard directly
  useEffect(() => {
    if (!selectedTrade && t?.trades?.electrician) {
      setSelectedTrade(t.trades.electrician);
    }
  }, [lang, t]);

  // Voice Guidance (SpeechSynthesis for low-literacy informal workers)
  const speakInstructions = (customText) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = customText || (
        currentView === 'dashboard' 
          ? (lang === 'hi' 
              ? 'नमस्ते! कौशल एआई में आपका स्वागत है। अपना व्यवसाय चुनें: इलेक्ट्रीशियन, मैकेनिक, प्लंबर, या दर्जी।' 
              : 'Welcome to Kaushal AI. Please select your trade: Electrician, Mechanic, Plumber, or Tailor.')
          : (lang === 'hi'
              ? 'चरण 1: अपने काम की तस्वीर खींचें, और नीचे दिए गए बड़े माइक बटन को दबाकर अपने काम के बारे में बोलकर बताएं।'
              : 'Step 1: Take a photo of your completed work, then tap the large microphone button to describe your work.')
      );

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95; // Slightly slower for better comprehension
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trade selection handler -> transitions to View B (Evidence Capture)
  const handleSelectTrade = (trade) => {
    setSelectedTrade(trade);
    setCurrentView('evidence');
    // Speak audio prompt in chosen language
    if (lang === 'hi') {
      speakInstructions(`${trade.title} चुना गया। अब अपने काम की फोटो लें और बोलकर समझाएं।`);
    } else {
      speakInstructions(`${trade.title} selected. Now capture a photo of your work and speak to explain.`);
    }
  };

  // Submission handler
  const handleSubmitEvidence = (data) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionData(data);
      setCurrentView('completed');
    }, 1800);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300
      ${theme === 'dark' ? 'bg-[#090d16] text-slate-100' : 'bg-slate-100 text-slate-900'}`}
    >
      {/* 1. Header with Logo, Audio Prompt, Theme & Language Toggle */}
      <Header 
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onSpeakHelp={() => speakInstructions()}
        t={t}
      />

      {/* Screen Mode Quick Switcher Bar (Allows Evaluators to test View A and View B instantly) */}
      <div className="w-full bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-200/80 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Assessment Navigation:</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/30'
                  : 'bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              <span>View A: Dashboard & Trade</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('evidence')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                currentView === 'evidence'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/30'
                  : 'bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              <span>View B: Evidence Capture (Wizard)</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Content Area with Animated Wizard Transitions */}
      <main className="flex-1 flex flex-col justify-center relative overflow-hidden py-4 sm:py-8">
        
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <ViewA_Dashboard 
              key="view-a"
              lang={lang}
              t={t}
              selectedTrade={selectedTrade}
              onSelectTrade={handleSelectTrade}
              onOpenCertificates={() => setIsCertModalOpen(true)}
            />
          )}

          {currentView === 'evidence' && (
            <ViewB_EvidenceCapture 
              key="view-b"
              lang={lang}
              t={t}
              selectedTrade={selectedTrade}
              onBack={() => setCurrentView('dashboard')}
              onSubmitEvidence={handleSubmitEvidence}
              isSubmitting={isSubmitting}
            />
          )}

          {currentView === 'completed' && (
            <AssessmentSuccessScreen 
              key="view-completed"
              submissionData={submissionData}
              onReset={() => {
                setSubmissionData(null);
                setCurrentView('dashboard');
              }}
              onViewCert={() => setIsCertModalOpen(true)}
              lang={lang}
            />
          )}
        </AnimatePresence>

      </main>

      {/* 3. Certificate Modal */}
      <CertificatesModal 
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        lang={lang}
      />

      {/* 4. Accessible Bottom Footer */}
      <footer className="border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">
              Kaushal AI — Skill India RPL Digital Assessment Portal (SIH26242)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Audio & Voice-First UI</span>
            <span>•</span>
            <span>High-Contrast Native Feel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
