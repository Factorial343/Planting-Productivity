import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import {
  monthlyGoalMinutes,
  monthlyTargetMinutes,
  recentSessions,
  weeklyGoalMinutes,
  weeklyTargetMinutes,
} from '../mockData';
import type { ScreenName } from '../navigation/types';
import { colors, spacing } from '../theme';

type GoalsScreenProps = {
  navigate: (screen: ScreenName) => void;
};

export function GoalsScreen({ navigate }: GoalsScreenProps) {
  const [editMessageVisible, setEditMessageVisible] = useState(false);

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
            {weeklyGoalMinutes / 60} h of {weeklyTargetMinutes / 60} h
          </Text>
          <ProgressBar value={weeklyGoalMinutes / weeklyTargetMinutes} />
        </Card>

        <Card style={styles.goalCard}>
          <Text style={styles.cardTitle}>This month</Text>
          <Text style={styles.goalValue}>
            {monthlyGoalMinutes / 60} h of {monthlyTargetMinutes / 60} h
          </Text>
          <ProgressBar value={monthlyGoalMinutes / monthlyTargetMinutes} />
        </Card>

        <Card style={styles.sessionsCard}>
          <Text style={styles.cardTitle}>Recent sessions</Text>
          {recentSessions.map((session) => (
            <View key={session.id} style={styles.sessionRow}>
              <Text style={styles.sessionLabel}>{session.label}</Text>
              <Text style={styles.sessionDuration}>
                {session.minutes} min
              </Text>
            </View>
          ))}
        </Card>

        <Button
          title="Edit goals"
          variant="outline"
          onPress={() => setEditMessageVisible((visible) => !visible)}
        />
        {editMessageVisible ? (
          <Text style={styles.notice}>Goal editing is not available yet.</Text>
        ) : null}
        <Button
          title="Edit campus zone"
          variant="outline"
          onPress={() => navigate('campus')}
        />
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
});
