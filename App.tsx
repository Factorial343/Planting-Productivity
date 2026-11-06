import { useState } from 'react';
import {
  StatusBar as NativeStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from './src/components/Button';
import { ActiveSessionScreen } from './src/screens/ActiveSessionScreen';
import { CampusSetupScreen } from './src/screens/CampusSetupScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { StartSessionScreen } from './src/screens/StartSessionScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { colors, spacing } from './src/theme';
import type { ScreenName } from './src/navigation/types';

const screenTitles: Record<Exclude<ScreenName, 'home'>, string> = {
  start: 'Start focus',
  active: 'Focus session',
  prompt: 'Session check-in',
  summary: 'Session summary',
  goals: 'Goals',
  campus: 'Campus setup',
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [sessionLength, setSessionLength] = useState(25);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isActiveSession = screen === 'active';

  return (
    <View
      style={[
        styles.container,
        isActiveSession && styles.activeSessionContainer,
      ]}
    >
      <StatusBar style={isActiveSession ? 'light' : 'dark'} />
      {screen === 'home' ? (
        <HomeScreen navigate={setScreen} />
      ) : screen === 'start' ? (
        <StartSessionScreen
          initialLength={sessionLength}
          onBegin={(lengthMinutes) => {
            setSessionLength(lengthMinutes);
            setScreen('active');
          }}
          onCancel={() => setScreen('home')}
        />
      ) : screen === 'active' || screen === 'prompt' ? (
        <ActiveSessionScreen
          lengthMinutes={sessionLength}
          isPromptVisible={screen === 'prompt'}
          onOpenPrompt={() => setScreen('prompt')}
          onKeepGoing={() => setScreen('active')}
          onEnd={(elapsed) => {
            setElapsedSeconds(elapsed);
            setScreen('summary');
          }}
        />
      ) : screen === 'summary' ? (
        <SummaryScreen
          elapsedSeconds={elapsedSeconds}
          onBackToGarden={() => setScreen('home')}
          onStartAnother={() => setScreen('start')}
        />
      ) : screen === 'goals' ? (
        <GoalsScreen navigate={setScreen} />
      ) : screen === 'campus' ? (
        <CampusSetupScreen
          onSave={() => setScreen('home')}
          onCancel={() => setScreen('home')}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.title}>{screenTitles[screen]}</Text>
          <Button title="Back to garden" onPress={() => setScreen('home')} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: NativeStatusBar.currentHeight ?? 0,
    backgroundColor: colors.background,
  },
  activeSessionContainer: {
    backgroundColor: colors.darkBackground,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
});
