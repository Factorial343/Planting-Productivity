import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors, spacing } from '../theme';

type SessionMode = 'single' | 'weekly';

type StartSessionScreenProps = {
  initialLength: number;
  onBegin: (lengthMinutes: number) => void;
  onCancel: () => void;
};

const MIN_LENGTH = 5;
const MAX_LENGTH = 120;
const STEP = 5;

export function StartSessionScreen({
  initialLength,
  onBegin,
  onCancel,
}: StartSessionScreenProps) {
  const [mode, setMode] = useState<SessionMode>('single');
  const [length, setLength] = useState(initialLength);

  const adjustLength = (amount: number) => {
    setLength((current) =>
      Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, current + amount)),
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Start a session</Text>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Mode</Text>
          <View style={styles.modeButtons}>
            <Button
              title="Single session"
              variant={mode === 'single' ? 'primary' : 'outline'}
              onPress={() => setMode('single')}
              style={styles.modeButton}
            />
            <Button
              title="Weekly goal"
              variant={mode === 'weekly' ? 'primary' : 'outline'}
              onPress={() => setMode('weekly')}
              style={styles.modeButton}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Length</Text>
          <View style={styles.stepper}>
            <Button
              title="-"
              variant="outline"
              disabled={length <= MIN_LENGTH}
              onPress={() => adjustLength(-STEP)}
              style={styles.stepButton}
            />
            <Text style={styles.length}>{length} min</Text>
            <Button
              title="+"
              variant="outline"
              disabled={length >= MAX_LENGTH}
              onPress={() => adjustLength(STEP)}
              style={styles.stepButton}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Place</Text>
          <Text style={styles.description}>
            Campus zone: Main campus (you are inside)
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Start with</Text>
          <Text style={styles.description}>
            Button (default). NFC tap and voice are optional extras.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Begin"
          onPress={() => onBegin(length)}
          style={styles.footerButton}
        />
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
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
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    minHeight: 52,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    width: 56,
    height: 56,
  },
  length: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
  },
  description: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
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
