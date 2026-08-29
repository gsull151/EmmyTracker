<script setup>
import { useMeals } from '../composables/useMeals';

const { meals, startNewMeal, startEditMeal } = useMeals();
</script>

<template>
  <div class="library-header">
    <div class="library-title">Meal library</div>
    <button class="btn-add" @click="startNewMeal">+ Add meal</button>
  </div>
  <div v-if="!meals.length" class="empty-state">No meals saved yet — add one to start building your rotation.</div>
  <div v-else class="meal-list">
    <div v-for="meal in meals" :key="meal.id" class="meal-row" @click="startEditMeal(meal)">
      <span class="meal-name">{{ meal.name }}</span>
      <span class="meal-type">{{ meal.meal_type }}</span>
    </div>
  </div>
</template>

<style scoped>
.library-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.library-title { font-weight: 600; }
.btn-add {
  border: 1px solid var(--line); background: var(--card); border-radius: 8px;
  padding: 6px 12px; cursor: pointer; font-size: 13px; color: var(--ink);
}
.btn-add:hover { background: #F0EDE5; }
.empty-state { color: var(--ink-soft); font-size: 13px; }
.meal-list { display: flex; flex-direction: column; gap: 6px; }
.meal-row {
  display: flex; align-items: center; justify-content: space-between;
  border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px;
  cursor: pointer; font-size: 13px;
}
.meal-row:hover { background: #F6F4EF; }
.meal-name { color: var(--ink); }
.meal-type { color: var(--ink-soft); font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
</style>
