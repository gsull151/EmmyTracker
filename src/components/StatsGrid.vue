<script setup>
import { computed } from 'vue';
import { useSchedule } from '../composables/useSchedule';

const { viewYear, viewMonth, computeStats } = useSchedule();

const stats = computed(() => computeStats());
const monthName = computed(() => new Date(viewYear.value, viewMonth.value, 1).toLocaleString('default', { month: 'long' }));
</script>

<template>
  <div class="stats-grid">
    <div class="stat overnight">
      <div class="label">Overnights ({{ monthName }})</div>
      <div class="value">{{ stats.overnightMonth }}</div>
    </div>
    <div class="stat day">
      <div class="label">Day visits ({{ monthName }})</div>
      <div class="value">{{ stats.dayMonth }}</div>
    </div>
    <div class="stat">
      <div class="label">All-time overnights</div>
      <div class="value">{{ stats.overnightTotal }}</div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat { text-align: left; }
.stat .label { font-size: 12px; color: var(--ink-soft); margin-bottom: 4px; }
.stat .value { font-size: 22px; font-weight: 600; }
.stat.overnight .value { color: var(--overnight-ink); }
.stat.day .value { color: var(--day-ink); }
</style>
