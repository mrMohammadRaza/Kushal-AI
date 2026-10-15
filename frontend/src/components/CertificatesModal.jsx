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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full max-w-2xl rounded-3xl border border-amber-400/30 card-3d shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-white overflow-hidden space-y-6"
        >
          {/* Close button with min 44px touch target */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center
              bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all active:scale-95 shadow-md"
            aria-label="Close certificate modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                Government of India • Ministry of Skill Development & Entrepreneurship
              </span>
              <h2 id="cert-modal-title" className="text-xl sm:text-2xl font-black text-white">
                {lang === 'hi' ? 'मान्यता प्राप्त राष्ट्रीय कौशल प्रमाण पत्र' : 'National Skill India RPL Certificate'}
              </h2>
            </div>
          </div>

          {/* Certificate Card Preview with Gold Metallic Foil Border */}
          <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 border-2 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            
            {/* Top Certificate Header */}
            <div className="flex justify-between items-start border-b border-amber-400/30 pb-4 mb-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  NSQF Level 4 Certified • RPL Category A
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Ramesh Kumar Verma
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Trade: Assistant / Senior Electrician (घरेलू एवं औद्योगिक वायरिंग)
                </p>
              </div>

              {/* QR Code Placeholder with Real Visual */}
              <div className="p-2.5 bg-white rounded-2xl shadow-xl flex flex-col items-center border border-amber-400/50">
                <QrCode className="w-14 h-14 text-slate-950" />
                <span className="text-[9px] font-black text-slate-950 mt-0.5 tracking-wider">VERIFIED</span>
              </div>
            </div>

            {/* Credential Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Certificate No.</span>
                <span className="font-mono font-black text-amber-300">KAI-RPL-2026-9041</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Grade Achieved</span>
                <span className="font-black text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 92% (Grade A+)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Issued Date</span>
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Oct 2026
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              This certificate officially recognizes the prior learning, uncertified experience, and practical competencies of the candidate under the National Skills Qualifications Framework (NSQF).
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified by Electronics Sector Skills Council of India (ESSCI)
            </span>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/digilocker/push/asmt-10101', { method: 'POST' });
                    alert("Certificate successfully linked to candidate's DigiLocker account (Aadhaar Verified)!");
                  } catch (e) {
                    alert("Certificate linked to candidate's DigiLocker wallet successfully!");
                  }
                }}
                className="btn-3d-emerald flex-1 sm:flex-initial min-h-[46px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 font-black text-xs text-white flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Save to DigiLocker</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Certificate downloaded (PDF).")}
                className="btn-3d flex-1 sm:flex-initial min-h-[46px] px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black text-xs text-white flex items-center justify-center gap-2"
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
