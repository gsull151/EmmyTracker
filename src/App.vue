<script setup>
import { onMounted } from 'vue';
import AuthScreen from './components/AuthScreen.vue';
import StatsGrid from './components/StatsGrid.vue';
import CalendarGrid from './components/CalendarGrid.vue';
import EntryEditor from './components/EntryEditor.vue';
import RecentLog from './components/RecentLog.vue';
import { useAuth } from './composables/useAuth';
import { useSchedule } from './composables/useSchedule';

const { currentUser, initAuth, signOut } = useAuth();
const { loadSchedule } = useSchedule();

onMounted(() => {
  initAuth(() => loadSchedule(currentUser.value.id));
});
</script>

<template>
  <AuthScreen v-if="!currentUser" />
  <div v-else class="wrap">
    <div class="signout" @click="signOut">Sign out</div>
    <h1>Emmy's schedule</h1>
    <p class="subtitle">Tracking overnights and daytime visits under the parenting plan</p>

    <div class="card"><StatsGrid /></div>

    <div class="card">
      <CalendarGrid />
      <EntryEditor />
    </div>

    <div class="card">
      <RecentLog />
    </div>
  </div>
</template>

<style scoped>
.signout { font-size: 12px; color: var(--ink-soft); text-align: right; margin-bottom: 10px; cursor: pointer; text-decoration: underline; }
</style>
