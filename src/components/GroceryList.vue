<script setup>
import { computed, reactive } from 'vue';
import { useWeeklyPlan } from '../composables/useWeeklyPlan';

const { weekDates, dayMeal } = useWeeklyPlan();
const checked = reactive(new Set());

const groups = computed(() => {
  const seen = new Set();
  const result = [];
  weekDates.value.forEach(dateKey => {
    const meal = dayMeal(dateKey);
    if (!meal || seen.has(meal.id)) return;
    seen.add(meal.id);
    const lines = (meal.ingredients || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    result.push({ mealId: meal.id, name: meal.name, lines });
  });
  return result;
});

function lineKey(mealId, index) {
  return `${mealId}:${index}`;
}

function toggle(key) {
  if (checked.has(key)) checked.delete(key);
  else checked.add(key);
}
</script>

<template>
  <div class="grocery-title">Grocery list</div>
  <div v-if="!groups.length" class="empty-state">Fill in this week's dinners to build a shopping list.</div>
  <div v-else class="grocery-groups">
    <div v-for="group in groups" :key="group.mealId" class="grocery-group">
      <div class="group-heading">{{ group.name }}</div>
      <div v-if="!group.lines.length" class="empty-state">No ingredients listed for this meal.</div>
      <label v-for="(line, i) in group.lines" :key="i" class="grocery-item">
        <input type="checkbox" :checked="checked.has(lineKey(group.mealId, i))" @change="toggle(lineKey(group.mealId, i))" />
        <span :class="{ done: checked.has(lineKey(group.mealId, i)) }">{{ line }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.grocery-title { font-weight: 600; margin-bottom: 12px; }
.empty-state { color: var(--ink-soft); font-size: 13px; }
.grocery-groups { display: flex; flex-direction: column; gap: 16px; }
.group-heading { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
.grocery-item { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 3px 0; cursor: pointer; }
.grocery-item input { flex-shrink: 0; }
.grocery-item .done { text-decoration: line-through; color: var(--ink-soft); }
</style>
