import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { distanceM } from '../detection/geofence';
import { useGeofence } from '../location/useGeofence';
import { useLocation, type LocationFix } from '../location/useLocation';
import { colors, radius, spacing } from '../theme';
import type { Campus, LocationEvent } from '../types';

const EARTH_RADIUS_M = 6371000;
const RADAR_SIZE = 280;
const RADAR_PADDING = 20;
const CAMPUS_ID = -1;

type LocationDebugScreenProps = {
  onBack?: () => void;
};

export function LocationDebugScreen({ onBack }: LocationDebugScreenProps = {}) {
  const [active, setActive] = useState(false);
  const [radiusM, setRadiusM] = useState(100);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [events, setEvents] = useState<LocationEvent[]>([]);
  const statusRef = useRef({ isInside: false, distanceM: null as number | null });

  const onFix = useCallback((fix: LocationFix) => {
    if (!active) {
      return;
    }

    const distance = campus
      ? distanceM(fix.coords, campus)
      : null;
    const inside = campus && distance !== null
      ? distance <= campus.radiusM
      : false;

    console.log(
      `LOC,${fix.at},${fix.coords.latitude},${fix.coords.longitude},${fix.accuracyM ?? 'null'},${distance ?? 'null'},${inside}`,
    );
  }, [active, campus]);

  const onEvent = useCallback((event: LocationEvent) => {
    setEvents((current) => [...current.slice(-19), event]);
  }, []);

  const location = useLocation({ enabled: active, onFix });
  const geofenceStatus = useGeofence({
    enabled: active,
    campus,
    onEvent,
  });
  statusRef.current = geofenceStatus;

  const startTracking = () => {
    setActive(true);
    void location.requestPermission();
  };

  const setCenterHere = () => {
    if (!location.currentFix) {
      return;
    }
    setCampus({
      id: CAMPUS_ID,
      name: 'Temporary campus',
      latitude: location.currentFix.coords.latitude,
      longitude: location.currentFix.coords.longitude,
      radiusM,
    });
  };

  const adjustRadius = (amount: number) => {
    setRadiusM((current) => {
      const next = Math.max(25, Math.min(500, current + amount));
      setCampus((currentCampus) => (
        currentCampus
          ? { ...currentCampus, radiusM: next }
          : null
      ));
      return next;
    });
  };

  const radar = getRadarLayout(
    campus,
    location.currentFix,
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {onBack ? (
        <Button title="Back" variant="outline" onPress={onBack} />
      ) : null}
      <Text style={styles.title}>Location debug</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.value}>Permission: {location.permission}</Text>
        <Text style={styles.value}>
          Latitude: {location.currentFix?.coords.latitude.toFixed(6) ?? '--'}
        </Text>
        <Text style={styles.value}>
          Longitude: {location.currentFix?.coords.longitude.toFixed(6) ?? '--'}
        </Text>
        <Text style={styles.value}>
          Accuracy: {formatMeters(location.currentFix?.accuracyM ?? null)}
        </Text>
        <Text style={styles.value}>
          Distance: {formatMeters(geofenceStatus.distanceM)}
        </Text>
        <Text style={styles.value}>
          Zone: {geofenceStatus.isInside ? 'Inside' : 'Outside'}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Temporary campus</Text>
        <Text style={styles.value}>Radius: {radiusM} m</Text>
        <View style={styles.stepper}>
          <Button
            title="-"
            variant="outline"
            disabled={radiusM <= 25}
            onPress={() => adjustRadius(-25)}
            style={styles.stepButton}
          />
          <Button
            title="+"
            variant="outline"
            disabled={radiusM >= 500}
            onPress={() => adjustRadius(25)}
            style={styles.stepButton}
          />
        </View>
        <Button
          title="Set center here"
          variant="outline"
          onPress={setCenterHere}
          disabled={!location.currentFix}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Radar</Text>
        <View style={styles.radar}>
          {campus && (
            <View
              style={[
                styles.campusCircle,
                {
                  width: radar.campusRadiusPx * 2,
                  height: radar.campusRadiusPx * 2,
                  left: RADAR_SIZE / 2 - radar.campusRadiusPx,
                  top: RADAR_SIZE / 2 - radar.campusRadiusPx,
                },
              ]}
            />
          )}
          {location.currentFix && campus && (
            <View
              style={[
                styles.phoneDot,
                {
                  left: RADAR_SIZE / 2 + radar.eastPx - 6,
                  top: RADAR_SIZE / 2 - radar.northPx - 6,
                },
              ]}
            />
          )}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Last 20 campus events</Text>
        {events.length === 0 ? (
          <Text style={styles.emptyEvents}>No geofence events yet</Text>
        ) : (
          events.map((event, index) => (
            <Text
              key={`${event.at}-${index}`}
              style={styles.eventText}
            >
              {event.at}: {event.type === 'ENTERED_CAMPUS'
                ? 'ENTERED_CAMPUS'
                : 'LEFT_CAMPUS'}
            </Text>
          ))
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Start tracking"
          onPress={startTracking}
          disabled={active}
          style={styles.actionButton}
        />
        <Button
          title="Stop tracking"
          variant="outline"
          onPress={() => setActive(false)}
          disabled={!active}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

function formatMeters(value: number | null): string {
  return value === null ? '--' : `${value.toFixed(1)} m`;
}

function getRadarLayout(
  campus: Campus | null,
  fix: LocationFix | null,
) {
  if (!campus || !fix) {
    return {
      campusRadiusPx: 0,
      eastPx: 0,
      northPx: 0,
    };
  }

  const latitudeDelta = toRadians(fix.coords.latitude - campus.latitude);
  const longitudeDelta = toRadians(fix.coords.longitude - campus.longitude);
  const northM = EARTH_RADIUS_M * latitudeDelta;
  const eastM =
    EARTH_RADIUS_M *
    Math.cos(toRadians(campus.latitude)) *
    longitudeDelta;

  const fitRadius = Math.max(
    campus.radiusM,
    Math.abs(eastM),
    Math.abs(northM),
  );
  const scale = (RADAR_SIZE / 2 - RADAR_PADDING) / fitRadius;

  return {
    campusRadiusPx: campus.radiusM * scale,
    eastPx: eastM * scale,
    northPx: northM * scale,
  };
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
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
  card: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  stepper: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  stepButton: {
    flex: 1,
  },
  radar: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignSelf: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: colors.card,
  },
  campusCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: RADAR_SIZE,
  },
  phoneDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: radius.round,
    backgroundColor: colors.text,
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
