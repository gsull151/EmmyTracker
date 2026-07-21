import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nximtvyqpdstpajggwrr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yrkA2ASdJZulD6E6bvq_5w_XS9Q7d75';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Bypasses supabase-js's signInWithOtp: the library treats any HTTP 500
// (which is what Supabase returns for a "sign-ups not open" rejection) as a
// generic retryable network error and discards the response body before it
// can be read, losing the real message. Calling the endpoint directly lets
// us surface what the server actually said.
export async function signInWithOtp(email) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, create_user: true })
    });
    if (res.ok) return { error: null };
    let data = {};
    try { data = await res.json(); } catch { /* non-JSON body */ }
    const message = data.message || data.msg || data.error_description || data.error || `Request failed (${res.status})`;
    return { error: { message } };
  } catch (err) {
    return { error: { message: (err && err.message) || 'Network error — please try again.' } };
  }
}

export function verifyOtp(email, token) {
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

export function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export function fetchScheduleEntries(userId) {
  return supabase.from('schedule_entries').select('*').eq('user_id', userId);
}

export function upsertScheduleEntry(entry) {
  return supabase.from('schedule_entries').upsert(entry, { onConflict: 'user_id,entry_date' }).select().single();
}

export function deleteScheduleEntry(id, userId) {
  return supabase.from('schedule_entries').delete().eq('id', id).eq('user_id', userId);
}
