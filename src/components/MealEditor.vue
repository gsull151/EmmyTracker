<script setup>
import { useAuth } from '../composables/useAuth';
import { useMeals } from '../composables/useMeals';

const { currentUser } = useAuth();
const { mealDraft, isMealFormOpen, saveStatus, cancelMealForm, saveMeal, removeMeal } = useMeals();

async function handleSave() {
  await saveMeal(currentUser.value?.id);
}

async function handleDelete() {
  if (!mealDraft.id) return;
  if (!window.confirm(`Delete "${mealDraft.name}"?`)) return;
  await removeMeal(mealDraft.id);
}
</script>

<template>
  <div v-show="isMealFormOpen" class="editor">
    <div class="edit-title">{{ mealDraft.id ? 'Edit meal' : 'New meal' }}</div>
    <input v-model="mealDraft.name" type="text" placeholder="Meal name" class="name-input" />
    <textarea v-model="mealDraft.ingredients" placeholder="Ingredients — one per line"></textarea>
    <textarea v-model="mealDraft.instructions" placeholder="Instructions"></textarea>
    <div class="editor-actions">
      <button v-if="mealDraft.id" class="btn-delete" @click="handleDelete">Delete</button>
      <button class="btn-close" @click="cancelMealForm">Cancel</button>
      <button class="btn-save" @click="handleSave">Save</button>
    </div>
    <div class="save-status">{{ saveStatus }}</div>
  </div>
</template>

<style scoped>
.editor { margin-top: 16px; border-top: 1px solid var(--line); padding-top: 16px; }
.edit-title { font-weight: 600; margin-bottom: 10px; }
.name-input {
  width: 100%; border: 1px solid var(--line); border-radius: 8px;
  padding: 8px 10px; font-family: inherit; font-size: 13px; margin-bottom: 10px; box-sizing: border-box;
}
textarea {
  width: 100%; min-height: 70px; border: 1px solid var(--line); border-radius: 8px;
  padding: 8px 10px; font-family: inherit; font-size: 13px; resize: vertical; margin-bottom: 10px; box-sizing: border-box;
}
.editor-actions { display: flex; gap: 8px; justify-content: flex-end; }
.editor-actions button { border: 1px solid var(--line); border-radius: 8px; padding: 7px 14px; font-size: 13px; cursor: pointer; }
.btn-save { background: var(--overnight); color: white; border-color: var(--overnight); }
.btn-close { background: var(--card); color: var(--ink); }
.btn-delete { background: var(--card); color: #B23B3B; border-color: #E0B9B9; margin-right: auto; }
.save-status { font-size: 12px; color: var(--ink-soft); text-align: right; min-height: 16px; margin-top: 4px; }
</style>
