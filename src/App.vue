<script setup>
import { onMounted, ref } from 'vue';
import AuthScreen from './components/AuthScreen.vue';
import StatsGrid from './components/StatsGrid.vue';
import CalendarGrid from './components/CalendarGrid.vue';
import EntryEditor from './components/EntryEditor.vue';
import RecentLog from './components/RecentLog.vue';
import MealLibrary from './components/MealLibrary.vue';
import MealEditor from './components/MealEditor.vue';
import WeeklyPlanGrid from './components/WeeklyPlanGrid.vue';
import DayMealEditor from './components/DayMealEditor.vue';
import GroceryList from './components/GroceryList.vue';
import { useAuth } from './composables/useAuth';
import { useSchedule } from './composables/useSchedule';
import { useMeals } from './composables/useMeals';
import { useWeeklyPlan } from './composables/useWeeklyPlan';

const { currentUser, initAuth, signOut } = useAuth();
const { loadSchedule } = useSchedule();
const { loadMeals } = useMeals();
const { loadWeekPlan } = useWeeklyPlan();

const activeTab = ref('schedule');

onMounted(() => {
  initAuth(() => {
    loadSchedule();
    loadMeals();
    loadWeekPlan();
  });
});
</script>

<template>
  <AuthScreen v-if="!currentUser" />
  <div v-else class="wrap">
    <div class="signout" @click="signOut">Sign out</div>
    <h1>Emmy's schedule</h1>
    <p class="subtitle">Tracking overnights and daytime visits under the parenting plan</p>

    <div class="tabs">
      <button :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">Schedule</button>
      <button :class="{ active: activeTab === 'mealplan' }" @click="activeTab = 'mealplan'">Meal Plan</button>
    </div>

    <div v-show="activeTab === 'schedule'">
      <div class="card"><StatsGrid /></div>

      <div class="card">
        <CalendarGrid />
        <EntryEditor />
      </div>

      <div class="card">
        <RecentLog />
      </div>
    </div>

    <div v-show="activeTab === 'mealplan'">
      <div class="card">
        <WeeklyPlanGrid />
        <DayMealEditor />
      </div>
      <div class="card"><GroceryList /></div>
      <div class="card">
        <MealLibrary />
        <MealEditor />
      </div>
    </div>
  </div>
</template>

<style scoped>
.signout { font-size: 12px; color: var(--ink-soft); text-align: right; margin-bottom: 10px; cursor: pointer; text-decoration: underline; }
.tabs { display: flex; gap: 8px; margin-bottom: 18px; }
.tabs button {
  flex: 1; border: 1px solid var(--line); background: var(--card); border-radius: 8px;
  padding: 8px 6px; font-size: 13px; cursor: pointer; color: var(--ink-soft);
}
.tabs button.active { background: var(--ink); color: white; border-color: var(--ink); font-weight: 600; }
</style>
