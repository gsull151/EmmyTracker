import { computed, reactive, ref } from 'vue';
import { fetchMealPlanEntries, upsertMealPlanEntry, deleteMealPlanEntry } from '../services/mealPlanService';
import { useMeals } from './useMeals';

function fmtDateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function sundayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return fmtDateKey(d);
}

const weekStart = ref(sundayOf(new Date()));
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
      planByDate[row.entry_date] = { id: row.id, dinner_meal_id: row.dinner_meal_id };
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
  weekStart.value = sundayOf(new Date());
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

async function setDayMeal(dateKey, mealId, userId) {
  saveStatus.value = 'Saving...';
  try {
    if (!userId) throw new Error('Not signed in — please sign in again.');

    const existing = planByDate[dateKey];

    if (!mealId) {
      if (existing && existing.id) {
        const { error } = await deleteMealPlanEntry(existing.id);
        if (error) throw error;
      }
      delete planByDate[dateKey];
    } else {
      const { data, error } = await upsertMealPlanEntry({
        entry_date: dateKey,
        dinner_meal_id: mealId,
        user_id: userId
      });
      if (error) throw error;
      planByDate[dateKey] = { id: data.id, dinner_meal_id: data.dinner_meal_id };
    }

    saveStatus.value = 'Saved';
    setTimeout(() => { if (saveStatus.value === 'Saved') saveStatus.value = ''; }, 1200);
  } catch (err) {
    saveStatus.value = 'Error: ' + (err && err.message ? err.message : String(err));
  }
}

function randomizeDay(dateKey, userId) {
  const candidates = useMeals().mealsByType('dinner');
  if (!candidates.length) {
    saveStatus.value = 'No dinner meals yet — add one first.';
    return;
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  setDayMeal(dateKey, pick.id, userId);
}

function dayMeal(dateKey) {
  const entry = planByDate[dateKey];
  if (!entry || !entry.dinner_meal_id) return null;
  return useMeals().meals.value.find(m => m.id === entry.dinner_meal_id) || null;
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
    setDayMeal,
    randomizeDay,
    dayMeal
  };
}
