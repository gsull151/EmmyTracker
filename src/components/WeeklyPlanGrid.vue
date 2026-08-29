<script setup>
import { computed } from 'vue';
import { useWeeklyPlan } from '../composables/useWeeklyPlan';

const { weekStart, weekDates, selectedDate, dayMeal, prevWeek, nextWeek, openDay } = useWeeklyPlan();

const dows = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const today = new Date();

function fmtDateKeyLocal(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
const todayKey = fmtDateKeyLocal(today);

const weekLabel = computed(() => {
  const [y, m, d] = weekStart.value.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('default', opts)} – ${end.toLocaleDateString('default', opts)}`;
});

const cells = computed(() =>
  weekDates.value.map(key => {
    const [y, m, d] = key.split('-').map(Number);
    const meal = dayMeal(key);
    return {
      key,
      dow: dows[new Date(y, m - 1, d).getDay()],
      day: d,
      mealName: meal ? meal.name : '',
      isToday: key === todayKey,
      isSelected: key === selectedDate.value
    };
  })
);
</script>

<template>
  <div class="week-nav">
    <button @click="prevWeek">&larr; Prev week</button>
    <div class="week-label">Week of {{ weekLabel }}</div>
    <button @click="nextWeek">Next week &rarr;</button>
  </div>

  <div class="week-grid">
    <div
      v-for="cell in cells"
      :key="cell.key"
      class="day-cell"
      :class="{ filled: !!cell.mealName, today: cell.isToday, selected: cell.isSelected }"
      @click="openDay(cell.key)"
    >
      <div class="dow">{{ cell.dow }}</div>
      <div class="day-num">{{ cell.day }}</div>
      <div class="meal-name">{{ cell.mealName || '+' }}</div>
    </div>
  </div>
</template>

<style scoped>
.week-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.week-nav button {
  border: 1px solid var(--line); background: var(--card); border-radius: 8px;
  padding: 6px 12px; cursor: pointer; font-size: 14px; color: var(--ink);
}
.week-nav button:hover { background: #F0EDE5; }
.week-label { font-size: 16px; font-weight: 600; }

.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.day-cell {
  border: 1px solid var(--line); border-radius: 8px; background: var(--card);
  padding: 6px 4px; min-height: 76px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.day-cell:hover { background: #F6F4EF; }
.day-cell .dow { font-size: 10px; color: var(--ink-soft); }
.day-cell .day-num { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
.day-cell .meal-name {
  font-size: 10px; color: var(--ink-soft); line-height: 1.25; word-break: break-word;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.day-cell.filled { background: var(--overnight-bg); border-color: var(--overnight); }
.day-cell.filled .meal-name { color: var(--overnight-ink); font-weight: 600; }
.day-cell.today { box-shadow: 0 0 0 2px var(--today-ring); }
.day-cell.selected { box-shadow: 0 0 0 2px var(--ink); }
.day-cell.selected.today { box-shadow: 0 0 0 2px var(--today-ring), 0 0 0 4px var(--ink); }
</style>
