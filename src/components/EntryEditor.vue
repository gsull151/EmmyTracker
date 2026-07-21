<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useSchedule } from '../composables/useSchedule';

const { currentUser } = useAuth();
const { selectedDate, pendingType, noteDraft, saveStatus, commitEntry, closeEditor } = useSchedule();

const typeChoices = [
  { type: 'none', label: 'None' },
  { type: 'day-visit', label: 'Day visit' },
  { type: 'overnight', label: 'Overnight' },
  { type: 'both', label: 'Both' }
];

const editorEl = ref(null);
let noteDebounce = null;

watch(noteDraft, () => {
  clearTimeout(noteDebounce);
  noteDebounce = setTimeout(() => commitEntry(currentUser.value?.id), 600);
});

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

async function selectType(type) {
  pendingType.value = type;
  await commitEntry(currentUser.value?.id);
}

async function handleClose() {
  clearTimeout(noteDebounce);
  await closeEditor(currentUser.value?.id);
}

async function handleSave() {
  clearTimeout(noteDebounce);
  await commitEntry(currentUser.value?.id);
}
</script>

<template>
  <div v-show="selectedDate" ref="editorEl" class="editor">
    <div class="edit-date">{{ editDateLabel }}</div>
    <div class="type-choices">
      <button
        v-for="choice in typeChoices"
        :key="choice.type"
        :class="[choice.type, { active: pendingType === choice.type }]"
        @click="selectType(choice.type)"
      >{{ choice.label }}</button>
    </div>
    <textarea v-model="noteDraft" placeholder="Optional note (pickup time, reason for change, etc.)"></textarea>
    <div class="editor-actions">
      <button class="btn-close" @click="handleClose">Close</button>
      <button class="btn-save" @click="handleSave">Save</button>
    </div>
    <div class="save-status">{{ saveStatus }}</div>
  </div>
</template>

<style scoped>
.editor { margin-top: 16px; border-top: 1px solid var(--line); padding-top: 16px; }
.edit-date { font-weight: 600; margin-bottom: 10px; }
.type-choices { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.type-choices button {
  flex: 1; min-width: 90px; border: 1px solid var(--line); background: var(--card);
  border-radius: 8px; padding: 8px 6px; font-size: 13px; cursor: pointer; color: var(--ink);
}
.type-choices button.active.overnight { background: var(--overnight-bg); border-color: var(--overnight); color: var(--overnight-ink); }
.type-choices button.active.day-visit { background: var(--day-bg); border-color: var(--day); color: var(--day-ink); }
.type-choices button.active.both { background: var(--both-bg); border-color: var(--overnight); }
.type-choices button.active.none { background: #EFEFEF; border-color: #B9B9B9; }
textarea {
  width: 100%; min-height: 54px; border: 1px solid var(--line); border-radius: 8px;
  padding: 8px 10px; font-family: inherit; font-size: 13px; resize: vertical; margin-bottom: 10px;
}
.editor-actions { display: flex; gap: 8px; justify-content: flex-end; }
.editor-actions button { border: 1px solid var(--line); border-radius: 8px; padding: 7px 14px; font-size: 13px; cursor: pointer; }
.btn-save { background: var(--overnight); color: white; border-color: var(--overnight); }
.btn-close { background: var(--card); color: var(--ink); }
.save-status { font-size: 12px; color: var(--ink-soft); text-align: right; min-height: 16px; margin-top: 4px; }
</style>
