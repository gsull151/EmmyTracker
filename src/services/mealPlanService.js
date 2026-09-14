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

// Meal plan entries — one row per calendar date (breakfast/lunch/dinner),
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

// Grocery items — ad-hoc shopping list entries scoped to a week, shared
// like everything else. Multiple rows per week_start (not upserted).
export function fetchGroceryItems(weekStart) {
  return supabase.from('grocery_items').select('*').eq('week_start', weekStart).order('created_at');
}

export function insertGroceryItem(item) {
  return supabase.from('grocery_items').insert(item).select().single();
}

export function updateGroceryItem(id, updates) {
  return supabase.from('grocery_items').update(updates).eq('id', id).select().single();
}

export function deleteGroceryItem(id) {
  return supabase.from('grocery_items').delete().eq('id', id);
}
