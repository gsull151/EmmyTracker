<script setup>
import { computed, reactive, ref } from 'vue';
import { useWeeklyPlan } from '../composables/useWeeklyPlan';

const { weekDates, dayMeal } = useWeeklyPlan();
const checked = reactive(new Set());
const extraItems = reactive([]);
const newItemText = ref('');

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

function addExtraItem() {
  const text = newItemText.value.trim();
  if (!text) return;
  extraItems.push({ text, checked: false });
  newItemText.value = '';
}

function removeExtraItem(index) {
  extraItems.splice(index, 1);
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

  <div class="grocery-group extra-group">
    <div class="group-heading">Other items</div>
    <label v-for="(item, i) in extraItems" :key="i" class="grocery-item extra-item">
      <input type="checkbox" v-model="item.checked" />
      <span :class="{ done: item.checked }">{{ item.text }}</span>
      <button class="btn-remove" title="Remove" @click="removeExtraItem(i)">&times;</button>
    </label>
    <form class="add-item-row" @submit.prevent="addExtraItem">
      <input v-model="newItemText" type="text" placeholder="Add an item..." />
      <button type="submit" class="btn-add-item">Add</button>
    </form>
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

.extra-group { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line); }
.extra-item { justify-content: flex-start; }
.extra-item span { flex: 1; }
.btn-remove {
  border: none; background: none; color: var(--ink-soft); font-size: 16px;
  cursor: pointer; line-height: 1; padding: 0 4px;
}
.btn-remove:hover { color: #B23B3B; }
.add-item-row { display: flex; gap: 8px; margin-top: 8px; }
.add-item-row input {
  flex: 1; border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px;
  font-family: inherit; font-size: 13px; box-sizing: border-box;
}
.btn-add-item {
  border: 1px solid var(--line); background: var(--card); border-radius: 8px;
  padding: 7px 14px; font-size: 13px; cursor: pointer; color: var(--ink);
}
.btn-add-item:hover { background: #F0EDE5; }
</style>
