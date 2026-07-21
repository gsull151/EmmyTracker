import { ref } from 'vue';
import {
  getSession,
  onAuthStateChange,
  signInWithOtp,
  verifyOtp,
  signOut as apiSignOut
} from '../services/supabaseService';

const currentUser = ref(null);
const authStatus = ref('');
const pendingEmail = ref(null);
const codeRequested = ref(false);

async function initAuth(onSignedIn) {
  const session = await getSession();
  if (session) {
    currentUser.value = session.user;
    onSignedIn?.();
  }
  onAuthStateChange((event, session) => {
    if (session) {
      currentUser.value = session.user;
      onSignedIn?.();
    }
  });
}

async function sendCode(email) {
  if (!email) { authStatus.value = 'Enter your email first.'; return; }
  authStatus.value = 'Sending code...';
  const { error } = await signInWithOtp(email);
  if (error) {
    authStatus.value = 'Error: ' + error.message;
    return;
  }
  pendingEmail.value = email;
  authStatus.value = 'Check your email for the verification code.';
  codeRequested.value = true;
}

async function verifyCode(code) {
  if (!pendingEmail.value) { authStatus.value = 'Enter your email and request a code first.'; return; }
  if (!code) { authStatus.value = 'Enter the verification code.'; return; }
  authStatus.value = 'Verifying...';
  const { error } = await verifyOtp(pendingEmail.value, code);
  authStatus.value = error ? ('Error: ' + error.message) : '';
}

async function signOut() {
  await apiSignOut();
  window.location.reload();
}

export function useAuth() {
  return { currentUser, authStatus, pendingEmail, codeRequested, initAuth, sendCode, verifyCode, signOut };
}
