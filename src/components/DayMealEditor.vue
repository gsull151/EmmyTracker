<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useMeals } from '../composables/useMeals';
import { useWeeklyPlan } from '../composables/useWeeklyPlan';

const { currentUser } = useAuth();
const { mealsByType } = useMeals();
const { selectedDate, planByDate, saveStatus, setDayMealType, randomizeDayType, clearDay, closeDay } = useWeeklyPlan();

const slots = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'dinner', label: 'Dinner' }
];

const editorEl = ref(null);

watch(selectedDate, async (val) => {
  if (val) {
    await nextTick();
    editorEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

const editDateLabel = computed(() => {
  if (!selectedDate.value) return '';
  const dateObj = new Date(selectedDate.value + 'T00:00:00');
  return dateObj.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
});

function mealsFor(type) {
  return mealsByType(type);
}

function selectedIdFor(type) {
  const entry = selectedDate.value && planByDate[selectedDate.value];
  return entry ? entry[type + '_meal_id'] || '' : '';
}

function onSelect(type, event) {
  setDayMealType(selectedDate.value, type, event.target.value || null, currentUser.value?.id);
}

function onShuffle(type) {
  randomizeDayType(selectedDate.value, type, currentUser.value?.id);
}

function onClearDay() {
  clearDay(selectedDate.value, currentUser.value?.id);
}
</script>

<template>
  <div v-show="selectedDate" ref="editorEl" class="editor">
    <div class="edit-date">{{ editDateLabel }}</div>

    <div class="picker-row" v-for="slot in slots" :key="slot.type">
      <label class="slot-label">{{ slot.label }}</label>
      <select :value="selectedIdFor(slot.type)" @change="onSelect(slot.type, $event)">
        <option value="">— none —</option>
        <option v-for="meal in mealsFor(slot.type)" :key="meal.id" :value="meal.id">{{ meal.name }}</option>
      </select>
      <button class="btn-shuffle" :title="`Pick a random ${slot.type}`" @click="onShuffle(slot.type)">🎲</button>
    </div>

    <div class="editor-actions">
      <button class="btn-clear" @click="onClearDay">Clear day</button>
      <button class="btn-close" @click="closeDay">Close</button>
    </div>
    <div class="save-status">{{ saveStatus }}</div>
  </div>
</template>

<style scoped>
.editor { margin-top: 16px; border-top: 1px solid var(--line); padding-top: 16px; }
.edit-date { font-weight: 600; margin-bottom: 10px; }
.picker-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.slot-label { width: 68px; flex-shrink: 0; font-size: 13px; color: var(--ink-soft); }
.picker-row select {
  flex: 1; min-width: 0; border: 1px solid var(--line); border-radius: 8px; padding: 7px 8px;
  font-family: inherit; font-size: 13px; color: var(--ink); background: var(--card);
}
.btn-shuffle {
  border: 1px solid var(--line); background: var(--card); border-radius: 8px;
  padding: 6px 10px; cursor: pointer; font-size: 14px;
}
.btn-shuffle:hover { background: #F0EDE5; }
.editor-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
.editor-actions button { border: 1px solid var(--line); border-radius: 8px; padding: 7px 14px; font-size: 13px; cursor: pointer; }
.btn-clear { background: var(--card); color: #B23B3B; border-color: #E0B9B9; margin-right: auto; }
.btn-close { background: var(--ink); color: white; border-color: var(--ink); }
.save-status { font-size: 12px; color: var(--ink-soft); text-align: right; min-height: 16px; margin-top: 4px; }
</style>
