import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Mic, 
  MicOff, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Check, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Sliders,
  Volume2,
  FileCheck2,
  Zap,
  Info
} from 'lucide-react';

export default function ViewB_EvidenceCapture({
  lang,
  t,
  selectedTrade,
  onBack,
  onSubmitEvidence,
  isSubmitting,
  onSpeakPrompt
}) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [errorStatus, setErrorStatus] = useState(null);

  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorStatus(null);
    }
  };

  const handleLoadSamplePhoto = () => {
    if (selectedTrade?.sampleEvidence) {
      setPhotoFile(null);
      setPhotoPreview(selectedTrade.sampleEvidence);
      setErrorStatus(null);
    }
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
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
      photoFile: photoFile,
      voiceText: voiceText || (lang === 'hi' ? 'मौखिक विवरण दर्ज किया गया' : 'Voice explanation submitted')
    });
  };

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8"
      aria-labelledby="wizard-step-heading"
    >
      {/* 1. Accessible 3D Top Progress Bar (Step 1 of 3) */}
      <div 
        className="card-3d p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4"
        role="progressbar"
        aria-valuenow={33}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Assessment progress: Step 1 of 3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-blue-500/40 border border-blue-400/40">
              1
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-blue-400">
                {t.stepIndicator}
              </p>
              <h2 id="wizard-step-heading" className="text-xl sm:text-2xl font-black text-white">
                {t.step1Title}
              </h2>
            </div>
          </div>

          {/* Selected Trade Tag with 3D Glow */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-blue-500/30 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200">
              {selectedTrade ? selectedTrade.title : 'General Trade'}
            </span>
          </div>
        </div>

        {/* Step Progress Track */}
        <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '33.33%' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
          />
        </div>

        {/* Micro-Labels */}
        <div className="grid grid-cols-3 gap-2 text-[11px] sm:text-xs font-black">
          <div className="flex items-center gap-1.5 text-blue-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">1. {t.step1Title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">2</div>
            <span className="truncate">2. {t.step2Title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">3</div>
            <span className="truncate">3. {t.step3Title}</span>
          </div>
        </div>
      </div>

      {/* Accessible Error Alert */}
      <AnimatePresence>
        {errorStatus && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl flex items-center gap-3 border-2 border-rose-500/80 bg-rose-500/15 text-rose-200 shadow-xl"
            role="alert"
          >
            <div className="p-2 rounded-xl bg-rose-500/30 text-rose-300">
              <XCircle className="w-6 h-6 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-100">{errorStatus}</p>
              <p className="text-xs text-rose-300">
                {lang === 'hi' ? 'नीचे कैमरा बॉक्स दबाकर या सैंपल बटन से फ़ोटो जोड़ें।' : 'Tap the camera area below or use the sample button to provide visual proof.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Central 3D Camera Viewfinder Area */}
      <div className="space-y-2">
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
          tabIndex={0}
          role="button"
          aria-label={t.viewfinderTitle}
          className={`relative w-full min-h-[340px] sm:min-h-[400px] rounded-3xl border-2 border-dashed cursor-pointer overflow-hidden
            flex flex-col items-center justify-center p-6 text-center transition-all duration-300
            ${photoPreview 
              ? 'border-emerald-500 bg-slate-950 ring-4 ring-emerald-500/20 shadow-[0_0_35px_rgba(16,185,129,0.3)]' 
              : 'border-blue-500/40 hover:border-blue-400 bg-slate-950/80 hover:bg-slate-900/90 card-3d'
            }
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500`}
        >
          {/* Animated 3D Laser Scanline */}
          <div className="scanline-laser" />

          {/* Futuristic Target Reticles */}
          <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-xl pointer-events-none" />

          {/* HUD Status Header */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-[10px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>AI VISION SENSOR: 1080P • NSQF CALIBRATION READY</span>
          </div>

          {photoPreview ? (
            /* Uploaded Preview View */
            <div className="relative w-full h-full flex flex-col items-center justify-center pt-4">
              <img 
                src={photoPreview} 
                alt="Captured trade work evidence preview" 
                className="max-h-[300px] sm:max-h-[340px] w-full object-cover rounded-2xl shadow-2xl border border-emerald-500/50"
              />

              {/* Status Badge: Dual Indicator (Green Border + Checkmark Icon) */}
              <div className="absolute top-8 left-3 px-3.5 py-1.5 rounded-full flex items-center gap-2
                bg-emerald-950/95 text-emerald-300 border-2 border-emerald-500 font-black text-xs shadow-xl backdrop-blur-md">
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
                  className="btn-3d min-h-[44px] px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs
                    bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-700 shadow-xl"
                >
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <span>{t.retakePhoto}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Idle Viewfinder State */
            <div className="flex flex-col items-center justify-center space-y-4 max-w-md pt-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center
                  bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.6)] border border-blue-300/40"
              >
                <Camera className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
              </motion.div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                  {t.viewfinderTitle}
                </h3>
                <p className="text-sm font-medium text-slate-300">
                  {t.viewfinderSub}
                </p>
              </div>

              {/* 1-Tap Sample Trade Evidence Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSamplePhoto();
                }}
                className="btn-3d-amber min-h-[44px] px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 transition-all
                  bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border border-amber-300/40"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>1-Tap Use Sample Photo ({selectedTrade?.title || 'Evidence'})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Massive 3D Pulsating Microphone Button */}
      <div className="card-3d p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
        
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
          Vernacular Viva Voce • Regional Audio Evaluation
        </span>

        <div className="relative flex items-center justify-center my-3">
          
          {/* Animated 3D Concentric Ripple Rings */}
          <motion.div 
            animate={{
              scale: isRecording ? [1, 1.45, 1] : [1, 1.25, 1],
              opacity: isRecording ? [0.7, 0.1, 0.7] : [0.4, 0.05, 0.4]
            }}
            transition={{
              repeat: Infinity,
              duration: isRecording ? 1.3 : 2.6,
              ease: "easeInOut"
            }}
            className={`absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full pointer-events-none ${
              isRecording ? 'bg-rose-500/35 blur-md' : 'bg-blue-500/25 blur-md'
            }`}
          />

          <motion.button
            type="button"
            onClick={handleToggleRecord}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className={`relative min-w-[96px] min-h-[96px] sm:min-w-[114px] sm:min-h-[114px] rounded-full
              flex items-center justify-center text-white transition-all duration-300 z-10
              border-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400
              ${isRecording 
                ? 'bg-gradient-to-tr from-rose-600 via-red-600 to-orange-500 border-rose-300 shadow-[0_0_40px_rgba(244,63,94,0.7)] ring-8 ring-rose-500/30 animate-pulse' 
                : voiceRecorded
                  ? 'btn-3d-emerald bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                  : 'btn-3d bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 border-blue-300 shadow-[0_15px_35px_rgba(37,99,235,0.6)]'
              }`}
            aria-label={isRecording ? "Stop recording speech" : t.micIdle}
            aria-pressed={isRecording}
          >
            {isRecording ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
            )}
          </motion.button>
        </div>

        {/* Dynamic Voice Status */}
        <div className="space-y-3 max-w-lg w-full">
          <div className="flex items-center justify-center gap-2">
            {isRecording ? (
              <div className="flex items-center gap-2 text-rose-400 font-black text-base sm:text-lg animate-pulse">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span>{t.micListening}</span>
              </div>
            ) : voiceRecorded ? (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-black shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.micDone}</span>
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-black text-white">
                {t.micIdle}
              </span>
            )}
          </div>

          {/* 3D Soundwave Equalizer when Recording */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1.5 h-12 py-1" aria-hidden="true">
              {[35, 65, 95, 55, 85, 40, 75, 50, 90, 30, 70, 45].map((height, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [`${Math.max(12, height * 0.3)}px`, `${height * 0.48}px`, `${Math.max(12, height * 0.3)}px`] }}
                  transition={{ repeat: Infinity, duration: 0.65 + (i % 4) * 0.15, ease: "easeInOut" }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-amber-300"
                />
              ))}
            </div>
          )}

          {voiceRecorded ? (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 text-left shadow-lg space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Transcribed Audio Explanation
                </span>
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className="text-blue-400 hover:underline font-bold"
                >
                  Re-record
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-100 italic leading-relaxed">
                "{voiceText}"
              </p>
            </motion.div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {t.micHint}
            </p>
          )}
        </div>
      </div>

      {/* 4. Bottom Navigation Buttons: "Back" & "Submit Evidence" */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all
            bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 active:scale-95 shadow-md"
          aria-label={t.btnBack}
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
          <span>{t.btnBack}</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={handleFormSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
          className={`btn-3d-emerald w-full sm:w-auto min-h-[54px] px-8 py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all duration-200
            border
            ${isSubmitting
              ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white border-emerald-400/40 shadow-emerald-600/35'
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
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </>
          )}
        </motion.button>
      </div>
    </motion.section>
  );
}
