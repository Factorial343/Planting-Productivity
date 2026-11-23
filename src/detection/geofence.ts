import type {
  Campus,
  Coordinates,
  GeofenceStatus,
  LocationEvent,
  Millis,
} from '../types';

export const DEFAULT_GEOFENCE_CONFIG = {
  maxAccuracyM: 100,
  exitBufferM: 25,
  consecutiveFixes: 2,
  emitInitialEnter: true,
} as const;

export type GeofenceConfig = {
  maxAccuracyM?: number;
  exitBufferM?: number;
  consecutiveFixes?: number;
  emitInitialEnter?: boolean;
  accuracyThresholdM?: number;
  requiredConsecutiveFixes?: number;
  initialInsideEvent?: boolean;
};

export type GeofenceState = {
  hasValidFix: boolean;
  isInside: boolean;
  distanceM: number | null;
  insideConsecutive: number;
  outsideConsecutive: number;
};

export function distanceM(a: Coordinates, b: Coordinates): number {
  const earthRadiusM = 6371000;
  const latitude1 = toRadians(a.latitude);
  const latitude2 = toRadians(b.latitude);
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusM * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(Math.max(0, 1 - haversine)),
  );
}

export function createGeofenceState(): GeofenceState {
  return {
    hasValidFix: false,
    isInside: false,
    distanceM: null,
    insideConsecutive: 0,
    outsideConsecutive: 0,
  };
}

export function stepGeofence(
  state: GeofenceState,
  fix: { coords: Coordinates; accuracyM: number | null; at: Millis },
  campus: Campus,
  config: GeofenceConfig = DEFAULT_GEOFENCE_CONFIG,
): {
  state: GeofenceState;
  status: GeofenceStatus;
  event: LocationEvent | null;
} {
  if (
    fix.accuracyM === null ||
    fix.accuracyM < 0 ||
    fix.accuracyM > resolvedAccuracyThreshold(config)
  ) {
    return {
      state,
      status: {
        isInside: state.isInside,
        distanceM: state.distanceM,
      },
      event: null,
    };
  }

  const distance = distanceM(fix.coords, campus);
  let isInside = state.isInside;
  let insideConsecutive = state.insideConsecutive;
  let outsideConsecutive = state.outsideConsecutive;
  let event: LocationEvent | null = null;

  if (!state.hasValidFix) {
    if (distance <= campus.radiusM) {
      isInside = true;
      insideConsecutive = 1;
      outsideConsecutive = 0;
      if (resolvedEmitInitialEnter(config)) {
        event = {
          type: 'ENTERED_CAMPUS',
          campusId: campus.id,
          at: fix.at,
        };
      }
    } else {
      isInside = false;
      insideConsecutive = 0;
      outsideConsecutive = 1;
    }
  } else if (distance <= campus.radiusM) {
    insideConsecutive += 1;
    outsideConsecutive = 0;
    if (!isInside && insideConsecutive >= resolvedConsecutiveFixes(config)) {
      isInside = true;
      insideConsecutive = 0;
      event = {
        type: 'ENTERED_CAMPUS',
        campusId: campus.id,
        at: fix.at,
      };
    }
  } else if (distance > campus.radiusM + resolvedExitBuffer(config)) {
    outsideConsecutive += 1;
    insideConsecutive = 0;
    if (isInside && outsideConsecutive >= resolvedConsecutiveFixes(config)) {
      isInside = false;
      outsideConsecutive = 0;
      event = {
        type: 'LEFT_CAMPUS',
        campusId: campus.id,
        at: fix.at,
      };
    }
  } else {
    insideConsecutive = 0;
    outsideConsecutive = 0;
  }

  return {
    state: {
      hasValidFix: true,
      isInside,
      distanceM: distance,
      insideConsecutive,
      outsideConsecutive,
    },
    status: {
      isInside,
      distanceM: distance,
    },
    event,
  };
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function resolvedAccuracyThreshold(config: GeofenceConfig): number {
  return config.maxAccuracyM ?? config.accuracyThresholdM ?? 100;
}

function resolvedExitBuffer(config: GeofenceConfig): number {
  return config.exitBufferM ?? 25;
}

function resolvedConsecutiveFixes(config: GeofenceConfig): number {
  return config.consecutiveFixes ??
    config.requiredConsecutiveFixes ??
    2;
}

function resolvedEmitInitialEnter(config: GeofenceConfig): boolean {
  return config.emitInitialEnter ??
    config.initialInsideEvent ??
    true;
}
