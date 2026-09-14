import { ref, watch } from 'vue';
import { fetchGroceryItems, insertGroceryItem, updateGroceryItem, deleteGroceryItem } from '../services/mealPlanService';
import { useWeeklyPlan } from './useWeeklyPlan';

const items = ref([]);
const saveStatus = ref('');

async function loadGroceryItems() {
  const { weekStart } = useWeeklyPlan();
  const { data, error } = await fetchGroceryItems(weekStart.value);
  if (!error && data) items.value = data;
}

// Reload whenever the viewed week changes (prev/next/this week nav).
watch(useWeeklyPlan().weekStart, () => loadGroceryItems());

async function addItem(text, userId) {
  const trimmed = text.trim();
  if (!trimmed) return;
  try {
    if (!userId) throw new Error('Not signed in — please sign in again.');
    const { weekStart } = useWeeklyPlan();
    const { data, error } = await insertGroceryItem({ week_start: weekStart.value, text: trimmed, user_id: userId });
    if (error) throw error;
    items.value.push(data);
  } catch (err) {
    saveStatus.value = 'Error: ' + (err && err.message ? err.message : String(err));
  }
}

async function toggleItem(item) {
  const next = !item.checked;
  item.checked = next;
  const { error } = await updateGroceryItem(item.id, { checked: next });
  if (error) {
    item.checked = !next;
    saveStatus.value = 'Error: ' + error.message;
  }
}

async function removeItem(item) {
  const { error } = await deleteGroceryItem(item.id);
  if (error) {
    saveStatus.value = 'Error: ' + error.message;
    return;
  }
  items.value = items.value.filter(i => i.id !== item.id);
}

export function useGroceryItems() {
  return {
    items,
    saveStatus,
    loadGroceryItems,
    addItem,
    toggleItem,
    removeItem
  };
}
