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
import { STAGE_NAMES } from '../avatar/avatar';
import { formatDuration, goalProgress } from '../goals/goalMath';
import { useStats } from '../goals/useStats';
import type { ScreenName } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type HomeScreenProps = {
  navigate: (screen: ScreenName) => void;
};

//const stageNames = ['Seed', 'Seedling', 'Sapling', 'Young tree', 'Mature tree'];

export function HomeScreen({ navigate }: HomeScreenProps) {
  const stats = useStats();
  const stageName = STAGE_NAMES[stats.stage];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>My garden</Text>
          <Text style={styles.today}>Today: {stats.todayMinutes} min</Text>
        </View>

        <Card style={styles.plantCard}>
          <PlantView stage={stats.stage} />
          <Text style={styles.plantName}>{stageName}</Text>
          <Text style={styles.plantProgress}>
            Stage {stats.stage} of 5 ·{' '}
            {stats.minutesToNext === null
              ? 'Fully grown'
              : `${stats.minutesToNext} min to next stage`}
          </Text>
        </Card>

       <Card style={styles.weeklyCard}>
        <Text style={styles.sectionTitle}>Weekly goal</Text>
        <Text style={styles.goalText}>
          {formatDuration(stats.weekMinutes)} of {formatDuration(stats.weekTargetMinutes)}
         </Text>
        <ProgressBar
           value={goalProgress(stats.weekMinutes, stats.weekTargetMinutes)}
        />
        </Card>

        <Card style={styles.plantsCard}>
          <Text style={styles.sectionTitle}>This week&apos;s plants</Text>
          <View style={styles.plantsRow}>
            {Array.from({ length: 5 }, (_, index) => (
              <View
                key={index}
                accessibilityLabel={`Plant ${index + 1} this week`}
                style={styles.plantTile}
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start focus"
          onPress={() => navigate('start')}
          style={styles.startButton}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  today: {
    color: colors.mutedText,
    fontSize: 15,
  },
  plantCard: {
    minHeight: 236,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  plantName: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  plantProgress: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
  },
  weeklyCard: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  goalText: {
    color: colors.mutedText,
    fontSize: 16,
  },
  plantsCard: {
    gap: spacing.sm,
  },
  plantsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  plantTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.plantPlaceholder,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  startButton: {
    minHeight: 56,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
  },
});
