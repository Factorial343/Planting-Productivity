import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors, spacing } from '../theme';

type AreYouDoneScreenProps = {
  remainingSeconds: number;
  onYes: () => void;
  onKeepGoing: () => void;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function AreYouDoneScreen({
  remainingSeconds,
  onYes,
  onKeepGoing,
}: AreYouDoneScreenProps) {
  return (
    <View style={styles.container}>
      <Card style={styles.promptCard}>
        <Text style={styles.title}>Phone picked up</Text>
        <Text style={styles.description}>
          Timer paused at {formatTime(remainingSeconds)}. Are you done
          studying?
        </Text>
        <Button
          title="Yes, end session"
          onPress={onYes}
          style={styles.button}
        />
        <Button
          title="No, keep going"
          variant="outline"
          onPress={onKeepGoing}
          style={styles.button}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  promptCard: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.xs,
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    minHeight: 54,
  },
});
