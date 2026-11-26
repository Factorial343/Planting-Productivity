import { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AreYouDoneScreen } from './AreYouDoneScreen';
import { Button } from '../components/Button';
import { TimerClock } from '../components/TimerClock';
import { ProgressBar } from '../components/ProgressBar';
import { colors, spacing } from '../theme';
import { DEMO_TOOLS_ENABLED } from '../demo/config';
import { setDemoState, useDemoState } from '../demo/demoState';
import type { SessionEndReason } from '../types';

type ActiveSessionScreenProps = {
  lengthMinutes: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
  pauseReason: 'pickup' | 'manual' | null;
  onEnd: (elapsedSeconds: number, reason: SessionEndReason) => void;
  isPromptVisible: boolean;
  onPause: () => void;
  onPickup: () => void;
  onKeepGoing: () => void;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function ActiveSessionScreen({
  lengthMinutes,
  elapsedSeconds,
  remainingSeconds,
  progress,
  pauseReason,
  onEnd,
  isPromptVisible,
  onPause,
  onPickup,
  onKeepGoing,
}: ActiveSessionScreenProps) {
  const hasEnded = useRef(false);
  const demo = useDemoState();

  const endSession = (reason: SessionEndReason) => {
    if (hasEnded.current) {
      return;
    }

    hasEnded.current = true;
    onEnd(elapsedSeconds, reason);
  };

  useEffect(() => {
    if (remainingSeconds === 0) {
      endSession('completed');
    }
  }, [remainingSeconds]);

  if (isPromptVisible) {
    return (
      <AreYouDoneScreen
        remainingSeconds={remainingSeconds}
        onYes={() => endSession(pauseReason === 'pickup' ? 'pickup_confirmed' : 'user_ended')}
        onKeepGoing={onKeepGoing}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sessionInfo}>
        Single Session · {demo.onCampus ? 'On Campus' : 'Off Campus'}
      </Text>
      <View style={styles.center}>
        <TimerClock progress={progress} />
        <Text style={styles.timer}>{formatTime(remainingSeconds)}</Text>
        <Text style={styles.timerCaption}>
          of {formatTime(lengthMinutes * 60)} · Phone face down: {demo.faceDown ? 'Yes' : 'No'}
        </Text>
        <ProgressBar
          value={progress}
          trackColor={colors.darkCard}
          fillColor={colors.primary}
        />
      </View>

      <View style={styles.bottom}>
        {DEMO_TOOLS_ENABLED ? (
          <View style={styles.demoRow}>
            <Button
              title="Fake Pickup"
              variant="darkOutline"
              onPress={onPickup}
              style={styles.demoButton}
            />
            <Button
              title={`Face Down: ${demo.faceDown ? 'Yes' : 'No'}`}
              variant="darkOutline"
              onPress={() => setDemoState({ faceDown: !demo.faceDown })}
              style={styles.demoButton}
            />
            <Button
              title={`Campus: ${demo.onCampus ? 'In' : 'Out'}`}
              variant="darkOutline"
              onPress={() => setDemoState({ onCampus: !demo.onCampus })}
              style={styles.demoButton}
            />
          </View>
        ) : null}
        <Button
          title="End Session"
          variant="darkOutline"
          onPress={onPause}
          style={styles.endButton}
        />
      </View>
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
    bottom: {
    gap: spacing.sm,
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  demoButton: {
    flex: 1,
    minHeight: 44,
  },
});
