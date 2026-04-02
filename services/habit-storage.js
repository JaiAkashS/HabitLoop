function createDateKey(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function getRecentDates(count) {
  return Array.from({ length: count }, (_, index) => createDateKey(index)).sort();
}

function getPatternDates(totalDays, predicate) {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < totalDays; i += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (predicate(i, date)) {
      dates.push(date.toISOString().slice(0, 10));
    }
  }

  return dates.sort();
}

function createDemoHabits() {
  return [
    {
      id: 'demo-run',
      name: 'Morning Run',
      createdAt: createDateKey(30),
      completionDates: getPatternDates(30, (i, date) => i < 24 && date.getDay() >= 1 && date.getDay() <= 5),
    },
    {
      id: 'demo-read',
      name: 'Read 30 Minutes',
      createdAt: createDateKey(20),
      completionDates: getRecentDates(14),
    },
    {
      id: 'demo-water',
      name: 'Drink 2L Water',
      createdAt: createDateKey(30),
      completionDates: getPatternDates(30, (i) => i !== 9 && i !== 17 && i !== 23),
    },
    {
      id: 'demo-meditate',
      name: 'Meditate',
      createdAt: createDateKey(18),
      completionDates: getPatternDates(18, (i, date) => i < 15 && date.getDay() !== 0),
    },
  ];
}

let habitsStore = createDemoHabits();

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function ensureUniqueDates(dates) {
  return [...new Set(dates)].sort();
}

export async function getHabits() {
  return habitsStore.map((habit) => ({
    ...habit,
    completionDates: ensureUniqueDates(habit.completionDates ?? []),
  }));
}

export async function createHabit(name) {
  const nextHabit = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    createdAt: new Date().toISOString(),
    completionDates: [],
  };

  habitsStore = [nextHabit, ...habitsStore];
  return getHabits();
}

export async function updateHabitName(id, name) {
  habitsStore = habitsStore.map((habit) =>
    habit.id === id
      ? {
        ...habit,
        name,
      }
      : habit,
  );

  return getHabits();
}

export async function deleteHabit(id) {
  habitsStore = habitsStore.filter((habit) => habit.id !== id);
  return getHabits();
}

export async function toggleHabitCompletion(id, dateKey = getTodayKey()) {
  habitsStore = habitsStore.map((habit) => {
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

  return getHabits();
}

export async function seedDemoHabits() {
  habitsStore = createDemoHabits();
  return getHabits();
}
