import { reactive, ref } from 'vue';
import { fetchScheduleEntries, upsertScheduleEntry, deleteScheduleEntry } from '../services/supabaseService';

const schedule = reactive({});
const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());
const selectedDate = ref(null);
const pendingType = ref('none');
const noteDraft = ref('');
const saveStatus = ref('');

function fmtDateKey(y, m, d) {
  return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

async function loadSchedule(userId) {
  Object.keys(schedule).forEach(k => delete schedule[k]);

  const { data, error } = await fetchScheduleEntries(userId);
  if (!error && data) {
    data.forEach(row => {
      schedule[row.entry_date] = { type: row.type, note: row.note || '', id: row.id };
    });
  }
}

async function commitEntry(userId) {
  if (!selectedDate.value) return;
  saveStatus.value = 'Saving...';

  try {
    if (!userId) throw new Error('Not signed in — please sign in again.');

    let error = null;
    const note = noteDraft.value.trim();

    if (pendingType.value === 'none' && !note) {
      const existing = schedule[selectedDate.value];
      if (existing && existing.id) {
        ({ error } = await deleteScheduleEntry(existing.id));
      }
      if (!error) delete schedule[selectedDate.value];
    } else {
      const { data, error: upsertError } = await upsertScheduleEntry({
        user_id: userId,
        entry_date: selectedDate.value,
        type: pendingType.value,
        note
      });
      error = upsertError;
      if (!error && data) {
        schedule[selectedDate.value] = { type: data.type, note: data.note || '', id: data.id };
      }
    }

    if (error) {
      saveStatus.value = 'Error: ' + error.message;
    } else {
      saveStatus.value = 'Saved';
      setTimeout(() => { if (saveStatus.value === 'Saved') saveStatus.value = ''; }, 1200);
    }
  } catch (err) {
    saveStatus.value = 'Error: ' + (err && err.message ? err.message : String(err));
  }
}

async function openEditor(key, userId) {
  if (selectedDate.value && selectedDate.value !== key) {
    await commitEntry(userId);
  }
  selectedDate.value = key;
  const entry = schedule[key];
  pendingType.value = entry ? entry.type : 'none';
  noteDraft.value = entry && entry.note ? entry.note : '';
  saveStatus.value = '';
}

async function closeEditor(userId) {
  await commitEntry(userId);
  selectedDate.value = null;
}

function computeStats() {
  const keys = Object.keys(schedule);
  let overnightTotal = 0, dayTotal = 0, overnightMonth = 0, dayMonth = 0;
  keys.forEach(k => {
    const entry = schedule[k];
    const [y, m] = k.split('-').map(Number);
    const isOvernight = entry.type === 'overnight' || entry.type === 'both';
    const isDay = entry.type === 'day-visit' || entry.type === 'both';
    if (isOvernight) overnightTotal++;
    if (isDay) dayTotal++;
    if (y === viewYear.value && (m - 1) === viewMonth.value) {
      if (isOvernight) overnightMonth++;
      if (isDay) dayMonth++;
    }
  });
  return { overnightTotal, dayTotal, overnightMonth, dayMonth };
}

export function useSchedule() {
  return {
    schedule,
    viewYear,
    viewMonth,
    selectedDate,
    pendingType,
    noteDraft,
    saveStatus,
    fmtDateKey,
    loadSchedule,
    commitEntry,
    openEditor,
    closeEditor,
    computeStats
  };
}
