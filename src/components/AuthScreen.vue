<script setup>
import { ref, nextTick } from 'vue';
import { useAuth } from '../composables/useAuth';

const { authStatus, codeRequested, sendCode, verifyCode } = useAuth();
const email = ref('');
const code = ref('');
const codeInputEl = ref(null);

async function handleSend() {
  await sendCode(email.value.trim());
  if (codeRequested.value) {
    await nextTick();
    codeInputEl.value?.focus();
  }
}

async function handleVerify() {
  await verifyCode(code.value.trim());
}
</script>

<template>
  <div id="authScreen">
    <h1>Emerson's schedule</h1>
    <p>Sign in with your email to access your tracker. We'll send you a one-time code — no password needed.</p>
    <input type="email" v-model="email" placeholder="you@example.com" autocomplete="email" autocapitalize="off">
    <button @click="handleSend">Send sign-in code</button>
    <input
      v-if="codeRequested"
      ref="codeInputEl"
      type="text"
      v-model="code"
      placeholder="Verification code"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="10"
      class="code-input"
    >
    <button v-if="codeRequested" @click="handleVerify">Verify code</button>
    <div id="authStatus">{{ authStatus }}</div>
  </div>
</template>

<style scoped>
#authScreen { max-width: 400px; margin: 80px auto; text-align: center; }
#authScreen h1 { margin-bottom: 8px; }
#authScreen p { color: var(--ink-soft); font-size: 14px; margin-bottom: 20px; }
#authScreen input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  font-size: 15px;
  margin-bottom: 10px;
}
#authScreen input.code-input { margin-top: 14px; }
#authScreen button {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--overnight);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
#authStatus { font-size: 13px; color: var(--ink-soft); margin-top: 12px; min-height: 18px; }
</style>
