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
import type { ScreenName } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { plantStageName } from '../avatar/plants';

type HomeScreenProps = {
  navigate: (screen: ScreenName) => void;
};

//const stageNames = ['Seed', 'Seedling', 'Sapling', 'Young tree', 'Mature tree'];

export function HomeScreen({ navigate }: HomeScreenProps) {
  const stats = useStats();
  const stageName = plantStageName(stats.plant, stats.stage);
  const goalMinutes = stats.currentGoal?.minutes ?? stats.weekMinutes;
  const goalTarget = stats.currentGoal?.targetMinutes ?? stats.weekTargetMinutes;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>My Garden</Text>
          <Text style={styles.today}>Today: {stats.todayMinutes} min</Text>
        </View>

        <Card style={styles.plantCard}>
          <PlantView stage={stats.stage} plant={stats.plant} size={275}/>
          <Text style={styles.plantName}>{stageName}</Text>
          <Text style={styles.plantProgress}>
            Stage {stats.stage} of 5 ·{' '}
            {stats.minutesToNext === null
              ? 'Fully Grown'
              : `${stats.minutesToNext} min to Next Stage`}
          </Text>
        </Card>

        <Card style={styles.weeklyCard}>
          <Text style={styles.sectionTitle}>
            {stats.rounds.length > 1 ? `Goal ${stats.currentGoal?.number}` : 'Weekly Goal'}
          </Text>
          <Text style={styles.goalText}>
            {formatDuration(goalMinutes)} of {formatDuration(goalTarget)}
          </Text>
          <ProgressBar value={goalProgress(goalMinutes, goalTarget)} />
          {stats.canStartAnother ? (
            <Button
              title="Start Another Goal"
              variant="outline"
              onPress={() => navigate('newgoal')}
            />
          ) : null}
        </Card>

        <Card style={styles.plantsCard}>
          <Text style={styles.sectionTitle}>This Week&apos;s Plants</Text>
          <View style={styles.plantsRow}>
            {Array.from({ length: 5 }, (_, index) => {
              const goal = stats.rounds[index];
              return goal ? (
                <PlantView
                  key={goal.id}
                  stage={goal.stage}
                  plant={goal.plant}
                  size={48}
                />
              ) : (
                <View
                  key={`empty-${index}`}
                  accessibilityLabel={`Plant ${index + 1} this week`}
                  style={styles.plantTile}
                />
              );
            })}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start Session"
          onPress={() => navigate('start')}
          style={styles.startButton}
        />
        <View style={styles.tabs}>
          <Button
            title="Garden"
            variant="primary" 
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  header: {
    minHeight: 40,
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
    flexGrow: 2,
    minHeight: 236,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
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
    flexGrow: 1,
    justifyContent: 'center',
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
    flexGrow: 1,
    justifyContent: 'center',
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
