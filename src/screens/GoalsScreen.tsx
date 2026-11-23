import { useState } from 'react';
import { DEFAULT_PLANT, type PlantId } from '../avatar/plants';
import { PlantPicker } from '../components/PlantPicker';
import { getSelectedPlant, setSelectedPlant, goalsRepo } from '../db';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { formatDuration, goalProgress } from '../goals/goalMath';
import { useStats } from '../goals/useStats';
import type { ScreenName } from '../navigation/types';
import { colors, spacing } from '../theme';
import { DEMO_TOOLS_ENABLED } from '../demo/config';

type GoalsScreenProps = {
  navigate: (screen: ScreenName) => void;
};

export function GoalsScreen({ navigate }: GoalsScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const stats = useStats(refreshKey);
  const [editing, setEditing] = useState(false);
  const [weekHours, setWeekHours] = useState(10);
  const [monthHours, setMonthHours] = useState(40);
  const [plant, setPlant] = useState<PlantId>(DEFAULT_PLANT);

  const startEditing = async () => {
  setWeekHours(Math.round(stats.weekTargetMinutes / 60));
  setMonthHours(Math.round(stats.monthTargetMinutes / 60));
  try {
    setPlant(await getSelectedPlant());
  } catch (e) {
    console.error('getSelectedPlant failed', e);
  }
  setEditing(true);
};
  
  const saveGoals = async () => {
    const d = new Date();
    const startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    try {
      await goalsRepo.set({ period: 'week', targetMinutes: weekHours * 60, startDate });
      await goalsRepo.set({ period: 'month', targetMinutes: monthHours * 60, startDate });
      await setSelectedPlant(plant);
      setRefreshKey((k) => k + 1);
      setEditing(false);
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Goals and history</Text>

        <Card style={styles.goalCard}>
          <Text style={styles.cardTitle}>This week</Text>
          <Text style={styles.goalValue}>
          {formatDuration(stats.weekMinutes)} of {formatDuration(stats.weekTargetMinutes)}          </Text>
          <ProgressBar value={goalProgress(stats.weekMinutes, stats.weekTargetMinutes)} />
        </Card>

        <Card style={styles.goalCard}>
          <Text style={styles.cardTitle}>This month</Text>
          <Text style={styles.goalValue}>
          {formatDuration(stats.monthMinutes)} of {formatDuration(stats.monthTargetMinutes)}              </Text>
          <ProgressBar value={goalProgress(stats.monthMinutes, stats.monthTargetMinutes)} />
        </Card>

        <Card style={styles.sessionsCard}>
          <Text style={styles.cardTitle}>Recent sessions</Text>
          {stats.recent.length === 0 ? (
           <Text style={styles.sessionLabel}>No sessions yet.</Text>
          ) : (
            stats.recent.map((session) => (
              <View key={session.id} style={styles.sessionRow}>
                <Text style={styles.sessionLabel}>{session.label}</Text>
                <Text style={styles.sessionDuration}>{session.minutes} min</Text>
              </View>
            ))
          )}
        </Card>

        {editing ? (
          <Card style={styles.goalCard}>
            <Text style={styles.cardTitle}>Weekly target: {weekHours} h</Text>
            <View style={styles.stepper}>
              <Button title="-" variant="outline" disabled={weekHours <= 1}
                onPress={() => setWeekHours((h) => h - 1)} style={styles.stepButton} />
              <Button title="+" variant="outline" disabled={weekHours >= 60}
                onPress={() => setWeekHours((h) => h + 1)} style={styles.stepButton} />
            </View>
            <Text style={styles.cardTitle}>Monthly target: {monthHours} h</Text>
            <View style={styles.stepper}>
              <Button title="-" variant="outline" disabled={monthHours <= 1}
                onPress={() => setMonthHours((h) => h - 1)} style={styles.stepButton} />
              <Button title="+" variant="outline" disabled={monthHours >= 250}
                onPress={() => setMonthHours((h) => h + 1)} style={styles.stepButton} />
            </View>
            <Text style={styles.cardTitle}>Your plant</Text>
            <PlantPicker value={plant} onChange={setPlant} />
            <Button title="Save goals" onPress={saveGoals} />
            <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} />
          </Card>
        ) : (
          <Button title="Edit goals" variant="outline" onPress={startEditing} />
        )}

        <Button
          title="Edit campus zone"
          variant="outline"
          onPress={() => navigate('campus')}
        />
        {DEMO_TOOLS_ENABLED ? (
          <Button
            title="Demo Tools"
            variant="outline"
            onPress={() => navigate('demo')}
          />
        ) : null}
      </ScrollView>

      <View style={styles.tabs}>
        <Button
          title="Garden"
          variant="outline"
          onPress={() => navigate('home')}
          style={styles.tabButton}
        />
        <Button
          title="Goals"
          variant="outline"
          onPress={() => navigate('goals')}
          style={styles.tabButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  pageTitle: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  goalCard: {
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  goalValue: {
    color: colors.mutedText,
    fontSize: 14,
  },
  sessionsCard: {
    gap: spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sessionLabel: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 13,
  },
  sessionDuration: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  notice: {
    color: colors.mutedText,
    fontSize: 13,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepButton: {
    flex: 1,
  },
});
