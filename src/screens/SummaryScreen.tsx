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
  const weeklyProgress = goalProgress(stats.weekMinutes, stats.weekTargetMinutes);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Session complete</Text>

        <Card style={styles.plantCard}>
          <PlantView stage={stats.stage} />
          <Text style={styles.focusedHeadline}>
            +{focusedMinutes} min focused
          </Text>
          <Text style={styles.plantProgress}>
            Your plant is at Stage {stats.stage} of 5
          </Text>
        </Card>

        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Focused</Text>
            <Text style={styles.statValue}>{focusedMinutes} min</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pickups</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Weekly goal</Text>
            <Text style={styles.statValue}>
              {formatDuration(stats.weekMinutes)} of {formatDuration(stats.weekTargetMinutes)}
            </Text>
          </View>
          <ProgressBar value={weeklyProgress} />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back to garden"
          onPress={onBackToGarden}
          style={styles.footerButton}
        />
        <Button
          title="Start another"
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
