import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PlantView } from '../components/PlantView';
import { ProgressBar } from '../components/ProgressBar';
import { formatDuration, goalProgress } from '../goals/goalMath';
import { useStats } from '../goals/useStats';
import { useDemoState } from '../demo/demoState';
import { colors, spacing } from '../theme';

type SummaryScreenProps = {
  elapsedSeconds: number;
  onBackToGarden: () => void;
  onStartAnother: () => void;
};

export function SummaryScreen({
  elapsedSeconds,
  onBackToGarden,
  onStartAnother,
}: SummaryScreenProps) {
  const focusedMinutes = Math.floor(elapsedSeconds / 60);
  const stats = useStats();
  const goalMinutes = stats.currentGoal?.minutes ?? stats.weekMinutes;
  const goalTarget = stats.currentGoal?.targetMinutes ?? stats.weekTargetMinutes;
  const goalLabel = stats.rounds.length > 1 ? `Goal ${stats.currentGoal?.number}` : 'Weekly Goal';
  const weeklyProgress = goalProgress(goalMinutes, goalTarget);
  const pickups = useDemoState().pickups;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Session Complete</Text>

        <Card style={styles.plantCard}>
          <PlantView stage={stats.stage} plant={stats.plant}/>
          <Text style={styles.focusedHeadline}>
            +{focusedMinutes} min Focused
          </Text>
          <Text style={styles.plantProgress}>
            Your Plant is at Stage {stats.stage} of 5
          </Text>
        </Card>

        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Focused</Text>
            <Text style={styles.statValue}>{focusedMinutes} min</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pickups</Text>
            <Text style={styles.statValue}>{pickups}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{goalLabel}</Text>
            <Text style={styles.statValue}>
              {formatDuration(goalMinutes)} of {formatDuration(goalTarget)}
            </Text>
          </View>
          <ProgressBar value={weeklyProgress} />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back to Garden"
          onPress={onBackToGarden}
          style={styles.footerButton}
        />
        <Button
          title="Start Another"
          variant="outline"
          onPress={onStartAnother}
          style={styles.footerButton}
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  pageTitle: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  plantCard: {
    flexGrow: 1,
    minHeight: 264,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  focusedHeadline: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  plantProgress: {
    color: colors.mutedText,
    fontSize: 15,
    textAlign: 'center',
  },
  statsCard: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 15,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  footerButton: {
    minHeight: 56,
  },
});
