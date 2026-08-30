import { computed, reactive, ref } from 'vue';
import { fetchMealPlanEntries, upsertMealPlanEntry, deleteMealPlanEntry } from '../services/mealPlanService';
import { useMeals } from './useMeals';

const MEAL_TYPE_COLUMN = { breakfast: 'breakfast_meal_id', lunch: 'lunch_meal_id', dinner: 'dinner_meal_id' };

function fmtDateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return fmtDateKey(d);
}

function emptyEntry() {
  return { id: null, breakfast_meal_id: null, lunch_meal_id: null, dinner_meal_id: null };
}

const weekStart = ref(mondayOf(new Date()));
const planByDate = reactive({});
const selectedDate = ref(null);
const saveStatus = ref('');

const weekDates = computed(() => {
  const [y, m, d] = weekStart.value.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    dates.push(fmtDateKey(day));
  }
  return dates;
});

async function loadWeekPlan() {
  Object.keys(planByDate).forEach(k => delete planByDate[k]);
  saveStatus.value = '';

  const dates = weekDates.value;
  const { data, error } = await fetchMealPlanEntries(dates[0], dates[6]);
  if (!error && data) {
    data.forEach(row => {
      planByDate[row.entry_date] = {
        id: row.id,
        breakfast_meal_id: row.breakfast_meal_id,
        lunch_meal_id: row.lunch_meal_id,
        dinner_meal_id: row.dinner_meal_id
      };
    });
  }
}

function shiftWeek(days) {
  const [y, m, d] = weekStart.value.split('-').map(Number);
  const next = new Date(y, m - 1, d + days);
  weekStart.value = fmtDateKey(next);
  selectedDate.value = null;
  loadWeekPlan();
}

function prevWeek() {
  shiftWeek(-7);
}

function nextWeek() {
  shiftWeek(7);
}

function goToThisWeek() {
  weekStart.value = mondayOf(new Date());
  selectedDate.value = null;
  loadWeekPlan();
}

function openDay(dateKey) {
  selectedDate.value = dateKey;
  saveStatus.value = '';
}

function closeDay() {
  selectedDate.value = null;
}

async function setDayMealType(dateKey, mealType, mealId, userId) {
  const column = MEAL_TYPE_COLUMN[mealType];
  saveStatus.value = 'Saving...';
  try {
    if (!userId) throw new Error('Not signed in — please sign in again.');

    const existing = planByDate[dateKey] || emptyEntry();
    const updated = { ...existing, [column]: mealId || null };
    const isEmpty = !updated.breakfast_meal_id && !updated.lunch_meal_id && !updated.dinner_meal_id;

    if (isEmpty) {
      if (existing.id) {
        const { error } = await deleteMealPlanEntry(existing.id);
        if (error) throw error;
      }
      delete planByDate[dateKey];
    } else {
      const { data, error } = await upsertMealPlanEntry({
        entry_date: dateKey,
        breakfast_meal_id: updated.breakfast_meal_id,
        lunch_meal_id: updated.lunch_meal_id,
        dinner_meal_id: updated.dinner_meal_id,
        user_id: userId
      });
      if (error) throw error;
      planByDate[dateKey] = {
        id: data.id,
        breakfast_meal_id: data.breakfast_meal_id,
        lunch_meal_id: data.lunch_meal_id,
        dinner_meal_id: data.dinner_meal_id
      };
    }

    saveStatus.value = 'Saved';
    setTimeout(() => { if (saveStatus.value === 'Saved') saveStatus.value = ''; }, 1200);
  } catch (err) {
    saveStatus.value = 'Error: ' + (err && err.message ? err.message : String(err));
  }
}

async function clearDay(dateKey, userId) {
  const existing = planByDate[dateKey];
  if (!existing || !existing.id) {
    delete planByDate[dateKey];
    return;
  }
  saveStatus.value = 'Saving...';
  try {
    if (!userId) throw new Error('Not signed in — please sign in again.');
    const { error } = await deleteMealPlanEntry(existing.id);
    if (error) throw error;
    delete planByDate[dateKey];
    saveStatus.value = 'Saved';
    setTimeout(() => { if (saveStatus.value === 'Saved') saveStatus.value = ''; }, 1200);
  } catch (err) {
    saveStatus.value = 'Error: ' + (err && err.message ? err.message : String(err));
  }
}

function randomizeDayType(dateKey, mealType, userId) {
  const candidates = useMeals().mealsByType(mealType);
  if (!candidates.length) {
    saveStatus.value = `No ${mealType} meals yet — add one first.`;
    return;
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  setDayMealType(dateKey, mealType, pick.id, userId);
}

function dayMealByType(dateKey, mealType) {
  const entry = planByDate[dateKey];
  const id = entry && entry[MEAL_TYPE_COLUMN[mealType]];
  if (!id) return null;
  return useMeals().meals.value.find(m => m.id === id) || null;
}

function dayMeal(dateKey) {
  return dayMealByType(dateKey, 'dinner');
}

export function useWeeklyPlan() {
  return {
    weekStart,
    weekDates,
    planByDate,
    selectedDate,
    saveStatus,
    loadWeekPlan,
    prevWeek,
    nextWeek,
    goToThisWeek,
    openDay,
    closeDay,
    setDayMealType,
    clearDay,
    randomizeDayType,
    dayMealByType,
    dayMeal
  };
}
