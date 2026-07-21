import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nximtvyqpdstpajggwrr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yrkA2ASdJZulD6E6bvq_5w_XS9Q7d75';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function signInWithOtp(email) {
  return supabase.auth.signInWithOtp({ email });
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

export function upsertScheduleEntries(rows) {
  return supabase.from('schedule_entries').upsert(rows, { onConflict: 'user_id,entry_date' }).select();
}

export function upsertScheduleEntry(entry) {
  return supabase.from('schedule_entries').upsert(entry, { onConflict: 'user_id,entry_date' }).select().single();
}

export function deleteScheduleEntry(id) {
  return supabase.from('schedule_entries').delete().eq('id', id);
}
