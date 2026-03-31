import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import { getHabits } from '../../services/habit-storage';
import {
    getCompletionRate,
    getCurrentStreak,
    getLastSevenDaysLabel,
    getLastSevenDaysTotals,
    getLongestStreak,
} from '../../utils/habit-metrics';

export default function InsightsScreen() {
  const [habits, setHabits] = useState([]);
  const { width } = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function load() {
        const storedHabits = await getHabits();
        if (isMounted) {
          setHabits(storedHabits);
        }
      }

      void load();

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const lastSevenLabels = useMemo(() => getLastSevenDaysLabel(), []);
  const lastSevenTotals = useMemo(() => getLastSevenDaysTotals(habits), [habits]);
  const avgConsistency = useMemo(() => {
    if (!habits.length) {
      return 0;
    }

    const totalRate = habits.reduce((sum, habit) => sum + getCompletionRate(habit), 0);
    return Math.round(totalRate / habits.length);
  }, [habits]);

  const strongestStreak = useMemo(() => {
    if (!habits.length) {
      return 0;
    }

    return habits.reduce((max, habit) => Math.max(max, getLongestStreak(habit.completionDates)), 0);
  }, [habits]);

  const activeStreaks = useMemo(() => {
    if (!habits.length) {
      return 0;
    }

    return habits.reduce((sum, habit) => sum + getCurrentStreak(habit.completionDates), 0);
  }, [habits]);

  const chartWidth = Math.max(320, width - 36);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Performance</Text>
        <Text style={styles.subtitle}>Measure completion trends, streak quality, and consistency.</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Habits Tracked</Text>
            <Text style={styles.metricValue}>{habits.length}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Average Consistency</Text>
            <Text style={styles.metricValue}>{avgConsistency}%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Combined Active Streaks</Text>
            <Text style={styles.metricValue}>{activeStreaks} days</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Strongest Streak</Text>
            <Text style={styles.metricValue}>{strongestStreak} days</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Last 7 Days Completion Count</Text>
          <BarChart
            data={{
              labels: lastSevenLabels,
              datasets: [{ data: lastSevenTotals }],
            }}
            width={chartWidth}
            height={240}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
            showValuesOnTopOfBars
            chartConfig={{
              backgroundGradientFrom: '#FFF8E9',
              backgroundGradientTo: '#FFF8E9',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(210, 94, 49, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(39, 47, 55, ${opacity})`,
              barPercentage: 0.65,
              propsForBackgroundLines: {
                stroke: '#F0DFBF',
              },
            }}
            style={styles.chart}
          />
        </View>

        {habits.map((habit) => (
          <View key={habit.id} style={styles.habitInsightCard}>
            <Text style={styles.habitName}>{habit.name}</Text>
            <Text style={styles.habitLine}>Current streak: {getCurrentStreak(habit.completionDates)} days</Text>
            <Text style={styles.habitLine}>Longest streak: {getLongestStreak(habit.completionDates)} days</Text>
            <Text style={styles.habitLine}>Consistency: {getCompletionRate(habit)}%</Text>
          </View>
        ))}

        {!habits.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No data to visualize yet</Text>
            <Text style={styles.emptyText}>Create habits and mark daily progress to unlock chart insights.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8E9',
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
    color: '#272F37',
  },
  subtitle: {
    fontSize: 15,
    color: '#5A626B',
    lineHeight: 22,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0DFBF',
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#5A626B',
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#272F37',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0DFBF',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    alignSelf: 'flex-start',
    marginHorizontal: 12,
    color: '#272F37',
    fontWeight: '700',
  },
  chart: {
    borderRadius: 12,
  },
  habitInsightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0DFBF',
    padding: 12,
    gap: 2,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#272F37',
    marginBottom: 3,
  },
  habitLine: {
    color: '#5A626B',
    fontSize: 13,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0DFBF',
    padding: 14,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#272F37',
  },
  emptyText: {
    color: '#5A626B',
    lineHeight: 20,
  },
});
