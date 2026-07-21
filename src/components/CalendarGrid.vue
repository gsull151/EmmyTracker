<script setup>
import { computed } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useSchedule } from '../composables/useSchedule';

const { currentUser } = useAuth();
const { schedule, viewYear, viewMonth, selectedDate, fmtDateKey, openEditor } = useSchedule();

const dows = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const today = new Date();

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
);

const cells = computed(() => {
  const firstDow = new Date(viewYear.value, viewMonth.value, 1).getDay();
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
  const list = [];
  for (let i = 0; i < firstDow; i++) {
    list.push({ empty: true, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = fmtDateKey(viewYear.value, viewMonth.value, d);
    const entry = schedule[key];
    const isToday = viewYear.value === today.getFullYear() && viewMonth.value === today.getMonth() && d === today.getDate();
    list.push({
      empty: false,
      key,
      day: d,
      type: entry ? entry.type : null,
      hasNote: !!(entry && entry.note),
      isToday,
      isSelected: key === selectedDate.value
    });
  }
  return list;
});

function prevMonth() {
  viewMonth.value--;
  if (viewMonth.value < 0) { viewMonth.value = 11; viewYear.value--; }
}

function nextMonth() {
  viewMonth.value++;
  if (viewMonth.value > 11) { viewMonth.value = 0; viewYear.value++; }
}

function selectDay(key) {
  openEditor(key, currentUser.value?.id);
}
</script>

<template>
  <div class="month-nav">
    <button @click="prevMonth">&larr; Prev</button>
    <div class="month-label">{{ monthLabel }}</div>
    <button @click="nextMonth">Next &rarr;</button>
  </div>
  <div class="cal-grid">
    <div class="dow" v-for="d in dows" :key="d">{{ d }}</div>
  </div>
  <div class="cal-grid" style="margin-top:6px;">
    <div
      v-for="cell in cells"
      :key="cell.key"
      class="day-cell"
      :class="{
        empty: cell.empty,
        overnight: cell.type === 'overnight',
        'day-visit': cell.type === 'day-visit',
        both: cell.type === 'both',
        today: cell.isToday,
        selected: cell.isSelected
      }"
      @click="!cell.empty && selectDay(cell.key)"
    >
      <template v-if="!cell.empty">
        {{ cell.day }}
        <span v-if="cell.hasNote" class="note-dot"></span>
      </template>
    </div>
  </div>
  <div class="legend">
    <span><span class="swatch" style="background:var(--overnight-bg); border:1px solid var(--overnight);"></span>Overnight</span>
    <span><span class="swatch" style="background:var(--day-bg); border:1px solid var(--day);"></span>Day visit</span>
    <span><span class="swatch" style="background:var(--both-bg); border:1px solid var(--overnight);"></span>Both</span>
    <span><span class="swatch" style="background:#EFEFEF; border-radius:50%;"></span>Has a note</span>
  </div>
</template>

<style scoped>
.month-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.month-nav button {
  border: 1px solid var(--line); background: var(--card); border-radius: 8px;
  padding: 6px 12px; cursor: pointer; font-size: 14px; color: var(--ink);
}
.month-nav button:hover { background: #F0EDE5; }
.month-label { font-size: 16px; font-weight: 600; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.dow { text-align: center; font-size: 11px; color: var(--ink-soft); padding-bottom: 4px; }
.day-cell {
  position: relative; aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--line);
  background: var(--card); display: flex; align-items: center; justify-content: center;
  font-size: 13px; cursor: pointer; color: var(--ink);
}
.day-cell.empty { visibility: hidden; cursor: default; }
.day-cell.overnight { background: var(--overnight-bg); color: var(--overnight-ink); border-color: var(--overnight); font-weight: 600; }
.day-cell.day-visit { background: var(--day-bg); color: var(--day-ink); border-color: var(--day); font-weight: 600; }
.day-cell.both { background: var(--both-bg); color: var(--ink); border-color: var(--overnight); font-weight: 600; }
.day-cell.today { box-shadow: 0 0 0 2px var(--today-ring); }
.day-cell.selected { box-shadow: 0 0 0 2px var(--ink); }
.day-cell.selected.today { box-shadow: 0 0 0 2px var(--today-ring), 0 0 0 4px var(--ink); }
.day-cell .note-dot { position: absolute; bottom: 3px; width: 4px; height: 4px; border-radius: 50%; background: var(--ink-soft); }

.legend { display: flex; gap: 16px; margin-top: 12px; font-size: 12px; color: var(--ink-soft); flex-wrap: wrap; }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.swatch { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
</style>
