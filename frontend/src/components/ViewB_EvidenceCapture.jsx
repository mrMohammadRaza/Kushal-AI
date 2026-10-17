import React, { useState, useRef, useEffect } from 'react';
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
  Info,
  Play,
  Pause,
  UploadCloud,
  FileAudio,
  Edit3
} from 'lucide-react';

export default function ViewB_EvidenceCapture({
  lang = 'hi',
  t,
  selectedTrade,
  onBack,
  onSubmitEvidence,
  isSubmitting,
  onSpeakPrompt
}) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  
  // Real Audio Recording & File States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Setup Web Speech Recognition if available in browser
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setVoiceText(currentTranscript.trim());
        };

        recognition.onerror = (e) => {
          console.warn('[SpeechRecognition Notice]:', e.error);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition init error:', err);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [lang]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorStatus(null);
    }
  };

  const handleAudioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setVoiceRecorded(true);
      if (!voiceText) {
        setVoiceText(selectedTrade?.voicePrompt || "Candidate uploaded voice recording for trade viva demonstration.");
      }
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

  // Start Real Audio Recording with MediaRecorder
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('wav') ? '.wav' : '.webm';
        const file = new File([blob], `viva_audio_${Date.now()}${ext}`, { type: mimeType });
        
        setAudioBlob(blob);
        setAudioFile(file);
        setAudioUrl(URL.createObjectURL(blob));
        setVoiceRecorded(true);

        // Stop all tracks to release mic hardware
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      setErrorStatus(null);

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // Start SpeechRecognition in parallel if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Microphone permission or hardware error:', err);
      // Fallback: If microphone hardware unavailable, allow typing or audio upload
      setIsRecording(false);
      setErrorStatus(lang === 'hi' 
        ? 'माइक्रोफ़ोन उपलब्ध नहीं है। आप नीचे ऑडियो फ़ाइल अपलोड कर सकते हैं या अपना विवरण लिख सकते हैं।' 
        : 'Microphone access unavailable. You can upload an audio file or type your explanation below.');
    }
  };

  // Stop Real Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleFormSubmit = () => {
    if (!photoPreview && !photoFile) {
      setErrorStatus(lang === 'hi' ? 'कृपया पहले अपने काम की एक तस्वीर लें' : 'Please capture a photo of your work first');
      return;
    }
    onSubmitEvidence({
      trade: selectedTrade,
      photo: photoPreview,
      photoFile: photoFile,
      audioFile: audioFile,
      voiceText: voiceText || (lang === 'hi' ? 'मौखिक विवरण दर्ज किया गया' : 'Voice explanation submitted')
    });
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
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
      {/* 1. Accessible 3D Top Progress Bar */}
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
                {t.stepIndicator || 'Step 1 of 3'}
              </p>
              <h2 id="wizard-step-heading" className="text-xl sm:text-2xl font-black text-white">
                {t.step1Title || 'Submit Practical Evidence'}
              </h2>
            </div>
          </div>

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

        <div className="grid grid-cols-3 gap-2 text-[11px] sm:text-xs font-black">
          <div className="flex items-center gap-1.5 text-blue-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">1. Evidence Capture</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">2</div>
            <span className="truncate">2. AI Diagnosis</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-bold">3</div>
            <span className="truncate">3. Assessor Sign-Off</span>
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
          aria-label={t.viewfinderTitle || 'Camera Viewfinder'}
          className={`relative w-full min-h-[340px] sm:min-h-[380px] rounded-3xl border-2 border-dashed cursor-pointer overflow-hidden
            flex flex-col items-center justify-center p-6 text-center transition-all duration-300
            ${photoPreview 
              ? 'border-emerald-500 bg-slate-950 ring-4 ring-emerald-500/20 shadow-[0_0_35px_rgba(16,185,129,0.3)]' 
              : 'border-blue-500/40 hover:border-blue-400 bg-slate-950/80 hover:bg-slate-900/90 card-3d'
            }
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500`}
        >
          <div className="scanline-laser" />

          {/* Futuristic Target Reticles */}
          <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-xl pointer-events-none" />

          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-[10px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>PRACTICAL WORK EVIDENCE VIEWFINDER</span>
          </div>

          {photoPreview ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center pt-4">
              <img 
                src={photoPreview} 
                alt="Captured trade work evidence preview" 
                className="max-h-[280px] sm:max-h-[320px] w-full object-cover rounded-2xl shadow-2xl border border-emerald-500/50"
              />

              <div className="absolute top-8 left-3 px-3.5 py-1.5 rounded-full flex items-center gap-2
                bg-emerald-950/95 text-emerald-300 border-2 border-emerald-500 font-black text-xs shadow-xl backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{photoFile ? photoFile.name : 'Photo Evidence Attached'}</span>
              </div>

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
                  <span>Replace Photo</span>
                </button>
              </div>
            </div>
          ) : (
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
                  {t.viewfinderTitle || 'Tap to Capture Practical Work'}
                </h3>
                <p className="text-sm font-medium text-slate-300">
                  {t.viewfinderSub || 'Take a clear photograph of completed panel, wiring, joints, or tools.'}
                </p>
              </div>

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
                <span>1-Tap Use Demo Photo ({selectedTrade?.title || 'Evidence'})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Real Audio Recording Station */}
      <div className="card-3d p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
        
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block">
            Regional Viva Voce • Speech Evidence Ingestion
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {lang === 'hi' ? 'भाषा: हिंदी / हिंग्लिश' : 'Language: Hindi / Hinglish / English'}
          </span>
        </div>

        <div className="relative flex items-center justify-center my-3">
          <motion.div 
            animate={{
              scale: isRecording ? [1, 1.45, 1] : [1, 1.2, 1],
              opacity: isRecording ? [0.7, 0.1, 0.7] : [0.3, 0.05, 0.3]
            }}
            transition={{
              repeat: Infinity,
              duration: isRecording ? 1.2 : 2.5,
              ease: "easeInOut"
            }}
            className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full pointer-events-none ${
              isRecording ? 'bg-rose-500/40 blur-md' : 'bg-blue-500/20 blur-md'
            }`}
          />

          <motion.button
            type="button"
            onClick={handleToggleRecord}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className={`relative min-w-[96px] min-h-[96px] sm:min-w-[110px] sm:min-h-[110px] rounded-full
              flex items-center justify-center text-white transition-all duration-300 z-10
              border-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400
              ${isRecording 
                ? 'bg-gradient-to-tr from-rose-600 via-red-600 to-orange-500 border-rose-300 shadow-[0_0_40px_rgba(244,63,94,0.7)] ring-8 ring-rose-500/30' 
                : voiceRecorded
                  ? 'btn-3d-emerald bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                  : 'btn-3d bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 border-blue-300 shadow-[0_15px_35px_rgba(37,99,235,0.6)]'
              }`}
            aria-label={isRecording ? "Stop recording speech" : "Start recording viva explanation"}
            aria-pressed={isRecording}
          >
            {isRecording ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
            )}
          </motion.button>
        </div>

        {/* Dynamic Voice Status */}
        <div className="space-y-3 max-w-lg w-full">
          <div className="flex items-center justify-center gap-2">
            {isRecording ? (
              <div className="flex items-center gap-2 text-rose-400 font-black text-base sm:text-lg">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span>Recording Speech... ({formatTimer(recordingSeconds)})</span>
              </div>
            ) : voiceRecorded ? (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-black shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real Audio Recorded & Ready</span>
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-black text-white">
                Tap Mic to Record Oral Explanation
              </span>
            )}
          </div>

          {/* Soundwave Animation while recording */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1.5 h-10 py-1" aria-hidden="true">
              {[30, 60, 90, 50, 80, 40, 70, 50, 85, 30, 65, 40].map((height, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [`${Math.max(10, height * 0.25)}px`, `${height * 0.45}px`, `${Math.max(10, height * 0.25)}px`] }}
                  transition={{ repeat: Infinity, duration: 0.6 + (i % 4) * 0.12, ease: "easeInOut" }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 to-amber-300"
                />
              ))}
            </div>
          )}

          {/* Audio Player & Transcript Editor */}
          {voiceRecorded && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 text-left shadow-lg space-y-3"
            >
              {/* Playback preview */}
              {audioUrl && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <audio 
                    ref={audioPlayerRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={toggleAudioPlayback}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? 'Pause' : 'Play Recorded Audio'}</span>
                  </button>
                  <span className="text-xs text-slate-400 font-mono">
                    {audioFile ? `${Math.round(audioFile.size / 1024)} KB (${audioFile.type.split('/')[1]})` : 'Audio Ready'}
                  </span>
                </div>
              )}

              {/* Editable Transcription text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Edit3 className="w-3.5 h-3.5" /> Candidate Oral Transcript (Editable)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceRecorded(false);
                      setAudioUrl(null);
                      setAudioFile(null);
                    }}
                    className="text-blue-400 hover:underline text-xs"
                  >
                    Re-record
                  </button>
                </div>
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  placeholder="Review or correct your spoken explanation here..."
                />
              </div>
            </motion.div>
          )}

          {/* Alternative: Audio File Upload Option */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-400">
            <input
              type="file"
              accept="audio/*"
              ref={audioInputRef}
              onChange={handleAudioFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="text-slate-400 hover:text-blue-400 underline flex items-center gap-1"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Or upload audio file (.wav, .mp3, .webm)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Navigation Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all
            bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 active:scale-95 shadow-md"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
          <span>{t.btnBack || 'Back to Trades'}</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={handleFormSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
          className={`btn-3d-emerald w-full sm:w-auto min-h-[54px] px-8 py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all duration-200 border
            ${isSubmitting
              ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white border-emerald-400/40 shadow-emerald-600/35'
            }`}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
              <span>{t.btnSubmitting || 'Analyzing Evidence...'}</span>
            </>
          ) : (
            <>
              <span>{t.btnSubmit || 'Submit for Assessment'}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </>
          )}
        </motion.button>
      </div>
    </motion.section>
  );
}
