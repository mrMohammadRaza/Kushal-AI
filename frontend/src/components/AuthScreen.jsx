import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  Phone, 
  MapPin, 
  UploadCloud, 
  Camera, 
  HelpCircle,
  Code2,
  Check,
  RefreshCw,
  ExternalLink,
  Zap
} from 'lucide-react';
import CameraCaptureModal from './CameraCaptureModal';

const DEMO_ACCOUNTS = [
  {
    name: "Priya Sharma",
    roleLabel: "Web Developer (NSQF L5)",
    email: "demo@kushalai.local",
    password: "KushalDemo@2026!",
    badge: "★ SIH Lead Demo",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    tradeId: "web-developer-l5",
    role: "candidate",
    isSihDemo: true
  },
  {
    name: "Ramesh Sharma",
    roleLabel: "Electrician (NSQF L3)",
    email: "electrician.demo@kushalai.local",
    password: "Kaushal@2026",
    badge: "⚡ Electrician",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    tradeId: "electrician-l3",
    role: "candidate"
  },
  {
    name: "Mohammad Aslam",
    roleLabel: "Automotive Tech (NSQF L4)",
    email: "mechanic.demo@kushalai.local",
    password: "Kaushal@2026",
    badge: "🚗 Automotive",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    tradeId: "automotive-l4",
    role: "candidate"
  },
  {
    name: "Amit Patel",
    roleLabel: "Solar PV Installer (NSQF L4)",
    email: "solar.demo@kushalai.local",
    password: "Kaushal@2026",
    badge: "☀️ Solar PV",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    tradeId: "solar-l4",
    role: "candidate"
  },
  {
    name: "Rajesh Varma",
    roleLabel: "Lead Assessor (NCVET)",
    email: "assessor@kaushal.gov.in",
    password: "Kaushal@2026",
    badge: "👨‍🏫 Lead Assessor",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    tradeId: "assessor",
    role: "assessor"
  },
  {
    name: "Dr. Sunita Rao",
    roleLabel: "Director NCVET (Admin)",
    email: "admin@kaushal.gov.in",
    password: "Kaushal@2026",
    badge: "🏛️ Platform Admin",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    tradeId: "admin",
    role: "admin"
  }
];

