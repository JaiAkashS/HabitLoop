import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_STORAGE_KEY = 'habitloop:habits';

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function ensureUniqueDates(dates) {
  return [...new Set(dates)].sort();
}

async function saveHabits(habits) {
  await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
}

export async function getHabits() {
  const raw = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed.map((habit) => ({
      ...habit,
      completionDates: ensureUniqueDates(habit.completionDates ?? []),
    }));
  } catch {
    return [];
  }
}

export async function createHabit(name) {
  const habits = await getHabits();
  const nextHabit = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    createdAt: new Date().toISOString(),
    completionDates: [],
  };

  const nextHabits = [nextHabit, ...habits];
  await saveHabits(nextHabits);
  return nextHabits;
}

export async function updateHabitName(id, name) {
  const habits = await getHabits();
  const nextHabits = habits.map((habit) =>
    habit.id === id
      ? {
        ...habit,
        name,
      }
      : habit,
  );

  await saveHabits(nextHabits);
  return nextHabits;
}

export async function deleteHabit(id) {
  const habits = await getHabits();
  const nextHabits = habits.filter((habit) => habit.id !== id);

  await saveHabits(nextHabits);
  return nextHabits;
}

export async function toggleHabitCompletion(id, dateKey = getTodayKey()) {
  const habits = await getHabits();

  const nextHabits = habits.map((habit) => {
    if (habit.id !== id) {
      return habit;
    }

    const hasCompleted = habit.completionDates.includes(dateKey);
    const nextDates = hasCompleted
      ? habit.completionDates.filter((date) => date !== dateKey)
      : [...habit.completionDates, dateKey];

    return {
      ...habit,
      completionDates: ensureUniqueDates(nextDates),
    };
  });

  await saveHabits(nextHabits);
  return nextHabits;
}
