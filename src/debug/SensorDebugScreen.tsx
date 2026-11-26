import { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAccelerometer } from '../sensors/useAccelerometer';
import { useSensing } from '../sensors/useSensing';
import { colors, radius, spacing } from '../theme';
import type { AccelerometerReading, SensorEvent } from '../types';

const SCENARIOS = [
  'flat-up',
  'flat-down',
  'desk-bump',
  'pickup-from-desk',
  'handheld-reading',
  'walking-pocket',
] as const;

type Scenario = (typeof SCENARIOS)[number];

type SensorDebugScreenProps = {
  onBack?: () => void;
};

type TraceRow =
  | { kind: 'SENSOR'; scenario: Scenario; trialId: string; groundTruth: GroundTruth; relativeMs: number; x: number; y: number; z: number; magnitude: number; detected: 'detected' | 'not detected' }
  | { kind: 'MARK'; scenario: Scenario; trialId: string; groundTruth: GroundTruth; relativeMs: number }
  | { kind: 'EVENT'; scenario: Scenario; trialId: string; groundTruth: GroundTruth; relativeMs: number; event: SensorEvent }
  | { kind: 'RESULT'; scenario: Scenario; trialId: string; groundTruth: GroundTruth; detected: 'detected' | 'not detected' };

type GroundTruth = 'pickup' | 'no-pickup';

