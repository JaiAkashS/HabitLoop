# HabitLoop

HabitLoop is a cross-platform habit tracking mobile app built with React Native and Expo.

## Features

- Full local persistence with AsyncStorage.
- Habit CRUD support:
   - Create habits.
   - Read and display saved habits.
   - Update habit names.
   - Delete habits.
- Daily completion toggles per habit.
- Streak and consistency tracking:
   - Current streak.
   - Longest streak.
   - Completion percentage over time.
- Chart-based insights (last 7 days completion activity) using react-native-chart-kit.

## Tech Stack

- Expo + React Native
- Expo Router
- JavaScript
- AsyncStorage
- react-native-chart-kit + react-native-svg

## Run Locally

1. Install dependencies.

```bash
npm install
```

2. Start the Expo dev server.

```bash
npm start
```

3. Open in Android, iOS, or web from the Expo CLI options.
