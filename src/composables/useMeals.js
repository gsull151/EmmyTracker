import { reactive, ref } from 'vue';
import { fetchMeals, insertMeal, updateMeal, deleteMeal } from '../services/mealPlanService';

const meals = ref([]);
const mealDraft = reactive({ id: null, name: '', meal_type: 'dinner', ingredients: '', instructions: '' });
const isMealFormOpen = ref(false);
const saveStatus = ref('');

async function loadMeals() {
  const { data, error } = await fetchMeals();
  if (!error && data) meals.value = data;
}

function resetDraft() {
  mealDraft.id = null;
  mealDraft.name = '';
  mealDraft.meal_type = 'dinner';
  mealDraft.ingredients = '';
  mealDraft.instructions = '';
}

function startNewMeal() {
  resetDraft();
  isMealFormOpen.value = true;
  saveStatus.value = '';
}

function startEditMeal(meal) {
  mealDraft.id = meal.id;
  mealDraft.name = meal.name;
  mealDraft.meal_type = meal.meal_type;
  mealDraft.ingredients = meal.ingredients || '';
  mealDraft.instructions = meal.instructions || '';
  isMealFormOpen.value = true;
  saveStatus.value = '';
}

function cancelMealForm() {
  isMealFormOpen.value = false;
  resetDraft();
  saveStatus.value = '';
}

async function saveMeal(userId) {
  if (!mealDraft.name.trim()) {
    saveStatus.value = 'Name is required.';
    return;
  }
  saveStatus.value = 'Saving...';

  try {
    if (!userId) throw new Error('Not signed in — please sign in again.');

    const fields = {
      name: mealDraft.name.trim(),
      meal_type: mealDraft.meal_type,
      ingredients: mealDraft.ingredients,
      instructions: mealDraft.instructions
    };

    if (mealDraft.id) {
      const { data, error } = await updateMeal(mealDraft.id, fields);
      if (error) throw error;
      const idx = meals.value.findIndex(m => m.id === mealDraft.id);
      if (idx !== -1) meals.value[idx] = data;
    } else {
      const { data, error } = await insertMeal({ ...fields, user_id: userId });
      if (error) throw error;
      meals.value.push(data);
    }

    meals.value.sort((a, b) => a.name.localeCompare(b.name));
    isMealFormOpen.value = false;
    resetDraft();
    saveStatus.value = '';
  } catch (err) {
    saveStatus.value = 'Error: ' + (err && err.message ? err.message : String(err));
  }
}

async function removeMeal(id) {
  const { error } = await deleteMeal(id);
  if (error) {
    saveStatus.value = 'Error: ' + error.message;
    return;
  }
  meals.value = meals.value.filter(m => m.id !== id);
  if (mealDraft.id === id) cancelMealForm();
}

function mealsByType(type) {
  return meals.value.filter(m => m.meal_type === type);
}

export function useMeals() {
  return {
    meals,
    mealDraft,
    isMealFormOpen,
    saveStatus,
    loadMeals,
    startNewMeal,
    startEditMeal,
    cancelMealForm,
    saveMeal,
    removeMeal,
    mealsByType
  };
}
