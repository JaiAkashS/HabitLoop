import { getTodayKey } from '../services/habit-storage';

function shiftDate(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function getCurrentStreak(completionDates, fromDate = new Date()) {
  const completed = new Set(completionDates);
  let cursor = new Date(fromDate);
  let streak = 0;

  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

export function getLongestStreak(completionDates) {
  if (!completionDates.length) {
    return 0;
  }

  const uniqueSorted = [...new Set(completionDates)].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueSorted.length; index += 1) {
    const prev = new Date(uniqueSorted[index - 1]);
    const currentDate = new Date(uniqueSorted[index]);
    const diffInDays = Math.round((currentDate.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function getCompletionRate(habit) {
  const startDate = new Date(habit.createdAt);
  const today = new Date(getTodayKey());
  const totalDays = Math.max(
    1,
    Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  return Math.round((habit.completionDates.length / totalDays) * 100);
}

export function getLastSevenDaysLabel() {
  const labels = [];
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = shiftDate(today, -offset);
    labels.push(date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3));
  }

  return labels;
}

export function getLastSevenDaysTotals(habits) {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    const key = toDateKey(shiftDate(today, -offset));

    return habits.reduce(
      (count, habit) => (habit.completionDates.includes(key) ? count + 1 : count),
      0,
    );
  });
}
