import { createClient } from '@supabase/supabase-js';

function createSafeSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://tmdrouofryymaqvxfhrx.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (key && typeof key === 'string' && key.trim().length > 0) {
    try {
      return createClient(url, key.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.warn('[Supabase Client] Failed to initialize with provided key:', err);
    }
  }

  // Resilient fallback mock when Supabase credentials are not configured in production
  console.info('[Supabase Client] VITE_SUPABASE_ANON_KEY not configured. Running in standalone local backend mode.');
  return {
    auth: {
      signInWithPassword: async () => ({ 
        data: null, 
        error: new Error('Remote Supabase unconfigured. Please authenticate via local backend.') 
      }),
      signUp: async () => ({ 
        data: null, 
        error: new Error('Remote Supabase unconfigured. Please authenticate via local backend.') 
      }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null })
    })
  };
}

export const supabase = createSafeSupabaseClient();

export async function loginUser(email, password) {
  try {
    // 1. Try local backend JWT authentication
    const backendRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.token) {
        localStorage.setItem('kaushal_ai_auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('kaushal_ai_active_user', JSON.stringify(data.user));
      }
      if (data.candidateProfile) {
        const candidateRecord = {
          id: data.candidateProfile.id,
          fullName: data.candidateProfile.full_name,
          email: data.user.email,
          tradeId: data.candidateProfile.trade_id,
          tradeName: data.candidateProfile.trade_id === 'web-developer-l5' 
            ? 'Web Developer (NSQF Level 5)' 
            : data.candidateProfile.current_occupation,
          experienceYears: String(data.candidateProfile.informal_experience_years || 3),
          workLocation: `${data.candidateProfile.district || ''}, ${data.candidateProfile.state || ''}`.replace(/^, /, ''),
          primaryLanguage: data.candidateProfile.primary_language || 'en',
          role: data.user.role
        };
        localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(candidateRecord));
      }
      return { success: true, user: data.user, token: data.token, candidateProfile: data.candidateProfile };
    }
  } catch (backendErr) {
    console.warn('[Backend Auth] Note:', backendErr.message);
  }

  // 2. Fallback to Supabase Auth if backend endpoint is unavailable
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    console.warn('[Supabase Auth] Login note:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sign up with Supabase Auth including candidate metadata and job details
 */
export async function registerUser(email, password, jobDetails = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName: jobDetails.fullName || 'RPL Candidate',
          tradeId: jobDetails.tradeId || 'electrician-l3',
          tradeName: jobDetails.tradeName || 'Assistant Electrician',
          experienceYears: jobDetails.experienceYears || '5',
          employmentType: jobDetails.employmentType || 'Self-Employed',
          workLocation: jobDetails.workLocation || 'Varanasi, UP',
          companyName: jobDetails.companyName || 'Independent Contractor',
          primaryLanguage: jobDetails.primaryLanguage || 'hi',
          assistanceNeed: jobDetails.assistanceNeed || 'None'
        }
      }
    });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    console.warn('[Supabase Auth] Registration note:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Save candidate profile & job details locally and attempt Supabase table sync
 */
export async function saveCandidateSession(profileData) {
  const sessionRecord = {
    ...profileData,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem('kaushal_ai_active_candidate', JSON.stringify(sessionRecord));

  // Sync to Supabase candidate_profiles table if available
  try {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .upsert([
        {
          id: profileData.id || `cand-${Date.now().toString().slice(-4)}`,
          email: profileData.email,
          full_name: profileData.fullName,
          trade_id: profileData.tradeId,
          experience_years: parseInt(profileData.experienceYears, 10) || 5,
          employment_type: profileData.employmentType,
          work_location: profileData.workLocation,
          company_name: profileData.companyName,
          primary_language: profileData.primaryLanguage,
          accessibility_pref: profileData.accessibilityPref || 'Standard'
        }
      ], { onConflict: 'email' });
  } catch (e) {
    // Non-blocking: table might not be initialized yet
    console.log('[Supabase DB] Profile stored in local persistent session.');
  }

  return sessionRecord;
}

export function getStoredCandidateSession() {
  try {
    const raw = localStorage.getItem('kaushal_ai_active_candidate');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearCandidateSession() {
  localStorage.removeItem('kaushal_ai_active_candidate');
  supabase.auth.signOut().catch(() => {});
}
