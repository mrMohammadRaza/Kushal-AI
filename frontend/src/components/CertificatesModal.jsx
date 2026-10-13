import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  X, 
  Download, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Calendar, 
  UserCheck, 
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function CertificatesModal({ isOpen, onClose, lang }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl p-6 sm:p-8 text-white overflow-hidden"
        >
          {/* Close button with min 44px touch target */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center
              bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
            aria-label="Close certificate modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Government of India • Ministry of Skill Development
              </span>
              <h2 id="cert-modal-title" className="text-xl sm:text-2xl font-black">
                {lang === 'hi' ? 'मान्यता प्राप्त कौशल प्रमाण पत्र' : 'Skill India RPL Certificate'}
              </h2>
            </div>
          </div>

          {/* Certificate Card Preview */}
          <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 border-2 border-amber-500/40 shadow-inner">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  NSQF Level 4 Certified
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1 text-white">
                  Ramesh Kumar Verma
                </h3>
                <p className="text-xs text-slate-400">
                  Trade: Senior Electrician (घरेलू एवं औद्योगिक वायरिंग)
                </p>
              </div>

              {/* QR Code Placeholder with Real Visual */}
              <div className="p-2 bg-white rounded-xl shadow-md flex flex-col items-center">
                <QrCode className="w-14 h-14 text-slate-900" />
                <span className="text-[9px] font-bold text-slate-900 mt-0.5">VERIFIED</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-slate-400 block font-medium">Certificate No.</span>
                <span className="font-mono font-bold text-slate-100">KAI-RPL-2026-9041</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-slate-400 block font-medium">Score Achieved</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 92% (Grade A+)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block font-medium">Issued Date</span>
                <span className="font-bold text-slate-100 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Oct 2026
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              This certificate officially recognizes the prior experience and practical skills of the candidate under the National Skills Qualifications Framework (NSQF).
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified by Electronics Sector Skills Council of India (ESSCI)
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => alert("Certificate downloaded (PDF).")}
                className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
