import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Home, Trash2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      clearingCache: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[Kaushal AI UI Runtime Error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = async () => {
    this.setState({ clearingCache: true });
    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      // 2. Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      // 3. Clear non-essential localStorage
      localStorage.removeItem('kaushal_ai_active_candidate');
      localStorage.removeItem('kaushal_ai_auth_token');
      localStorage.removeItem('kaushal_ai_active_user');
    } catch (e) {
      console.warn('Error during reset:', e);
    }
    // 4. Force reload from server
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      const isHi = this.props.lang === 'hi';
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                Kaushal AI • National RPL Skill Assessment System
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {isHi ? 'एप्लिकेशन पुनः प्राप्ति स्क्रीन' : 'Application Recovery Screen'}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                {isHi 
                  ? 'एक अप्रत्याशित क्लाइंट त्रुटि का पता चला है। आपकी सहेजी गई मूल्यांकन प्रगति सुरक्षित है।' 
                  : 'An unexpected runtime issue occurred. Your saved assessment progress and cryptographic records remain safe.'}
              </p>
            </div>

            {/* Error detail box */}
            <div className="text-left bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-rose-300 max-h-36 overflow-auto">
              <div className="font-bold text-slate-300 mb-1">Diagnosed Error:</div>
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
              >
                <RefreshCw className="w-4 h-4" />
                {isHi ? 'पुनः लोड करें (Reload)' : 'Reload Application'}
              </button>

              <button
                type="button"
                onClick={this.handleHardReset}
                disabled={this.state.clearingCache}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                {this.state.clearingCache 
                  ? 'रीसेट हो रहा है...' 
                  : (isHi ? 'कैश साफ़ करें और रीसेट करें' : 'Clear Cache & Fresh Start')}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              National Council for Vocational Education and Training (NCVET) • NSQF Level 5 Aligned
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
