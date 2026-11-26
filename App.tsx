import { campusesRepo, sessionsRepo } from './src/db';
import { DEMO_TOOLS_ENABLED } from './src/demo/config';
import { getDemoState, resetPickups } from './src/demo/demoState';
import { useCallback, useState } from 'react';
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
import { DemoToolsScreen } from './src/screens/DemoToolsScreen';
import { NewGoalScreen } from './src/screens/NewGoalScreen';
import { colors, spacing } from './src/theme';
import type { ScreenName } from './src/navigation/types';
import { useLiveSignals } from './src/demo/useLiveSignals';
import { useSession } from './src/session/useSession';
import { usePickupNotification } from './src/notifications/usePickupNotification';
import type { SessionEndReason } from './src/types';
import { SensorDebugScreen } from './src/debug/SensorDebugScreen';
import { LocationDebugScreen } from './src/debug/LocationDebugScreen';

const screenTitles: Record<Exclude<ScreenName, 'home'>, string> = {
  start: 'Start Focus',
  active: 'Focus Session',
  prompt: 'Session Check-in',
  summary: 'Session Summary',
  goals: 'Goals',
  campus: 'Campus Setup',
  demo: 'Demo Tools',
  sensorDebug: 'Sensor Debug',
  locationDebug: 'Location Debug',
  newgoal: 'Start Another Goal'
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [sessionLength, setSessionLength] = useState(25);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [summaryPickups, setSummaryPickups] = useState(0);
  const isActiveSession = screen === 'active';
  const session = useSession(sessionLength);

  const showPrompt = useCallback(() => {
    setScreen('prompt');
  }, []);

  const finishSession = useCallback(async (reason: SessionEndReason) => {
    const elapsed = session.end();
    const now = Date.now();
    setElapsedSeconds(elapsed);
    setSummaryPickups(session.session.pickupCount);

    if (elapsed > 0) {
      try {
        let campusId: number | null = null;
        if (DEMO_TOOLS_ENABLED && getDemoState().onCampus) {
          const campuses = await campusesRepo.list();
          campusId = campuses[0]?.id ?? null;
        } else if (session.session.campusId !== null) {
          campusId = session.session.campusId;
        }

        await sessionsRepo.insert({
          mode: 'single',
          startTime: session.session.startedAt ?? now - elapsed * 1000,
          endTime: now,
          plannedMs: sessionLength * 60000,
          focusedMs: elapsed * 1000,
          pickupCount: session.session.pickupCount,
          campusId,
          endReason: reason,
        });
      } catch (e) {
        console.error('Failed to save session', e);
      }
    }
    setScreen('summary');
  }, [session.end, session.session.pickupCount, session.session.campusId, session.session.startedAt, sessionLength]);

  const handleNotificationAction = useCallback((action: 'done' | 'keep_going' | 'open_prompt') => {
    if (action === 'keep_going') {
      session.keepGoing();
      setScreen('active');
    } else if (action === 'open_prompt') {
      setScreen('prompt');
    } else {
      void finishSession('pickup_confirmed');
    }
  }, [session.keepGoing, finishSession]);

  const notification = usePickupNotification(handleNotificationAction);

  const handlePickup = useCallback(() => {
    session.pickup();
    showPrompt();
    void notification.showPickupPrompt();
  }, [session.pickup, showPrompt, notification.showPickupPrompt]);

  useLiveSignals(
    screen === 'start' || screen === 'active' || screen === 'prompt',
    screen === 'active',
    handlePickup,
  );
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
          onBegin={async (lengthMinutes) => {
            resetPickups();
            setSessionLength(lengthMinutes);
            let campusId: number | null = null;
            try {
              const campuses = await campusesRepo.list();
              campusId = campuses[0]?.id ?? null;
            } catch (e) {
              console.error('Failed to load campus for session', e);
            }
            session.start(lengthMinutes, 'single', campusId);
            setScreen('active');
          }}
          onCancel={() => setScreen('home')}
        />
      ) : screen === 'active' || screen === 'prompt' ? (
        <ActiveSessionScreen
          lengthMinutes={sessionLength}
          elapsedSeconds={session.elapsedSeconds}
          remainingSeconds={session.remainingSeconds}
          progress={session.progress}
          pauseReason={session.session.pauseReason}
          isPromptVisible={screen === 'prompt'}
          onPause={() => {
            session.pause();
            showPrompt();
          }}
          onPickup={handlePickup}
          onKeepGoing={() => {
            session.keepGoing();
            notification.dismissPickupPrompt();
            setScreen('active');
          }}
          onEnd={async (elapsed, reason: SessionEndReason) => {
            await finishSession(reason);
          }}
        />
      ) : screen === 'summary' ? (
        <SummaryScreen
          elapsedSeconds={elapsedSeconds}
          pickupCount={summaryPickups}
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
      ) : screen === 'newgoal' ? (
        <NewGoalScreen onDone={() => setScreen('home')} />
      ) : screen === 'demo' ? (
       <DemoToolsScreen
         onBack={() => setScreen('goals')}
         onOpenSensorDebug={() => setScreen('sensorDebug')}
         onOpenLocationDebug={() => setScreen('locationDebug')}
       />
      ) : screen === 'sensorDebug' ? (
        <SensorDebugScreen onBack={() => setScreen('demo')} />
      ) : screen === 'locationDebug' ? (
        <LocationDebugScreen onBack={() => setScreen('demo')} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.title}>{screenTitles[screen]}</Text>
          <Button title="Back to Garden" onPress={() => setScreen('home')} />
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
