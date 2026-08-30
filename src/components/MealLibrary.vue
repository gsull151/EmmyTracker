<script setup>
import { computed, ref } from 'vue';
import { useMeals } from '../composables/useMeals';

const { mealDraft, isMealFormOpen, startNewMeal, startEditMeal, cancelMealForm, mealsByType } = useMeals();

const types = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' }
];
const activeType = ref('dinner');

const visibleMeals = computed(() => mealsByType(activeType.value));

function isSelected(meal) {
  return isMealFormOpen.value && mealDraft.id === meal.id;
}

function selectType(type) {
  if (activeType.value === type) return;
  activeType.value = type;
  cancelMealForm();
}
</script>

<template>
  <div class="library-header">
    <div class="library-title">Meal library</div>
    <button class="btn-add" @click="startNewMeal(activeType)">+ Add meal</button>
  </div>

  <div class="type-tabs">
    <button
      v-for="type in types"
      :key="type.key"
      :class="{ active: activeType === type.key }"
      @click="selectType(type.key)"
    >{{ type.label }}</button>
  </div>

  <div v-if="!visibleMeals.length" class="empty-state">No {{ activeType }} meals saved yet — add one to start building your rotation.</div>
  <div v-else class="meal-list">
    <div
      v-for="meal in visibleMeals"
      :key="meal.id"
      class="meal-row"
      :class="{ selected: isSelected(meal) }"
      @click="startEditMeal(meal)"
    >
      <span class="meal-name">{{ meal.name }}</span>
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

.type-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.type-tabs button {
  flex: 1; border: 1px solid var(--line); background: var(--card); border-radius: 8px;
  padding: 7px 6px; font-size: 13px; cursor: pointer; color: var(--ink-soft);
}
.type-tabs button.active { background: var(--ink); color: white; border-color: var(--ink); font-weight: 600; }

.empty-state { color: var(--ink-soft); font-size: 13px; }
.meal-list { display: flex; flex-direction: column; gap: 6px; }
.meal-row {
  display: flex; align-items: center; justify-content: space-between;
  border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px;
  cursor: pointer; font-size: 13px;
}
.meal-row:hover { background: #F6F4EF; }
.meal-row.selected { box-shadow: 0 0 0 2px var(--ink); border-color: var(--ink); }
.meal-name { color: var(--ink); }
</style>
