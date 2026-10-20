import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Lock, 
  Mail, 
  Briefcase, 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Languages, 
  Building2, 
  AlertCircle,
  HelpCircle,
  User,
  Zap
} from 'lucide-react';
import { loginUser, registerUser, saveCandidateSession } from '../utils/supabaseClient';

const PRELOADED_CANDIDATES = [
  {
    id: "cand-demo-sih",
    name: "Priya Sharma (SIH Demo)",
    email: "demo@kushalai.local",
    password: "KushalDemo@2026!",
    tradeId: "web-developer-l5",
    tradeTitle: "Web Developer (NSQF Level 5)",
    experienceYears: "4",
    employmentType: "Freelance Frontend Web & UI Developer",
    workLocation: "Varanasi, Uttar Pradesh",
    companyName: "Sharma Tech Solutions",
    primaryLanguage: "en",
    assistanceNeed: "Standard",
    role: "candidate",
    isSihDemo: true
  },
  {
    id: "cand-demo-electrician",
    name: "Ramesh Kumar Sharma",
    email: "electrician.demo@kushalai.local",
    password: "Kaushal@2026",
    tradeId: "electrician-l3",
    tradeTitle: "Assistant Electrician (Level 3)",
    experienceYears: "6",
    employmentType: "Domestic & Commercial Electrician",
    workLocation: "Varanasi, Uttar Pradesh",
    companyName: "Sharma Electrical Works",
    primaryLanguage: "hi",
    assistanceNeed: "Audio Voice Guidance",
    role: "candidate"
  },
  {
    id: "cand-demo-mechanic",
    name: "Mohammad Aslam Ansari",
    email: "mechanic.demo@kushalai.local",
    password: "Kaushal@2026",
    tradeId: "automotive-l4",
    tradeTitle: "Automotive Diagnostic Technician (Level 4)",
    experienceYears: "8",
    employmentType: "Automotive Service Technician",
    workLocation: "Patna, Bihar",
    companyName: "Patna Auto Service Center",
    primaryLanguage: "hi",
    assistanceNeed: "None",
    role: "candidate"
  },
  {
    id: "cand-demo-solar",
    name: "Amit Patel",
    email: "solar.demo@kushalai.local",
    password: "Kaushal@2026",
    tradeId: "solar-l4",
    tradeTitle: "Solar PV System Installer (Level 4)",
    experienceYears: "5",
    employmentType: "Rooftop Solar PV Specialist",
    workLocation: "Ahmedabad, Gujarat",
    companyName: "Gujarat Solar Power",
    primaryLanguage: "en",
    assistanceNeed: "Standard",
    role: "candidate"
  },
  {
    id: "user-assessor-01",
    name: "Rajesh Varma (Lead Assessor)",
    email: "assessor@kaushal.gov.in",
    password: "Kaushal@2026",
    tradeId: "assessor",
    tradeTitle: "Certified Assessor (NCVET Verified)",
    experienceYears: "10",
    employmentType: "Lead Assessor & Evaluator",
    workLocation: "New Delhi, National Capital",
    companyName: "National Skill Assessment Council",
    primaryLanguage: "en",
    assistanceNeed: "None",
    role: "assessor"
  },
  {
    id: "user-admin-01",
    name: "Dr. Sunita Rao (Director NCVET)",
    email: "admin@kaushal.gov.in",
    password: "Kaushal@2026",
    tradeId: "admin",
    tradeTitle: "Platform Administrator & NCVET Director",
    experienceYears: "15",
    employmentType: "Platform Administrator",
    workLocation: "New Delhi, HQ",
    companyName: "NCVET / MSDE",
    primaryLanguage: "en",
    assistanceNeed: "None",
    role: "admin"
  }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess, lang = 'hi' }) {
  const isHi = lang === 'hi';
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'quick'
  
  // Auth Form State
  const [email, setEmail] = useState('demo@kushalai.local');
  const [password, setPassword] = useState('KushalDemo@2026!');
  
  // Job & Test Profile Form State
  const [fullName, setFullName] = useState('Priya Sharma');
  const [tradeId, setTradeId] = useState('web-developer-l5');
  const [experienceYears, setExperienceYears] = useState('4');
  const [employmentType, setEmploymentType] = useState('Freelance Frontend Web & UI Developer');
  const [workLocation, setWorkLocation] = useState('Varanasi, UP');
  const [companyName, setCompanyName] = useState('Sharma Tech Solutions');
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [assistanceNeed, setAssistanceNeed] = useState('Standard');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSelectQuickCandidate = (candidate) => {
    setFullName(candidate.name);
    setEmail(candidate.email);
    setPassword(candidate.password || 'Kaushal@2026');
    setTradeId(candidate.tradeId);
    setExperienceYears(candidate.experienceYears);
    setEmploymentType(candidate.employmentType);
    setWorkLocation(candidate.workLocation);
    setCompanyName(candidate.companyName);
    setPrimaryLanguage(candidate.primaryLanguage);
    setAssistanceNeed(candidate.assistanceNeed);
    setTab('login');
  };

  const handleDirectLogin = async (cand) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cand.email, password: cand.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Direct authentication failed.');

      if (data.token) localStorage.setItem('kaushal_ai_auth_token', data.token);
      if (data.user) localStorage.setItem('kaushal_ai_active_user', JSON.stringify(data.user));

      if (data.candidateProfile) {
        const candidateRecord = {
          id: data.candidateProfile.id,
          fullName: data.candidateProfile.full_name,
          email: data.user?.email || data.candidateProfile.email || cand.email,
          tradeId: data.candidateProfile.trade_id,
          tradeName: data.candidateProfile.trade_id === 'web-developer-l5'
            ? 'Web Developer (NSQF Level 5)'
            : (data.candidateProfile.current_occupation || cand.tradeTitle),
          experienceYears: String(data.candidateProfile.informal_experience_years || cand.experienceYears || '3'),
          workLocation: `${data.candidateProfile.district || ''}, ${data.candidateProfile.state || ''}`.replace(/^, /, '') || cand.workLocation,
          primaryLanguage: data.candidateProfile.primary_language || cand.primaryLanguage || 'en',
          role: data.user?.role || 'candidate'
        };
        localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(candidateRecord));
      } else {
        const candidateRecord = {
          id: data.user?.id || 'cand-session',
          fullName: data.user?.full_name || cand.name,
          email: cand.email,
          tradeId: cand.tradeId,
          tradeName: cand.tradeTitle,
          role: data.user?.role || cand.role || 'assessor'
        };
        localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(candidateRecord));
      }

      setLoading(false);
      onLoginSuccess(data);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Direct login failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      setLoading(false);
      setErrorMsg(isHi ? 'कृपया ईमेल दर्ज करें।' : 'Please enter your email.');
      return;
    }

    if (!password) {
      setLoading(false);
      setErrorMsg(isHi ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    if (tab === 'register') {
      if (!fullName || fullName.trim().length < 2) {
        setLoading(false);
        setErrorMsg(isHi ? 'कृपया पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।' : 'Full legal name must be at least 2 characters.');
        return;
      }
      if (password.length < 8) {
        setLoading(false);
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
    }

    const jobDetails = {
      fullName: fullName.trim() || 'Candidate',
      email: cleanEmail,
      tradeId,
      tradeName: tradeId.includes('electrician') ? 'Electrician' : (tradeId.includes('solar') ? 'Solar Installer' : (tradeId.includes('automotive') ? 'Mechanic' : (tradeId.includes('web-developer') ? 'Web Developer (NSQF Level 5)' : 'Plumber'))),
      experienceYears,
      employmentType,
      workLocation,
      companyName,
      primaryLanguage,
      assistanceNeed
    };

    try {
      const authEndpoint = tab === 'register' ? '/api/auth/register' : '/api/auth/login';
      const authPayload = tab === 'register' ? {
        email: cleanEmail,
        password,
        fullName: jobDetails.fullName,
        tradeId: jobDetails.tradeId,
        experienceYears: Number(jobDetails.experienceYears) || 3,
        employmentType: jobDetails.employmentType,
        workLocation: jobDetails.workLocation,
        primaryLanguage: jobDetails.primaryLanguage
      } : {
        email: cleanEmail,
        password
      };

      const authRes = await fetch(authEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload)
      });

      const authData = await authRes.json();

      if (!authRes.ok) {
        throw new Error(authData.error || (tab === 'register' ? 'Registration failed.' : 'Invalid email or password.'));
      }

      if (authData.token) {
        localStorage.setItem('kaushal_ai_auth_token', authData.token);
      }
      if (authData.user) {
        localStorage.setItem('kaushal_ai_active_user', JSON.stringify(authData.user));
      }

      if (authData.candidateProfile) {
        jobDetails.id = authData.candidateProfile.id;
        const candidateRecord = {
          id: authData.candidateProfile.id,
          fullName: authData.candidateProfile.full_name,
          email: authData.user?.email || authData.candidateProfile.email || cleanEmail,
          tradeId: authData.candidateProfile.trade_id,
          tradeName: authData.candidateProfile.trade_id === 'web-developer-l5' 
            ? 'Web Developer (NSQF Level 5)' 
            : (authData.candidateProfile.current_occupation || jobDetails.tradeName),
          experienceYears: String(authData.candidateProfile.informal_experience_years || jobDetails.experienceYears),
          workLocation: `${authData.candidateProfile.district || ''}, ${authData.candidateProfile.state || ''}`.replace(/^, /, '') || jobDetails.workLocation,
          primaryLanguage: authData.candidateProfile.primary_language || jobDetails.primaryLanguage,
          role: authData.user?.role || 'candidate'
        };
        localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(candidateRecord));
      } else {
        const candidateRecord = {
          ...jobDetails,
          id: authData.user?.id || 'cand-session',
          role: authData.user?.role || 'candidate'
        };
        localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(candidateRecord));
      }

      setLoading(false);
      onLoginSuccess(authData);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative w-full max-w-2xl my-6 rounded-3xl border border-white/10 card-3d shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border border-blue-400/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Supabase Auth Connected
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SIH26242 Portal
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
                {isHi ? 'उम्मीदवार लॉगिन और कार्य विवरण' : 'Candidate Login & Job Verification'}
              </h2>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 bg-slate-950/80 gap-4 text-xs font-black">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'login' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isHi ? 'लॉगिन करें' : 'Candidate Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('register')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'register' 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isHi ? 'नया पंजीकरण' : 'Register New RPL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('quick')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'quick' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isHi ? 'त्वरित डेमो उम्मीदवार' : 'Quick Demo Profiles'}</span>
          </button>
        </div>

        {/* Tab: Quick Preloaded Profiles */}
        {tab === 'quick' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-300">
              {isHi 
                ? 'आरक्षण / परीक्षण के लिए वास्तविक एनएसक्यूएफ स्तर वाले पूर्व-निर्मित उम्मीदवार प्रोफाइल चुनें:' 
                : 'Select a preloaded informal worker profile mapped to official NSQF Qualification Packs:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRELOADED_CANDIDATES.map((cand) => (
                <div
                  key={cand.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 group ${
                    cand.isSihDemo
                      ? 'border-amber-400 bg-gradient-to-r from-amber-950/40 via-slate-950 to-blue-950/40 shadow-lg shadow-amber-950/30'
                      : 'border-slate-800 bg-slate-950/80 hover:border-blue-500/60'
                  }`}
                >
                  {cand.isSihDemo && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>★ SIH Official Video Demo Account</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs ${
                      cand.isSihDemo ? 'text-amber-200 font-extrabold' : 'text-white'
                    }`}>
                      {cand.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      cand.isSihDemo ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {cand.experienceYears} Yrs Exp
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {cand.tradeTitle}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>{cand.workLocation}</span>
                    <span className="text-emerald-400 font-semibold">{cand.employmentType.slice(0, 24)}...</span>
                  </div>
                  
                  {/* Direct 1-Click Login Button */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDirectLogin(cand)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{loading ? 'Authenticating...' : '⚡ 1-Click Direct Login'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectQuickCandidate(cand)}
                      title="Edit or Inspect Details"
                      className="p-1.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Login / Registration Form */}
        {(tab === 'login' || tab === 'register') && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 1-Click Direct Demo Logins Grid */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-200">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? '⚡ त्वरित 1-क्लिक डायरेक्ट लॉगिन:' : '⚡ 1-Click Direct Demo Logins:'}</span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  SIH Video Ready
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {PRELOADED_CANDIDATES.map((cand) => (
                  <button
                    key={cand.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDirectLogin(cand)}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      cand.isSihDemo
                        ? 'bg-amber-950/40 border-amber-500/60 hover:border-amber-400 text-amber-200 shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-blue-500/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-black truncate">{cand.name.split(' ')[0]}</span>
                      {cand.isSihDemo && <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
                    </div>
                    <span className="text-[9px] text-slate-400 truncate mt-0.5">
                      {cand.tradeTitle.split('(')[0].trim()}
                    </span>
                    <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5 mt-1">
                      <Zap className="w-2.5 h-2.5" /> 1-Click Login
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Credentials Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isHi ? 'पूरा नाम (आधार कार्ड के अनुसार)' : 'Full Name (As per Aadhaar)'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isHi ? 'ईमेल पता या फोन नंबर' : 'Email Address or Phone'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh.sharma@skillindia.rpl"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Password Row */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isHi ? 'पासवर्ड' : 'Security Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Section Divider: Confirm Job & Test Details */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  {isHi ? 'परीक्षण हेतु कार्य विवरण की पुष्टि करें' : 'Confirm & Add Job Details for Assessment'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trade Selected */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {isHi ? 'व्यवसाय / ट्रेड (NSQF Pack)' : 'Trade for RPL Assessment'}
                  </label>
                  <select
                    value={tradeId}
                    onChange={(e) => setTradeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="web-developer-l5">Web Developer (NSQF Level 5 - SSC/Q0501) [First Supported]</option>
                    <option value="electrician-l3">Assistant Electrician (NSQF Level 3 - ELE/Q3102)</option>
                    <option value="electrician-l4">Industrial Electrician (NSQF Level 4 - ELE/Q6301)</option>
                    <option value="solar-l4">Rooftop Solar PV Installer (Level 4 - SGJ/Q0101)</option>
                    <option value="automotive-l4">Automotive Mechanic (Level 4 - ASC/Q1411)</option>
                    <option value="plumbing-l3">General Plumber (Level 3 - PSC/Q0104)</option>
                    <option value="apparel-l4">Self Employed Tailor (Level 4 - AMH/Q1947)</option>
                  </select>
                </div>

                {/* Years of Informal Experience */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {isHi ? 'अनौपचारिक कार्य अनुभव (वर्ष)' : 'Informal Work Experience (Years)'}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="2">2 - 3 Years Practical Experience</option>
                      <option value="5">5 - 7 Years Practical Experience</option>
                      <option value="8">8 - 10 Years Practical Experience</option>
                      <option value="12">10+ Years Master Craftsman Experience</option>
                    </select>
                  </div>
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {isHi ? 'वर्तमान रोजगार का प्रकार' : 'Current Employment Type'}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      placeholder="e.g. Self-Employed / Independent Worker"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Work Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {isHi ? 'कार्य स्थल / शहर' : 'Work Location / City'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      placeholder="e.g. Varanasi, Uttar Pradesh"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Assistive / Accessibility Accommodations */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isHi ? 'मौखिक परीक्षा हेतु भाषा' : 'Viva Voce Language / Dialect:'}
                  </span>
                  <select
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="hi">हिंदी (Hindi / Hinglish Vernacular)</option>
                    <option value="en">English (Indian Standards IS/BIS)</option>
                    <option value="mr">मराठी (Marathi Regional)</option>
                    <option value="bn">বাংলা (Bengali Regional)</option>
                    <option value="ta">தமிழ் (Tamil Regional)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isHi ? 'सुलभता / विशेष सहायता' : 'Accessibility Accommodation:'}
                  </span>
                  <select
                    value={assistanceNeed}
                    onChange={(e) => setAssistanceNeed(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="None">None (Standard Accessibility)</option>
                    <option value="Audio Voice Guidance">Audio Voice Guidance (Screen Reader)</option>
                    <option value="High Contrast Text">High Contrast & Large Font</option>
                    <option value="Slow Pace">Extended Time & Slow Pace</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                {isHi 
                  ? 'लॉगिन के बाद हार्डवेयर और सुलभता (Accessibility) जांच शुरू होगी।' 
                  : 'Hardware & Accessibility diagnostics will initiate next.'}
              </span>

              <button
                type="submit"
                disabled={loading}
                className="btn-3d min-h-[46px] px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Verifying with Supabase...' : (isHi ? 'विवरण की पुष्टि करें और आगे बढ़ें' : 'Confirm & Proceed to Test')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </motion.div>
    </div>
  );
}