export default function AuthScreen({
  onLoginSuccess,
  onLaunchDemo,
  lang = 'en'
}) {
  const isHi = lang === 'hi';

  // Mode: 'login' | 'register' | 'forgot_password'
  const [mode, setMode] = useState('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState('candidate'); // 'candidate' | 'assessor' | 'admin'
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Registration Multi-Step State (Steps 1 to 7)
  const [regStep, setRegStep] = useState(1);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);

  // A. Personal Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [country, setCountry] = useState('India');
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // B. Education
  const [highestQualification, setHighestQualification] = useState('Graduate / Diploma');
  const [course, setCourse] = useState('Computer Applications / Software Engineering');
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState('2023');
  const [vocationalTraining, setVocationalTraining] = useState('RPL Web Developer Certification');

  // C. Professional Experience
  const [totalYears, setTotalYears] = useState('3');
  const [employmentStatus, setEmploymentStatus] = useState('Freelance / Independent Contractor');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [jobTitle, setJobTitle] = useState('Web Developer');
  const [responsibilities, setResponsibilities] = useState('');
  const [keyProjects, setKeyProjects] = useState('');

  // D. Skills & Career Profile
  const [selectedTradeId, setSelectedTradeId] = useState('web-developer-l5');
  const [technicalSkills, setTechnicalSkills] = useState('HTML5, CSS3, JavaScript ES6+, React, Responsive Layouts');
  const [toolsUsed, setToolsUsed] = useState('VS Code, Git, Chrome DevTools, NPM');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // E. Short Occupation-Specific Initial Test
  const [initialTestQuestions, setInitialTestQuestions] = useState([]);
  const [initialTestAnswers, setInitialTestAnswers] = useState({});
  const [initialTestLoading, setInitialTestLoading] = useState(false);
  const [initialTestResult, setInitialTestResult] = useState(null);

  // F. Supporting Documents
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null); // { filePath, originalFilename, sha256Hash }
  const [resumeUploading, setResumeUploading] = useState(false);

  // Consent
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Fetch initial test questions when arriving at Step 5
  useEffect(() => {
    if (regStep === 5 && selectedTradeId && initialTestQuestions.length === 0) {
      loadInitialTestQuestions(selectedTradeId);
    }
  }, [regStep, selectedTradeId]);

  const loadInitialTestQuestions = async (tradeId) => {
    setInitialTestLoading(true);
    try {
      const res = await fetch(`/api/assessments/initial-test/${tradeId}`);
      if (res.ok) {
        const data = await res.json();
        setInitialTestQuestions(data.questions || []);
      }
    } catch (e) {
      console.warn('[Initial Test Load]:', e.message);
    } finally {
      setInitialTestLoading(false);
    }
  };

  // Submit Initial Test to Backend
  const handleEvaluateInitialTest = async () => {
    setInitialTestLoading(true);
    setRegError(null);
    try {
      const res = await fetch('/api/assessments/initial-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId: selectedTradeId,
          email: email || 'candidate@skillindia.rpl',
          answers: initialTestAnswers
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Initial test evaluation failed.');
      }

      const result = await res.json();
      setInitialTestResult(result);
    } catch (err) {
      setRegError(err.message);
    } finally {
      setInitialTestLoading(false);
    }
  };

  // Upload Resume File
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setResumeUploading(true);
    setRegError(null);

    const formData = new FormData();
    formData.append('resumeFile', file);

    try {
      const res = await fetch('/api/candidates/upload-resume', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Resume upload failed.');
      }

      const data = await res.json();
      setResumeData(data);
    } catch (err) {
      setRegError(err.message);
      setResumeFile(null);
    } finally {
      setResumeUploading(false);
    }
  };

  // Direct 1-Click Demo Login Handler
  const handleDirectLogin = async (acc) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: acc.email.trim().toLowerCase(),
          password: acc.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      localStorage.setItem('kaushal_ai_auth_token', data.token);
      if (data.user) {
        localStorage.setItem('kaushal_ai_active_user', JSON.stringify(data.user));
      }

      if (data.candidateProfile) {
        const candidateRecord = {
          id: data.candidateProfile.id,
          fullName: data.candidateProfile.full_name,
          email: data.user?.email || data.candidateProfile.email || acc.email,
          tradeId: data.candidateProfile.trade_id,
          tradeName: data.candidateProfile.trade_id === 'web-developer-l5'
            ? 'Web Developer (NSQF Level 5)'
            : (data.candidateProfile.current_occupation || acc.roleLabel),
          experienceYears: String(data.candidateProfile.informal_experience_years || '4'),
          workLocation: `${data.candidateProfile.district || ''}, ${data.candidateProfile.state || ''}`.replace(/^, /, '') || 'Varanasi, UP',
          primaryLanguage: data.candidateProfile.primary_language || 'en',
          role: data.user?.role || 'candidate'
        };
        localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(candidateRecord));
      } else {
        const candidateRecord = {
          id: data.user?.id || 'staff-session',
          fullName: data.user?.full_name || acc.name,
          email: acc.email,
          tradeId: acc.tradeId,
          tradeName: acc.roleLabel,
          role: data.user?.role || acc.role
        };
        localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(candidateRecord));
      }

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setLoginError(err.message || 'Direct login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError(isHi ? 'कृपया ईमेल और पासवर्ड दर्ज करें।' : 'Please enter your email and password.');
      return;
    }

    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isHi ? 'प्रमाणीकरण विफल रहा।' : 'Authentication failed.'));
      }

      if (rememberMe && data.token) {
        localStorage.setItem('kaushal_ai_auth_token', data.token);
        localStorage.setItem('kaushal_ai_active_user', JSON.stringify(data.user));
      }

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Final Registration Submission
  const handleFinalRegisterSubmit = async () => {
    setRegError(null);
    if (!consentConfirmed) {
      setRegError(isHi ? 'कृपया आगे बढ़ने से पहले विवरण की पुष्टि करें।' : 'Please confirm your information and consent.');
      return;
    }

    if (!password || password.length < 8) {
      setRegError('Password is required and must be at least 8 characters long.');
      return;
    }
    if (!phone.trim()) {
      setRegError('Mobile number is required.');
      return;
    }

    setRegLoading(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: phone.trim(),
        tradeId: selectedTradeId,
        city: city.trim(),
        state: stateName,
        country: country,
        primaryLanguage,
        education: {
          highestQualification,
          course,
          institution: institution.trim(),
          graduationYear,
          vocationalTraining
        },
        experience: {
          totalYears: Number(totalYears) || 0,
          employmentStatus,
          currentEmployer: currentEmployer.trim(),
          jobTitle: jobTitle.trim(),
          responsibilities: responsibilities.trim(),
          keyProjects: keyProjects.trim()
        },
        skills: {
          technicalSkills: technicalSkills.split(',').map(s => s.trim()).filter(Boolean),
          tools: toolsUsed.split(',').map(s => s.trim()).filter(Boolean),
          portfolioUrl: portfolioUrl.trim(),
          githubUrl: githubUrl.trim()
        },
        resume: resumeData ? {
          filePath: resumeData.filePath,
          originalFilename: resumeData.originalFilename,
          sha256Hash: resumeData.sha256Hash,
          fileSize: resumeData.fileSize,
          mimeType: resumeData.mimeType
        } : null,
        initialTestId: initialTestResult?.testId || null
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (isHi ? 'पंजीकरण विफल रहा।' : 'Registration failed.'));
      }

      if (data.token) {
        localStorage.setItem('kaushal_ai_auth_token', data.token);
        localStorage.setItem('kaushal_ai_active_user', JSON.stringify(data.user));
      }

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Government-Trust Institutional Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">Kaushal AI</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                SIH26242 RPL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              National RPL Practical Skill Verification & Certification Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NSQF Level 5 Aligned</span>
          </div>

          {onLaunchDemo && (
            <button
              type="button"
              onClick={onLaunchDemo}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHi ? 'डेमो मोड' : 'Explore Demo'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {mode === 'login' ? (
            /* ================= LOGIN CARD ================= */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-1">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isHi ? 'पोर्टल में प्रवेश करें' : 'Sign in to Kaushal AI'}
                </h1>
                <p className="text-xs text-slate-400">
                  {isHi ? 'अपने कौशल सत्यापन खाते में सुरक्षित लॉगिन करें' : 'Authorized access for Candidates, Assessors, and Administrators'}
                </p>
              </div>

              {/* ⚡ 1-Click Direct Demo Logins (SIH Video Ready) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl shadow-black/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        {isHi ? '⚡ त्वरित 1-क्लिक डेमो लॉगिन' : '⚡ 1-Click Direct Demo Logins'}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {isHi ? 'वीडियो प्रस्तुति के लिए तुरंत लॉगिन करें' : 'SIH Presentation & Video Recording Ready'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Preloaded
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={loginLoading}
                      onClick={() => handleDirectLogin(acc)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between group active:scale-[0.98] ${
                        acc.isSihDemo
                          ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-blue-950/40 border-amber-400/80 hover:border-amber-300 shadow-md shadow-amber-950/40'
                          : 'bg-slate-950 border-slate-800 hover:border-blue-500/60 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-black truncate ${
                            acc.isSihDemo ? 'text-amber-200 group-hover:text-amber-100 font-extrabold' : 'text-slate-100 group-hover:text-blue-300'
                          }`}>
                            {acc.name}
                          </span>
                          {acc.isSihDemo && <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border inline-block mb-1.5 ${acc.badgeColor}`}>
                          {acc.badge}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-slate-800/80 text-amber-400 font-bold">
                        <span className="flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> Direct Login
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider relative">
                  {isHi ? 'या क्रेडेंशियल के साथ लॉगिन करें' : 'Or Sign In with Credentials'}
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isHi ? 'ईमेल या उपयोगकर्ता आईडी' : 'Email or Candidate ID'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. dev.candidate@skillindia.rpl"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {isHi ? 'पासवर्ड' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {isHi ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{isHi ? 'सत्र याद रखें' : 'Remember my session'}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isHi ? 'सत्यापन हो रहा है...' : 'Authenticating...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHi ? 'लॉगिन करें' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  {isHi ? 'नए उम्मीदवार हैं?' : "Don't have an assessment account yet?"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setRegStep(1);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? 'नया उम्मीदवार पंजीकरण शुरू करें' : 'Register for RPL Skill Verification'}</span>
                </button>
              </div>
            </motion.div>
          ) : mode === 'forgot_password' ? (
            /* ================= FORGOT PASSWORD ================= */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white">
                  {isHi ? 'पासवर्ड पुनःप्राप्ति' : 'Password Assistance'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isHi ? 'अपने पंजीकृत ईमेल पर निर्देश प्राप्त करें या मूल्यांकन केंद्र से संपर्क करें' : 'Reset instructions for registered candidates and verified assessment staff'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5 leading-relaxed">
                <p className="font-semibold text-slate-200">
                  {isHi ? 'आधिकारिक दिशा-निर्देश:' : 'Institutional Policy:'}
                </p>
                <p>
                  {isHi 
                    ? 'राष्ट्रीय कौशल विकास मिशन (RPL) सुरक्षा मानकों के अनुसार, आधिकारिक मूल्यांकनकर्ता एवं उम्मीदवार क्रेडेंशियल केंद्र अधीक्षक द्वारा नियंत्रित होते हैं।'
                    : 'Per NSQF RPL governance guidelines, certified assessor and center credentials require verification by the center superintendent.'}
                </p>
                <p className="text-slate-400">
                  {isHi ? 'डेमो और परीक्षण के लिए डिफ़ॉल्ट क्रेडेंशियल: Kaushal@2026' : 'For development and sandbox assessments, use the verified credentials or explore Demo Mode.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHi ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}</span>
              </button>
            </motion.div>
          ) : (
            /* ================= MULTI-STEP RESUME REGISTRATION ================= */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6"
            >
              {/* Stepper Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    {isHi ? 'कदम ' + regStep + ' / 7' : 'Step ' + regStep + ' of 7: Candidate Onboarding'}
                  </span>
                  <h2 className="text-xl font-black text-white">
                    {regStep === 1 && (isHi ? 'व्यक्तिगत जानकारी (Personal Details)' : 'Personal Information')}
                    {regStep === 2 && (isHi ? 'शैक्षणिक योग्यता (Education & Qualifications)' : 'Education & Qualifications')}
                    {regStep === 3 && (isHi ? 'व्यावसायिक अनुभव (Professional Experience)' : 'Professional Experience')}
                    {regStep === 4 && (isHi ? 'कौशल व करियर प्रोफाइल (Skills & Occupation)' : 'Skills & Occupation Selection')}
                    {regStep === 5 && (isHi ? 'प्रारंभिक कौशल परीक्षा (Occupation-Specific Skill Test)' : 'Occupation-Specific Skill Test')}
                    {regStep === 6 && (isHi ? 'सहायक दस्तावेज व बायोडाटा (Resume & Documents)' : 'Resume & Supporting Documents')}
                    {regStep === 7 && (isHi ? 'समीक्षा व पुष्टि (Review & Confirm)' : 'Review & Final Confirmation')}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHi ? 'लॉगिन पर वापस' : 'Back to Login'}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 transition-all duration-300"
                  style={{ width: `${(regStep / 7) * 100}%` }}
                ></div>
              </div>

              {regError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p>{regError}</p>
                </div>
              )}

              {/* STEP 1: PERSONAL INFORMATION */}
              {regStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aarav.sharma@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Password (min 8 alphanumeric characters) *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Preferred Language
                    </label>
                    <select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      State / Union Territory *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Profile Photo via Camera or File */}
                  <div className="sm:col-span-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Profile Photograph (Optional for Identity Verification)
                    </label>
                    <div className="flex items-center gap-4">
                      {profilePhoto ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500">
                          <img src={profilePhoto} alt="Profile preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCameraModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span>{profilePhoto ? 'Capture New Photo' : 'Capture via Camera'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: EDUCATION & QUALIFICATIONS */}
              {regStep === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Highest Qualification *
                    </label>
                    <select
                      value={highestQualification}
                      onChange={(e) => setHighestQualification(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Graduate / Diploma">Graduate / Diploma</option>
                      <option value="Post Graduate">Post Graduate</option>
                      <option value="Senior Secondary (12th)">Senior Secondary (Class 12)</option>
                      <option value="Secondary (10th)">Secondary (Class 10)</option>
                      <option value="Informal / Vocational Learner">Informal / Self-Taught Practitioner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Course or Specialization
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. Computer Science, Information Science"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Institution / College Name
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Bangalore Institute of Technology"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Graduation / Completion Year
                    </label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="2023"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Relevant Vocational Training / Bootcamps
                    </label>
                    <input
                      type="text"
                      value={vocationalTraining}
                      onChange={(e) => setVocationalTraining(e.target.value)}
                      placeholder="e.g. Full-Stack Web Development Boot Camp, NCVET Skill Course"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: PROFESSIONAL EXPERIENCE */}
              {regStep === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Total Practical Experience (Years) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={totalYears}
                      onChange={(e) => setTotalYears(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Current Employment Status *
                    </label>
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="Employed Full-time">Employed Full-time</option>
                      <option value="Freelance / Independent Contractor">Freelance / Independent Contractor</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Seeking Employment">Seeking Employment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Current Employer / Organization
                    </label>
                    <input
                      type="text"
                      value={currentEmployer}
                      onChange={(e) => setCurrentEmployer(e.target.value)}
                      placeholder="e.g. Sharma Dev Labs (or Self)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Frontend Developer"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Key Practical Projects & Practical Work
                    </label>
                    <textarea
                      rows={3}
                      value={keyProjects}
                      onChange={(e) => setKeyProjects(e.target.value)}
                      placeholder="Briefly describe key websites, web applications, or digital client projects you have built..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: SKILLS & OCCUPATION */}
              {regStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Selected Target Occupation (NSQF Qualification Pack) *
                    </label>
                    <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Web Developer (NSQF Level 5)</h3>
                          <p className="text-xs text-slate-400">QP Code: SSC/Q0501 • IT-ITeS Sector Skill Council</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        Primary Occupation
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Technical Skills (comma-separated) *
                    </label>
                    <input
                      type="text"
                      value={technicalSkills}
                      onChange={(e) => setTechnicalSkills(e.target.value)}
                      placeholder="HTML5, CSS3, JavaScript ES6+, React, Responsive Layouts"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tools & Technologies Used
                    </label>
                    <input
                      type="text"
                      value={toolsUsed}
                      onChange={(e) => setToolsUsed(e.target.value)}
                      placeholder="VS Code, Git, Chrome DevTools, Webpack, Figma"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Live Portfolio / Project URL
                      </label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://myportfolio.dev"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: SHORT OCCUPATION-SPECIFIC SKILL TEST */}
              {regStep === 5 && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                    <p className="font-bold text-amber-200">
                      ⚡ Preliminary Web Developer Skill Screening (5 Questions)
                    </p>
                    <p className="text-amber-300/80">
                      This short diagnostic test evaluates foundational knowledge in semantic HTML, CSS layout, and asynchronous JavaScript. Answers are scored server-side.
                    </p>
                  </div>

                  {initialTestLoading ? (
                    <div className="py-12 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">Evaluating your responses server-side...</p>
                    </div>
                  ) : initialTestResult ? (
                    /* Test Result Display */
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Initial Screening Score</span>
                          <span className="text-2xl font-black text-white">
                            {initialTestResult.score} / {initialTestResult.totalQuestions} ({initialTestResult.percentage}%)
                          </span>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          initialTestResult.percentage >= 60 
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
                            : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                        }`}>
                          {initialTestResult.readinessLevel}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        <span className="font-semibold text-white block mb-0.5">Assessor Recommendation:</span>
                        {initialTestResult.recommendation}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Competency Breakdown:</h4>
                        {initialTestResult.breakdown?.map((b, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60">
                            <span className="text-slate-300">{b.category}</span>
                            <span className={`font-bold ${b.isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {b.isCorrect ? '✓ Correct' : 'Review Recommended'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Questions List */
                    <div className="space-y-4">
                      {initialTestQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {q.category}
                              </span>
                              <p className="text-xs sm:text-sm font-semibold text-white whitespace-pre-line">
                                {q.prompt}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const letter = opt.slice(0, 1);
                              const isSelected = initialTestAnswers[q.id] === letter;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => setInitialTestAnswers(prev => ({ ...prev, [q.id]: letter }))}
                                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-600/15 text-white font-medium'
                                      : 'border-slate-800 bg-slate-900/70 hover:bg-slate-900 text-slate-300'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleEvaluateInitialTest}
                        disabled={Object.keys(initialTestAnswers).length < initialTestQuestions.length}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit & Verify Initial Test Answers</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: SUPPORTING DOCUMENTS (RESUME UPLOAD) */}
              {regStep === 6 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                    <p className="font-bold text-blue-200">
                      📄 Verified Resume / CV Upload
                    </p>
                    <p className="text-blue-300/80">
                      Upload your official resume in PDF or DOCX format (Max 10 MB). A cryptographic SHA-256 integrity hash is computed server-side to guarantee authenticity.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 text-center space-y-3 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6 text-blue-400" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {resumeFile ? resumeFile.name : 'Select or drag your resume file'}
                      </p>
                      <p className="text-xs text-slate-500">Supported formats: PDF, DOCX, DOC (Up to 10 MB)</p>
                    </div>

                    <input
                      type="file"
                      id="resume-file-input"
                      accept=".pdf,.docx,.doc,application/pdf,application/msword"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />

                    <label
                      htmlFor="resume-file-input"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-blue-600/20"
                    >
                      {resumeUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading & Hashing...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Browse Resume File</span>
                        </>
                      )}
                    </label>
                  </div>

                  {resumeData && (
                    <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-200 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Resume Uploaded & Cryptographically Hashed (Awaiting Assessor Review)</span>
                      </div>
                      <p className="text-[11px] text-slate-400">File: {resumeData.originalFilename} ({(resumeData.fileSize / 1024).toFixed(1)} KB)</p>
                      <p className="text-[10px] font-mono text-emerald-400 break-all">
                        SHA-256: {resumeData.sha256Hash}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 7: REVIEW & CONFIRM */}
              {regStep === 7 && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 text-xs">
                    <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                      Review Candidate Profile
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                      <div><span className="text-slate-500">Full Name:</span> {fullName}</div>
                      <div><span className="text-slate-500">Email:</span> {email}</div>
                      <div><span className="text-slate-500">Phone:</span> {phone}</div>
                      <div><span className="text-slate-500">Location:</span> {city}, {stateName}, {country}</div>
                      <div><span className="text-slate-500">Occupation:</span> Web Developer (Level 5)</div>
                      <div><span className="text-slate-500">Experience:</span> {totalYears} years ({employmentStatus})</div>
                      <div><span className="text-slate-500">Education:</span> {highestQualification}</div>
                      <div><span className="text-slate-500">Initial Test Score:</span> {initialTestResult ? `${initialTestResult.percentage}% (${initialTestResult.readinessLevel})` : 'Completed'}</div>
                      <div><span className="text-slate-500">Resume Attached:</span> {resumeData ? `✓ ${resumeData.originalFilename}` : 'None'}</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentConfirmed}
                        onChange={(e) => setConsentConfirmed(e.target.checked)}
                        className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <span>
                        I certify that the information and work experience provided are true and accurate. I consent to authentic practical skill assessment and assessor evaluation under the National Skill Qualification Framework (NSQF).
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={regStep === 1 || regLoading}
                  onClick={() => setRegStep(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {regStep < 7 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (regStep === 1) {
                        if (!fullName.trim() || fullName.trim().length < 2) {
                          setRegError('Please provide your full legal name (at least 2 characters).');
                          return;
                        }
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(email.trim())) {
                          setRegError('Please provide a valid email address.');
                          return;
                        }
                        if (!phone.trim() || phone.trim().length < 7) {
                          setRegError('Please provide a valid mobile number.');
                          return;
                        }
                        if (!password || password.length < 8) {
                          setRegError('Password must be at least 8 alphanumeric characters.');
                          return;
                        }
                        if (password !== confirmPassword) {
                          setRegError('Passwords do not match. Please verify your password confirmation.');
                          return;
                        }
                        if (!city.trim() || !stateName.trim()) {
                          setRegError('Please provide your city and state.');
                          return;
                        }
                      }
                      setRegError(null);
                      setRegStep(prev => prev + 1);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    <span>Save & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!consentConfirmed || regLoading}
                    onClick={handleFinalRegisterSubmit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    {regLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Registration...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Registration & Launch Assessment</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(blob, dataUrl) => {
          setProfilePhoto(dataUrl);
        }}
        lang={lang}
      />

      {/* Institutional Government Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 sm:px-8 text-center text-slate-500 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2">
          <span>Kaushal AI • Smart India Hackathon (SIH26242) RPL Initiative</span>
          <span>Aligned with National Skill Qualification Framework (NSQF Level 5)</span>
        </div>
      </footer>
    </div>
  );
}
