import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PlantId } from '../avatar/plants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PlantPicker } from '../components/PlantPicker';
import { addRound } from '../db';
import { weekRange } from '../goals/goalMath';
import { useStats } from '../goals/useStats';
import { colors, spacing } from '../theme';

type NewGoalScreenProps = {
  onDone: () => void;
};

export function NewGoalScreen({ onDone }: NewGoalScreenProps) {
  const stats = useStats();
  const [hours, setHours] = useState<number | null>(null);
  const [plant, setPlant] = useState<PlantId | null>(null);
  const [saving, setSaving] = useState(false);

  // Until you change them, start from the weekly target and your current plant.
  const shownHours = hours ?? Math.max(1, Math.round(stats.weekTargetMinutes / 60));
  const shownPlant = plant ?? stats.plant;
  const blocked = stats.rounds.length > 0 && !stats.canStartAnother;

  const start = async () => {
    setSaving(true);
    try {
      const now = Date.now();
      await addRound(weekRange(now).from, now, shownHours * 60, shownPlant);
      onDone();
    } catch (e) {
      console.error('Failed to start another goal', e);
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Start Another Goal</Text>
        <Text style={styles.note}>
          Time you focus from now on counts toward this goal. It ends Saturday night.
        </Text>

        {blocked ? (
          <Text style={styles.note}>
            Finish Your Current Goal First. You Can Have Up To 5 Goals Each Week.
          </Text>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Goal Length: {shownHours} h</Text>
          <View style={styles.stepper}>
            <Button
              title="-"
              variant="outline"
              disabled={shownHours <= 1}
              onPress={() => setHours(shownHours - 1)}
              style={styles.stepButton}
            />
            <Button
              title="+"
              variant="outline"
              disabled={shownHours >= 60}
              onPress={() => setHours(shownHours + 1)}
              style={styles.stepButton}
            />
          </View>
          <Text style={styles.sectionTitle}>Your Plant</Text>
          <PlantPicker value={shownPlant} onChange={setPlant} />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start Goal"
          disabled={blocked || !stats.canStartAnother || saving}
          onPress={start}
        />
        <Button title="Cancel" variant="outline" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  pageTitle: { color: colors.text, fontSize: 28, fontWeight: '700' },
  note: { color: colors.mutedText, fontSize: 15 },
  card: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  stepper: { flexDirection: 'row', gap: spacing.sm },
  stepButton: { flex: 1 },
  footer: { padding: spacing.lg, gap: spacing.sm },
});