export function SensorDebugScreen({ onBack }: SensorDebugScreenProps = {}) {
  const [scenario, setScenario] = useState<Scenario>('flat-up');
  const [isRecording, setIsRecording] = useState(false);
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const [traceCount, setTraceCount] = useState(0);
  const [groundTruth, setGroundTruth] = useState<GroundTruth | null>(null);
  const [trialId, setTrialId] = useState<string | null>(null);
  const [trialNumber, setTrialNumber] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [trialDetected, setTrialDetected] = useState(false);
  const trialStartAtRef = useRef<number | null>(null);
  const scenarioRef = useRef(scenario);
  const isRecordingRef = useRef(isRecording);
  const traceRef = useRef<TraceRow[]>([]);
  const groundTruthRef = useRef<GroundTruth | null>(null);
  const trialIdRef = useRef<string | null>(null);
  const trialDetectedRef = useRef(false);

  const onSensorEvent = useCallback((event: SensorEvent) => {
    setEvents((currentEvents) => [...currentEvents.slice(-9), event]);
    if (isRecordingRef.current) {
      if (event.type === 'PICKUP_DETECTED') {
        trialDetectedRef.current = true;
        setTrialDetected(true);
      }
      traceRef.current = [
        ...traceRef.current,
        {
          kind: 'EVENT' as const,
          scenario: scenarioRef.current,
          trialId: trialIdRef.current ?? 'missing-trial',
          groundTruth: groundTruthRef.current ?? 'no-pickup',
          relativeMs: trialStartAtRef.current === null ? 0 : event.at - trialStartAtRef.current,
          event,
        },
      ].slice(-50000) as TraceRow[];
      setTraceCount(traceRef.current.length);
    }
  }, []);
  const onSample = useCallback(
    (reading: AccelerometerReading, at: number) => {
      if (isRecordingRef.current) {
        const relativeMs = trialStartAtRef.current === null
          ? 0
          : at - trialStartAtRef.current;
        const magnitude = Math.sqrt(
          reading.x ** 2 + reading.y ** 2 + reading.z ** 2,
        );
        console.log(
          `SENSOR,${scenarioRef.current},${relativeMs},${reading.x},${reading.y},${reading.z},${magnitude},${trialDetectedRef.current ? 'detected' : 'not detected'}`,
        );
        traceRef.current = [
          ...traceRef.current,
          {
            kind: 'SENSOR' as const,
            scenario: scenarioRef.current,
            trialId: trialIdRef.current ?? 'missing-trial',
            groundTruth: groundTruthRef.current ?? 'no-pickup',
            relativeMs,
            x: reading.x,
            y: reading.y,
            z: reading.z,
            magnitude,
            detected: trialDetectedRef.current ? 'detected' : 'not detected',
          },
        ].slice(-50000) as TraceRow[];
        setTraceCount(traceRef.current.length);
      }
    },
    [],
  );
  const detectorState = useSensing({
    enabled: true,
    onEvent: onSensorEvent,
    resetKey,
  });
  const reading = useAccelerometer({
    enabled: true,
    intervalMs: 50,
    onSample,
  });
  const magnitude = reading
    ? Math.sqrt(reading.x ** 2 + reading.y ** 2 + reading.z ** 2)
    : null;

  const selectScenario = (nextScenario: Scenario) => {
    scenarioRef.current = nextScenario;
    setScenario(nextScenario);
  };
  const selectGroundTruth = (nextGroundTruth: GroundTruth) => {
    groundTruthRef.current = nextGroundTruth;
    setGroundTruth(nextGroundTruth);
  };
  const startTrial = () => {
    if (groundTruth === null) {
      return;
    }
    const nextTrialNumber = trialNumber + 1;
    const nextTrialId = `trial-${Date.now()}-${nextTrialNumber}`;
    const now = Date.now();
    trialIdRef.current = nextTrialId;
    trialStartAtRef.current = now;
    trialDetectedRef.current = false;
    setTrialId(nextTrialId);
    setTrialNumber(nextTrialNumber);
    setTrialDetected(false);
    setEvents([]);
    traceRef.current = [];
    setTraceCount(0);
    setResetKey((key) => key + 1);
    isRecordingRef.current = true;
    setIsRecording(true);
  };
  const startRecording = () => {
    if (trialIdRef.current === null || groundTruthRef.current === null) {
      return;
    }
    trialStartAtRef.current ??= Date.now();
    isRecordingRef.current = true;
    setIsRecording(true);
  };
  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (trialIdRef.current) {
      traceRef.current = [
        ...traceRef.current,
        {
          kind: 'RESULT' as const,
          scenario: scenarioRef.current,
          trialId: trialIdRef.current,
          groundTruth: groundTruthRef.current ?? 'no-pickup',
          detected: trialDetectedRef.current ? 'detected' : 'not detected',
        },
      ].slice(-50000) as TraceRow[];
      setTraceCount(traceRef.current.length);
    }
  };
  const markEvent = () => {
    const at = Date.now();
    const relativeMs = trialStartAtRef.current === null ? 0 : at - trialStartAtRef.current;
    console.log(`MARK,${scenarioRef.current},${relativeMs}`);
    if (isRecordingRef.current) {
      traceRef.current = [
        ...traceRef.current,
        {
          kind: 'MARK' as const,
          scenario: scenarioRef.current,
          trialId: trialIdRef.current ?? 'missing-trial',
          groundTruth: groundTruthRef.current ?? 'no-pickup',
          relativeMs,
        },
      ].slice(-50000) as TraceRow[];
      setTraceCount(traceRef.current.length);
    }
  };
  const clearRecording = () => {
    traceRef.current = [];
    setTraceCount(0);
  };
  const shareRecording = async () => {
    if (traceRef.current.length === 0) {
      return;
    }
    await Share.share({
      title: `Planting Productivity ${trialId ?? 'sensor trace'}`,
      message: traceToCsv(traceRef.current),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {onBack ? (
        <Button title="Back" variant="outline" onPress={onBack} />
      ) : null}
      <Text style={styles.title}>Sensor debug</Text>

      <Card style={styles.readingCard}>
        <Text style={styles.sectionTitle}>Acceleration (m/s²)</Text>
        <View style={styles.axes}>
          <AxisValue axis="x" value={reading?.x ?? null} />
          <AxisValue axis="y" value={reading?.y ?? null} />
          <AxisValue axis="z" value={reading?.z ?? null} />
        </View>
        <View style={styles.magnitudeRow}>
          <Text style={styles.magnitudeLabel}>Magnitude</Text>
          <Text style={styles.magnitudeValue}>
            {magnitude === null ? '--' : magnitude.toFixed(2)} m/s²
          </Text>
        </View>
      </Card>

      <Card style={styles.detectorCard}>
        <Text style={styles.sectionTitle}>Detector state</Text>
        <Text style={styles.detectorValue}>
          Orientation: {detectorState.orientation}
        </Text>
        <Text style={styles.detectorValue}>
          Pickups detected: {detectorState.pickupCount}
        </Text>
      </Card>

      <Card style={styles.eventsCard}>
        <Text style={styles.sectionTitle}>Last 10 events</Text>
        {events.length === 0 ? (
          <Text style={styles.emptyEvents}>No sensor events yet</Text>
        ) : (
          events.map((event, index) => (
            <Text key={`${event.at}-${index}`} style={styles.eventText}>
              {formatSensorEvent(event)}
            </Text>
          ))
        )}
      </Card>

      <Text style={styles.sectionTitle}>Scenario</Text>
      <View style={styles.scenarios}>
        {SCENARIOS.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: scenario === option }}
            onPress={() => selectScenario(option)}
            style={[
              styles.scenario,
              scenario === option && styles.selectedScenario,
            ]}
          >
            <Text
              style={[
                styles.scenarioText,
                scenario === option && styles.selectedScenarioText,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Ground truth</Text>
      <View style={styles.scenarios}>
        {([
          ['pickup', 'Actual Pickup'],
          ['no-pickup', 'No Pickup'],
        ] as const).map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: groundTruth === value }}
            onPress={() => selectGroundTruth(value)}
            style={[
              styles.scenario,
              groundTruth === value && styles.selectedScenario,
            ]}
          >
            <Text
              style={[
                styles.scenarioText,
                groundTruth === value && styles.selectedScenarioText,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {trialId ? (
        <Text style={styles.recordingStatus}>Trial ID: {trialId}</Text>
      ) : null}
      <Text style={styles.recordingStatus}>
        {trialDetected ? 'Result: detected' : 'Result: not detected'}
      </Text>

      <Text style={styles.recordingStatus}>
        {isRecording ? 'Recording' : 'Not recording'}
      </Text>
      <Text style={styles.recordingStatus}>
        Trace rows: {traceCount}
      </Text>
      <View style={styles.actions}>
        <Button
          title="Start Trial"
          onPress={startTrial}
          disabled={isRecording || groundTruth === null}
          style={styles.actionButton}
        />
        <Button
          title="Stop recording"
          onPress={stopRecording}
          variant="outline"
          disabled={!isRecording}
          style={styles.actionButton}
        />
      </View>
      <Button title="Mark event" onPress={markEvent} variant="outline" />
      <View style={styles.actions}>
        <Button
          title="Share CSV"
          onPress={shareRecording}
          disabled={traceCount === 0}
          style={styles.actionButton}
        />
        <Button
          title="Clear trace"
          onPress={clearRecording}
          variant="outline"
          disabled={traceCount === 0}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

function formatSensorEvent(event: SensorEvent): string {
  const description =
    event.type === 'ORIENTATION_CHANGED'
      ? `Orientation changed: ${event.orientation}`
      : 'Pickup detected';
  return `${event.at}: ${description}`;
}

function traceToCsv(rows: TraceRow[]): string {
  const lines = [
    'kind,scenario,trial_id,ground_truth,relative_ms,x,y,z,magnitude,detected,event',
  ];
  for (const row of rows) {
    if (row.kind === 'SENSOR') {
      lines.push([
        row.kind,
        row.scenario,
        row.trialId,
        row.groundTruth,
        row.relativeMs,
        row.x,
        row.y,
        row.z,
        row.magnitude,
        row.detected,
        '',
      ].join(','));
    } else if (row.kind === 'MARK') {
      lines.push([
        row.kind,
        row.scenario,
        row.trialId,
        row.groundTruth,
        row.relativeMs,
        '',
        '',
        '',
        '',
        '',
        'MARK',
      ].join(','));
    } else if (row.kind === 'EVENT') {
      const event = row.event.type === 'ORIENTATION_CHANGED'
        ? `ORIENTATION_CHANGED:${row.event.orientation}`
        : 'PICKUP_DETECTED';
      lines.push([
        row.kind,
        row.scenario,
        row.trialId,
        row.groundTruth,
        row.relativeMs,
        '',
        '',
        '',
        '',
        '',
        event,
      ].join(','));
    } else {
      lines.push([
        row.kind,
        row.scenario,
        row.trialId,
        row.groundTruth,
        '',
        '',
        '',
        '',
        '',
        row.detected,
        'TRIAL_RESULT',
      ].join(','));
    }
  }
  return lines.join('\n');
}

function AxisValue({ axis, value }: { axis: string; value: number | null }) {
  return (
    <View style={styles.axis}>
      <Text style={styles.axisLabel}>{axis}</Text>
      <Text style={styles.axisValue}>
        {value === null ? '--' : value.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  readingCard: {
    gap: spacing.md,
  },
  detectorCard: {
    gap: spacing.xs,
  },
  eventsCard: {
    gap: spacing.xs,
  },
  detectorValue: {
    color: colors.text,
    fontSize: 15,
  },
  emptyEvents: {
    color: colors.mutedText,
    fontSize: 14,
  },
  eventText: {
    color: colors.text,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  axes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  axis: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  axisLabel: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  axisValue: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 22,
    fontVariant: ['tabular-nums'],
  },
  magnitudeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  magnitudeLabel: {
    color: colors.mutedText,
    fontSize: 15,
  },
  magnitudeValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scenarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scenario: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.card,
  },
  selectedScenario: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  scenarioText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedScenarioText: {
    color: colors.card,
    fontWeight: '700',
  },
  recordingStatus: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
