<script setup>
import { computed } from 'vue';
import { useSchedule } from '../composables/useSchedule';

const { schedule } = useSchedule();

const entries = computed(() => {
  return Object.keys(schedule).sort().reverse().slice(0, 15).map(k => {
    const entry = schedule[k];
    const dateObj = new Date(k + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const tagLabel = entry.type === 'overnight' ? 'Overnight'
      : entry.type === 'day-visit' ? 'Day visit'
      : entry.type === 'both' ? 'Both'
      : 'Note';
    return { key: k, dateStr, note: entry.note, type: entry.type, tagLabel };
  });
});
</script>

<template>
  <h2>Recent entries</h2>
  <div v-if="entries.length === 0" class="empty-log">No entries yet. Click a date on the calendar to log a visit.</div>
  <div v-else>
    <div class="log-entry" v-for="entry in entries" :key="entry.key">
      <div class="log-left">
        <div class="log-date">{{ entry.dateStr }}</div>
        <div v-if="entry.note" class="log-note">{{ entry.note }}</div>
      </div>
      <span class="log-tag" :class="entry.type">{{ entry.tagLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
h2 { font-size: 15px; font-weight: 600; margin: 0 0 10px; }
.log-entry { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 13px; gap: 10px; }
.log-entry:last-child { border-bottom: none; }
.log-left { display: flex; flex-direction: column; }
.log-date { font-weight: 600; }
.log-note { color: var(--ink-soft); margin-top: 2px; }
.log-tag { font-size: 11px; padding: 3px 8px; border-radius: 100px; white-space: nowrap; height: fit-content; }
.log-tag.overnight { background: var(--overnight-bg); color: var(--overnight-ink); }
.log-tag.day-visit { background: var(--day-bg); color: var(--day-ink); }
.log-tag.both { background: #EFE4DE; color: var(--ink); }
.log-tag.none { background: #EFEFEF; color: var(--ink-soft); }
.empty-log { color: var(--ink-soft); font-size: 13px; padding: 6px 0; }
</style>
