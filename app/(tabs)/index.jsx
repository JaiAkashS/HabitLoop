import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    createHabit,
    deleteHabit,
    getHabits,
    getTodayKey,
    toggleHabitCompletion,
    updateHabitName,
} from '../../services/habit-storage';
import { getCompletionRate, getCurrentStreak } from '../../utils/habit-metrics';

export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState('');
  const [loading, setLoading] = useState(true);

  const todayKey = useMemo(() => getTodayKey(), []);

  useEffect(() => {
    void loadHabits();
  }, []);

  async function loadHabits() {
    setLoading(true);
    const storedHabits = await getHabits();
    setHabits(storedHabits);
    setLoading(false);
  }

  async function handleAddHabit() {
    const trimmedName = newHabitName.trim();

    if (!trimmedName) {
      Alert.alert('Habit name is required', 'Enter a habit name before adding.');
      return;
    }

    const nextHabits = await createHabit(trimmedName);
    setHabits(nextHabits);
    setNewHabitName('');
  }

  async function handleToggleToday(habitId) {
    const nextHabits = await toggleHabitCompletion(habitId, todayKey);
    setHabits(nextHabits);
  }

  async function handleDelete(habitId) {
    const nextHabits = await deleteHabit(habitId);
    setHabits(nextHabits);
  }

  async function handleSaveEdit(habitId) {
    const trimmedName = editingHabitName.trim();

    if (!trimmedName) {
      Alert.alert('Habit name is required', 'Enter a habit name before saving.');
      return;
    }

    const nextHabits = await updateHabitName(habitId, trimmedName);
    setHabits(nextHabits);
    setEditingHabitId(null);
    setEditingHabitName('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>HabitLoop</Text>
        <Text style={styles.subtitle}>Track daily habits, protect streaks, and grow consistency.</Text>

        <View style={styles.inputRow}>
          <TextInput
            value={newHabitName}
            onChangeText={setNewHabitName}
            placeholder="Add a habit"
            placeholderTextColor="#8796A5"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={() => {
              void handleAddHabit();
            }}
          />
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              void handleAddHabit();
            }}>
            <Text style={styles.primaryButtonText}>Add</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#0B8B74" />
          </View>
        ) : null}

        {!loading && habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>Start by adding one habit to begin building a streak.</Text>
          </View>
        ) : null}

        {habits.map((habit) => {
          const isCompletedToday = habit.completionDates.includes(todayKey);

          return (
            <View key={habit.id} style={styles.habitCard}>
              {editingHabitId === habit.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    value={editingHabitName}
                    onChangeText={setEditingHabitName}
                    style={styles.editInput}
                    placeholder="Edit habit name"
                    placeholderTextColor="#8796A5"
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      void handleSaveEdit(habit.id);
                    }}
                  />
                  <View style={styles.rowButtons}>
                    <Pressable
                      style={styles.ghostButton}
                      onPress={() => {
                        setEditingHabitId(null);
                        setEditingHabitName('');
                      }}>
                      <Text style={styles.ghostButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={styles.primaryButtonSmall}
                      onPress={() => {
                        void handleSaveEdit(habit.id);
                      }}>
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <View style={styles.metricsRow}>
                    <Text style={styles.metricText}>Current streak: {getCurrentStreak(habit.completionDates)} days</Text>
                    <Text style={styles.metricText}>Consistency: {getCompletionRate(habit)}%</Text>
                  </View>
                  <View style={styles.rowButtons}>
                    <Pressable
                      style={[styles.statusButton, isCompletedToday ? styles.completedButton : styles.pendingButton]}
                      onPress={() => {
                        void handleToggleToday(habit.id);
                      }}>
                      <Text style={styles.statusButtonText}>{isCompletedToday ? 'Completed Today' : 'Mark Complete'}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.ghostButton}
                      onPress={() => {
                        setEditingHabitId(habit.id);
                        setEditingHabitName(habit.name);
                      }}>
                      <Text style={styles.ghostButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => {
                        void handleDelete(habit.id);
                      }}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C2733',
  },
  subtitle: {
    fontSize: 15,
    color: '#4D5D6D',
    lineHeight: 22,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#16222F',
  },
  primaryButton: {
    backgroundColor: '#0B8B74',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonSmall: {
    backgroundColor: '#0B8B74',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingWrap: {
    paddingVertical: 18,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    color: '#1C2733',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#4D5D6D',
    lineHeight: 20,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    padding: 14,
    gap: 10,
  },
  habitName: {
    color: '#1C2733',
    fontSize: 18,
    fontWeight: '700',
  },
  metricsRow: {
    gap: 4,
  },
  metricText: {
    color: '#4D5D6D',
    fontSize: 13,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  statusButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  completedButton: {
    backgroundColor: '#1EAE8C',
  },
  pendingButton: {
    backgroundColor: '#3A6EA5',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  ghostButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A8B8C8',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ghostButtonText: {
    color: '#33495F',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: {
    borderRadius: 8,
    backgroundColor: '#CB3A31',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  editContainer: {
    gap: 10,
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5DEE8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#16222F',
  },
});
