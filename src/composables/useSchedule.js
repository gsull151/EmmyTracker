import { reactive, ref } from 'vue';
import {
  fetchScheduleEntries,
  upsertScheduleEntries,
  upsertScheduleEntry,
  deleteScheduleEntry
} from '../services/supabaseService';

// Entries added via chat land here. On first sign-in after adding new ones,
// they're upserted into Supabase (without touching anything already saved).
// Safe to leave in place or replace next time new dates are added.
const SEED_ENTRIES = {
  '2026-07-01': { type: 'overnight', note: 'Upper Peninsula, Michigan trip' },
  '2026-07-02': { type: 'overnight', note: 'Upper Peninsula, Michigan trip' },
  '2026-07-03': { type: 'overnight', note: 'Upper Peninsula, Michigan trip' },
  '2026-07-04': { type: 'overnight', note: 'Upper Peninsula, Michigan trip' },
  '2026-07-05': { type: 'overnight', note: 'Upper Peninsula, Michigan trip' },
  '2026-07-06': { type: 'overnight', note: 'Upper Peninsula, Michigan trip' },
  '2026-07-08': { type: 'overnight', note: '' },
  '2026-07-09': { type: 'overnight', note: '' },
  '2026-07-10': { type: 'overnight', note: '' },
  '2026-07-11': { type: 'overnight', note: '' },
  '2026-07-12': { type: 'day-visit', note: "Slept at a friend's house that night (12th-13th)" },
  '2026-07-16': { type: 'overnight', note: 'Michigan trip' },
  '2026-07-17': { type: 'overnight', note: 'Michigan trip' },
  '2026-07-18': { type: 'overnight', note: 'Michigan trip' },
  '2026-07-19': { type: 'day-visit', note: 'Michigan trip, went home Sunday afternoon' }
};

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

  const missing = Object.keys(SEED_ENTRIES).filter(k => !schedule[k]);
  if (missing.length > 0) {
    const rows = missing.map(k => ({
      user_id: userId,
      entry_date: k,
      type: SEED_ENTRIES[k].type,
      note: SEED_ENTRIES[k].note || ''
    }));
    const { data: inserted, error: insertErr } = await upsertScheduleEntries(rows);
    if (!insertErr && inserted) {
      inserted.forEach(row => {
        schedule[row.entry_date] = { type: row.type, note: row.note || '', id: row.id };
      });
    }
  }
}

async function commitEntry(userId) {
  if (!selectedDate.value) return;
  saveStatus.value = 'Saving...';

  try {
    if (!userId) throw new Error('Not signed in — please sign in again.');

    let error = null;
    const note = noteDraft.value.trim();

    if (pendingType.value === 'none') {
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
