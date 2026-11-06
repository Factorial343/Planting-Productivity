import { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AreYouDoneScreen } from './AreYouDoneScreen';
import { Button } from '../components/Button';
import { PlantView } from '../components/PlantView';
import { ProgressBar } from '../components/ProgressBar';
import { useSession } from '../session/useSession';
import { colors, spacing } from '../theme';

type ActiveSessionScreenProps = {
  lengthMinutes: number;
  onEnd: (elapsedSeconds: number) => void;
  isPromptVisible: boolean;
  onOpenPrompt: () => void;
  onKeepGoing: () => void;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function ActiveSessionScreen({
  lengthMinutes,
  onEnd,
  isPromptVisible,
  onOpenPrompt,
  onKeepGoing,
}: ActiveSessionScreenProps) {
  const {
    remainingSeconds,
    progress,
    finishSession,
  } = useSession(lengthMinutes, isPromptVisible);
  const hasEnded = useRef(false);

  const endSession = () => {
    if (hasEnded.current) {
      return;
    }

    hasEnded.current = true;
    onEnd(finishSession());
  };

  useEffect(() => {
    if (remainingSeconds === 0) {
      endSession();
    }
  }, [remainingSeconds]);

  if (isPromptVisible) {
    return (
      <AreYouDoneScreen
        remainingSeconds={remainingSeconds}
        onYes={endSession}
        onKeepGoing={onKeepGoing}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sessionInfo}>Single session · Main campus</Text>

      <View style={styles.center}>
        <PlantView stage={2} />
        <Text style={styles.timer}>{formatTime(remainingSeconds)}</Text>
        <Text style={styles.timerCaption}>
          of {formatTime(lengthMinutes * 60)} · Phone face down: yes
        </Text>
        <ProgressBar
          value={progress}
          trackColor={colors.darkCard}
          fillColor={colors.primary}
        />
      </View>

      <Button
        title="End session"
        variant="darkOutline"
        onPress={onOpenPrompt}
        style={styles.endButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.darkBackground,
  },
  sessionInfo: {
    color: colors.darkMutedText,
    fontSize: 15,
  },
  center: {
    alignItems: 'center',
    gap: spacing.md,
  },
  timer: {
    color: '#E8EEE9',
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerCaption: {
    color: colors.darkMutedText,
    fontSize: 15,
    textAlign: 'center',
  },
  endButton: {
    minHeight: 56,
  },
});
