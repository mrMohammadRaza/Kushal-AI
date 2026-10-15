import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tmdrouofryymaqvxfhrx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Sign in with Supabase Auth or fallback to local offline candidate session
 */
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    // If user doesn't exist yet or network error, check if local offline demo user
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
