import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Mic, 
  MicOff, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Upload, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Volume2, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
  HelpCircle
} from 'lucide-react';

export default function ViewB_EvidenceCapture({
  lang,
  t,
  selectedTrade,
  onBack,
  onSubmitEvidence,
  isSubmitting
}) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [errorStatus, setErrorStatus] = useState(null);

  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setErrorStatus(null);
    }
  };

  const handleLoadSamplePhoto = () => {
    if (selectedTrade?.sampleEvidence) {
      setPhotoPreview(selectedTrade.sampleEvidence);
      setErrorStatus(null);
    }
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time voice speech synthesis / recognition
      setTimeout(() => {
        setIsRecording(false);
        setVoiceRecorded(true);
        setVoiceText(selectedTrade?.voicePrompt || "Work completed and verified according to standard safety guidelines.");
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleFormSubmit = () => {
    if (!photoPreview) {
      setErrorStatus(lang === 'hi' ? 'कृपया पहले अपने काम की एक तस्वीर लें' : 'Please capture a photo of your work first');
      return;
    }
    onSubmitEvidence({
      trade: selectedTrade,
      photo: photoPreview,
      voiceText: voiceText || (lang === 'hi' ? 'मौखिक विवरण दर्ज किया गया' : 'Voice explanation submitted')
    });
  };

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
      aria-labelledby="wizard-step-heading"
    >
      {/* 1. Accessible Top Progress Bar (Step 1 of 3 Wizard) */}
      <div 
        className="mb-8 p-5 rounded-3xl border transition-all
          bg-slate-900/80 dark:bg-slate-900/80 light:bg-white
          border-slate-800 dark:border-slate-800 light:border-slate-200
          shadow-soft-out dark:shadow-soft-out light:shadow-soft-out-light"
        role="progressbar"
        aria-valuenow={33}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Assessment progress: Step 1 of 3"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/30">
              1
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {t.stepIndicator}
              </p>
              <h2 id="wizard-step-heading" className="text-lg sm:text-xl font-extrabold text-white dark:text-white light:text-slate-900">
                {t.step1Title}
              </h2>
            </div>
          </div>

          {/* Selected Trade Tag */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200 dark:text-slate-200 light:text-slate-700">
              {selectedTrade ? selectedTrade.title : 'General Trade'}
            </span>
          </div>
        </div>

        {/* Multi-step Track Bar with Dual Visual Indicators */}
        <div className="w-full h-3 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '33.33%' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full shadow-glow-blue"
          />
        </div>

        {/* Step Micro-Labels with Dual Checkmarks/States */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] sm:text-xs font-bold">
          <div className="flex items-center gap-1.5 text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">1. {t.step1Title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 light:text-slate-400">
            <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">2</div>
            <span className="truncate">2. {t.step2Title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 light:text-slate-400">
            <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">3</div>
            <span className="truncate">3. {t.step3Title}</span>
          </div>
        </div>
      </div>

      {/* Accessible Error Alert (Always paired with an 'X' icon + border) */}
      <AnimatePresence>
        {errorStatus && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-4 rounded-2xl flex items-center gap-3 border-2 border-rose-500/80 bg-rose-500/15 text-rose-200"
            role="alert"
          >
            <div className="p-2 rounded-xl bg-rose-500/30 text-rose-300">
              <XCircle className="w-6 h-6 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-100">{errorStatus}</p>
              <p className="text-xs text-rose-300">
                {lang === 'hi' ? 'नीचे कैमरा बटन दबाकर फ़ोटो जोड़ें।' : 'Tap the camera area below to provide visual proof.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Large Central Viewfinder Area (Placeholder for Camera) */}
      <div className="mb-8">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef} 
          onChange={handlePhotoUpload} 
          className="hidden" 
          id="camera-file-input"
          aria-label="Upload or take photo"
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={t.viewfinderTitle}
          className={`relative w-full min-h-[300px] sm:min-h-[360px] rounded-3xl border-3 border-dashed cursor-pointer overflow-hidden
            flex flex-col items-center justify-center p-6 text-center transition-all duration-300
            ${photoPreview 
              ? 'border-emerald-500 bg-slate-950/80 ring-4 ring-emerald-500/20 shadow-glow-green' 
              : 'border-blue-500/50 hover:border-blue-400 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100/90 hover:bg-slate-900/90 shadow-soft-out dark:shadow-soft-out light:shadow-soft-out-light'
            }
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500`}
        >
          {/* Viewfinder Target Reticle / Corner Crosshairs */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-3 border-l-3 border-blue-400 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-3 border-r-3 border-blue-400 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-3 border-l-3 border-blue-400 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-3 border-r-3 border-blue-400 rounded-br-lg pointer-events-none" />

          {photoPreview ? (
            /* Captured Photo View with Visual Success Badge */
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img 
                src={photoPreview} 
                alt="Captured trade work evidence preview" 
                className="max-h-[280px] sm:max-h-[320px] w-full object-cover rounded-2xl shadow-xl border border-emerald-500/40"
              />

              {/* Status Badge: Dual Indicator (Green Border + Checkmark Icon) */}
              <div className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full flex items-center gap-2
                bg-emerald-950/90 text-emerald-300 border-2 border-emerald-500 font-bold text-xs shadow-lg backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.photoCaptured}</span>
              </div>

              {/* Retake Button Overlay */}
              <div className="absolute bottom-3 right-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs
                    bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-700 shadow-lg active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <span>{t.retakePhoto}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Idle Viewfinder State */
            <div className="flex flex-col items-center justify-center space-y-4 max-w-md">
              {/* Massive Camera Action Icon Button */}
              <motion.div 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center
                  bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-glow-blue shadow-lg border border-blue-400/30"
              >
                <Camera className="w-10 h-10 sm:w-12 sm:h-12" />
              </motion.div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white dark:text-white light:text-slate-900 mb-1">
                  {t.viewfinderTitle}
                </h3>
                <p className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600">
                  {t.viewfinderSub}
                </p>
              </div>

              {/* Quick Sample Button for Instant Test */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSamplePhoto();
                }}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all
                  bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-amber-400/40 hover:border-amber-300 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Use Sample Trade Evidence Photo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Massive Pulsating Microphone Button: Multimodal Voice-First Action */}
      <div className="mb-10 flex flex-col items-center justify-center text-center">
        
        {/* Pulsing Primary Action Microphone */}
        <div className="relative flex items-center justify-center my-2">
          
          {/* Animated Ambient Ripple Waves when idle/recording */}
          <motion.div 
            animate={{
              scale: isRecording ? [1, 1.35, 1] : [1, 1.15, 1],
              opacity: isRecording ? [0.6, 0.1, 0.6] : [0.35, 0.05, 0.35]
            }}
            transition={{
              repeat: Infinity,
              duration: isRecording ? 1.4 : 2.5,
              ease: "easeInOut"
            }}
            className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full pointer-events-none ${
              isRecording ? 'bg-rose-500/30' : 'bg-blue-500/25'
            }`}
          />

          <motion.button
            type="button"
            onClick={handleToggleRecord}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className={`relative min-w-[88px] min-h-[88px] sm:min-w-[104px] sm:min-h-[104px] rounded-full
              flex items-center justify-center text-white transition-all duration-300 z-10
              border-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400
              ${isRecording 
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 border-rose-300 shadow-2xl shadow-rose-600/60 ring-8 ring-rose-500/30 animate-pulse' 
                : voiceRecorded
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 shadow-glow-green'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 border-blue-300 shadow-glow-mic hover:shadow-blue-500/70'
              }`}
            aria-label={isRecording ? "Stop recording speech" : t.micIdle}
            aria-pressed={isRecording}
          >
            {isRecording ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </motion.button>
        </div>

        {/* Dynamic Voice Status & Waveform Audio Equalizer */}
        <div className="mt-4 space-y-2 max-w-lg">
          <div className="flex items-center justify-center gap-2">
            {isRecording ? (
              <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-base sm:text-lg animate-pulse">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span>{t.micListening}</span>
              </div>
            ) : voiceRecorded ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.micDone}</span>
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-extrabold text-white dark:text-white light:text-slate-900">
                {t.micIdle}
              </span>
            )}
          </div>

          {/* Soundwave Equalizer Bars when Recording */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1.5 h-10 py-1" aria-hidden="true">
              {[40, 70, 100, 60, 90, 45, 80, 55, 95, 30].map((height, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [`${Math.max(12, height * 0.3)}px`, `${height * 0.4}px`, `${Math.max(12, height * 0.3)}px`] }}
                  transition={{ repeat: Infinity, duration: 0.8 + (i % 4) * 0.15, ease: "easeInOut" }}
                  className="w-1.5 rounded-full bg-rose-400"
                />
              ))}
            </div>
          )}

          {/* Voice Prompt Hint or Transcript Display */}
          {voiceRecorded ? (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-700/80 text-left"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Transcribed Audio Explanation
                </span>
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className="text-blue-400 hover:underline"
                >
                  Re-record
                </button>
              </div>
              <p className="text-sm font-medium text-slate-100 dark:text-slate-100 light:text-slate-800 italic">
                "{voiceText}"
              </p>
            </motion.div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-500">
              {t.micHint}
            </p>
          )}

        </div>
      </div>

      {/* 4. Bottom Navigation Buttons: "Back" & "Submit Evidence" (Min 44px-54px touch targets) */}
      <div className="pt-6 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Back Button with Left Arrow Icon */}
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all
            bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-300 dark:text-slate-300 light:text-slate-700
            border border-slate-800 dark:border-slate-800 light:border-slate-300
            shadow-soft-out dark:shadow-soft-out light:shadow-soft-out-light
            hover:border-slate-600 active:shadow-soft-in"
          aria-label={t.btnBack}
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
          <span>{t.btnBack}</span>
        </motion.button>

        {/* Primary Call-to-Action: Submit Evidence Button */}
        <motion.button
          type="button"
          onClick={handleFormSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
          className={`w-full sm:w-auto min-h-[54px] px-8 py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all duration-200
            shadow-lg border
            ${isSubmitting
              ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white border-blue-400/40 shadow-blue-600/35 hover:shadow-glow-blue'
            }`}
          aria-label={t.btnSubmit}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>{t.btnSubmitting}</span>
            </>
          ) : (
            <>
              <span>{t.btnSubmit}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </>
          )}
        </motion.button>

      </div>

    </motion.section>
  );
}
