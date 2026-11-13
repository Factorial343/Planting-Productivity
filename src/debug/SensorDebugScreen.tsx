import { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
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

export function SensorDebugScreen() {
  const [scenario, setScenario] = useState<Scenario>('flat-up');
  const [isRecording, setIsRecording] = useState(false);
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const scenarioRef = useRef(scenario);
  const isRecordingRef = useRef(isRecording);

  const onSensorEvent = useCallback((event: SensorEvent) => {
    setEvents((currentEvents) => [...currentEvents.slice(-9), event]);
  }, []);
  const onSample = useCallback(
    (reading: AccelerometerReading, at: number) => {
      if (isRecordingRef.current) {
        console.log(
          `SENSOR,${scenarioRef.current},${at},${reading.x},${reading.y},${reading.z}`,
        );
      }
    },
    [],
  );
  const detectorState = useSensing({ enabled: true, onEvent: onSensorEvent });
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
  const startRecording = () => {
    isRecordingRef.current = true;
    setIsRecording(true);
  };
  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
  };
  const markEvent = () => {
    console.log(`MARK,${scenarioRef.current},${Date.now()}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
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

      <Text style={styles.recordingStatus}>
        {isRecording ? 'Recording' : 'Not recording'}
      </Text>
      <View style={styles.actions}>
        <Button
          title="Start recording"
          onPress={startRecording}
          disabled={isRecording}
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
