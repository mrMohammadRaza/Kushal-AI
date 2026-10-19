import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Upload, 
  Video, 
  Eye, 
  Info 
} from 'lucide-react';

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = "Candidate Identity & Evidence Photo",
  purpose = "Required for identity verification and authentic skill evidence capture per NSQF RPL assessment standards.",
  lang = 'en'
}) {
  const isHi = lang === 'hi';

  const [streamActive, setStreamActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileFallbackRef = useRef(null);

  // Stop all camera tracks on unmount or close
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[Camera] Track stop error:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhotoPreview(null);
      setPhotoBlob(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Request browser camera stream
  const startCamera = async () => {
    setErrorMessage(null);

    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setErrorMessage(
        isHi
          ? 'कैमरा एक्सेस के लिए सुरक्षित HTTPS कनेक्शन की आवश्यकता है।'
          : 'Camera access requires a secure origin (HTTPS or localhost).'
      );
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        isHi
          ? 'यह ब्राउज़र कैमरा एक्सेस का समर्थन नहीं करता है। कृपया फ़ाइल अपलोड का उपयोग करें।'
          : 'Your browser does not support getUserMedia camera access. Please use file upload.'
      );
      return;
    }

    setCameraLoading(true);

    try {
      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('[Video Play]:', e));
      }

      setStreamActive(true);
      setCameraLoading(false);
    } catch (err) {
      setCameraLoading(false);
      setStreamActive(false);
      console.error('[Camera Access Error]:', err);

      let msg = isHi ? 'कैमरा खोलने में त्रुटि हुई।' : 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = isHi 
          ? 'कैमरा अनुमति अस्वीकृत कर दी गई। कृपया ब्राउज़र एड्रेस बार में कैमरा अनुमति दें।' 
          : 'Camera permission was denied. Please allow camera access in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = isHi 
          ? 'इस डिवाइस पर कोई कैमरा नहीं मिला। कृपया फ़ोटो अपलोड करें।' 
          : 'No camera hardware found on this device. Please upload a photo instead.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = isHi 
          ? 'कैमरा किसी अन्य एप्लिकेशन द्वारा उपयोग में है।' 
          : 'Camera is currently in use by another application or tab.';
      }

      setErrorMessage(msg);
    }
  };

  // Capture frame to canvas
  const captureFrame = () => {
    if (!videoRef.current || !streamActive) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setPhotoBlob(blob);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPhotoPreview(dataUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = () => {
    setPhotoPreview(null);
    setPhotoBlob(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (photoBlob && onCapture) {
      onCapture(photoBlob, photoPreview);
      onClose();
    }
  };

  const handleFallbackFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoBlob(file);
      setPhotoPreview(url);
      setErrorMessage(null);
      stopCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 text-slate-100 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
                {isHi ? 'प्रमाणित फोटो कैप्चर' : 'Live Camera Verification'}
              </span>
              <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Purpose & Consent Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p><span className="font-semibold text-slate-200">{isHi ? 'उद्देश्य:' : 'Purpose:'}</span> {purpose}</p>
          </div>
          <label className="flex items-center gap-2 pt-1 border-t border-slate-800/80 cursor-pointer text-slate-200">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[11px]">
              {isHi 
                ? 'मैं कौशल सत्यापन के लिए अपनी तस्वीर कैप्चर करने और मूल्यांकनकर्ता समीक्षा हेतु सुरक्षित रूप से संग्रहीत करने की सहमति देता/देती हूँ।'
                : 'I consent to capturing my photograph for RPL skill verification and secure review by authorized assessors.'}
            </span>
          </label>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-200">{isHi ? 'कैमरा समस्या:' : 'Camera Notice:'}</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Video / Preview Viewport */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          {photoPreview ? (
            <div className="relative w-full h-full">
              <img src={photoPreview} alt="Captured preview" className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isHi ? 'फ़ोटो तैयार (समीक्षा लंबित)' : 'Captured (Pending Review)'}
              </div>
            </div>
          ) : streamActive ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE STREAM ACTIVE
              </div>
            </div>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  {isHi ? 'कैमरा अभी बंद है' : 'Camera is currently inactive'}
                </p>
                <p className="text-xs text-slate-500">
                  {isHi ? 'कैमरा शुरू करने के लिए सहमति दें और नीचे बटन दबाएं' : 'Check consent and click Start Camera to begin preview'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!photoPreview && !streamActive && (
              <button
                type="button"
                onClick={startCamera}
                disabled={!consentGiven || cameraLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
              >
                {cameraLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {isHi ? 'कैमरा शुरू हो रहा है...' : 'Requesting Access...'}
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    {isHi ? 'कैमरा शुरू करें' : 'Start Camera'}
                  </>
                )}
              </button>
            )}

            {streamActive && !photoPreview && (
              <button
                type="button"
                onClick={captureFrame}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                {isHi ? 'तस्वीर खींचें (Capture)' : 'Capture Photo'}
              </button>
            )}

            {photoPreview && (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isHi ? 'दोबारा लें (Retake)' : 'Retake'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isHi ? 'पुष्टि करें (Confirm)' : 'Confirm Photo'}
                </button>
              </>
            )}
          </div>

          {/* Alternative File Upload Fallback */}
          <div>
            <input
              type="file"
              ref={fileFallbackRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFallbackFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileFallbackRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <Upload className="w-3 h-3" />
              {isHi ? 'फ़ाइल से चुनें' : 'Upload File Instead'}
            </button>
          </div>
        </div>

        {/* Honest Labeling Footer */}
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{isHi ? 'स्थिति: मैन्युअल समीक्षा आवश्यक' : 'Status: Manual Review / Assessor Verification Required'}</span>
          <span>🔒 {isHi ? 'सुरक्षित स्टोरेज' : 'Encrypted Assessment Storage'}</span>
        </div>
      </motion.div>
    </div>
  );
}
