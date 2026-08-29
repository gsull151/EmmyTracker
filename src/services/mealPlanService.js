import { supabase } from './supabaseService';

// Meals — shared library, unfiltered reads like schedule_entries.
export function fetchMeals() {
  return supabase.from('meals').select('*').order('name');
}

export function insertMeal(meal) {
  return supabase.from('meals').insert(meal).select().single();
}

export function updateMeal(id, updates) {
  return supabase.from('meals').update(updates).eq('id', id).select().single();
}

export function deleteMeal(id) {
  return supabase.from('meals').delete().eq('id', id);
}

// Meal plan entries — one row per calendar date (dinner only, for now),
// same shape as schedule_entries: upserted by entry_date.
export function fetchMealPlanEntries(startDate, endDate) {
  return supabase.from('meal_plan_entries').select('*').gte('entry_date', startDate).lte('entry_date', endDate);
}

export function upsertMealPlanEntry(entry) {
  return supabase.from('meal_plan_entries').upsert(entry, { onConflict: 'entry_date' }).select().single();
}

export function deleteMealPlanEntry(id) {
  return supabase.from('meal_plan_entries').delete().eq('id', id);
}
