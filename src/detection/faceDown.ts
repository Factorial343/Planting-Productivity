import type { Orientation, SensorEvent } from '../types';

export const DEFAULT_ORIENTATION_CONFIG = {
  faceDownEnterZ: -8,
  faceDownLeaveZ: -6,
  faceUpEnterZ: 8,
  faceUpLeaveZ: 6,
  confirmationDelayMs: 300,
} as const;

export type OrientationConfig = {
  faceDownEnterZ: number;
  faceDownLeaveZ: number;
  faceUpEnterZ: number;
  faceUpLeaveZ: number;
  confirmationDelayMs: number;
};

export type OrientationState = {
  orientation: Orientation;
  pendingOrientation: Orientation | null;
  pendingSince: number | null;
};

export function createOrientationState(): OrientationState {
  return {
    orientation: 'other',
    pendingOrientation: null,
    pendingSince: null,
  };
}

export function stepOrientation(
  state: OrientationState,
  sample: { z: number; at: number },
  config: OrientationConfig = DEFAULT_ORIENTATION_CONFIG,
): {
  state: OrientationState;
  event: Extract<SensorEvent, { type: 'ORIENTATION_CHANGED' }> | null;
} {
  let orientation = state.orientation;
  let pendingOrientation = state.pendingOrientation;
  let pendingSince = state.pendingSince;

  if (
    (orientation === 'face-down' && sample.z > config.faceDownLeaveZ) ||
    (orientation === 'face-up' && sample.z < config.faceUpLeaveZ)
  ) {
    orientation = 'other';
    pendingOrientation = null;
    pendingSince = null;
  }

  if (orientation === 'other') {
    const candidate: Orientation | null =
      sample.z < config.faceDownEnterZ
        ? 'face-down'
        : sample.z > config.faceUpEnterZ
          ? 'face-up'
          : null;

    if (candidate === null) {
      pendingOrientation = null;
      pendingSince = null;
    } else if (
      candidate !== pendingOrientation ||
      pendingSince === null ||
      sample.at < pendingSince
    ) {
      pendingOrientation = candidate;
      pendingSince = sample.at;
    } else if (sample.at - pendingSince >= config.confirmationDelayMs) {
      orientation = candidate;
      pendingOrientation = null;
      pendingSince = null;
    }
  }

  const nextState: OrientationState = {
    orientation,
    pendingOrientation,
    pendingSince,
  };
  const event: Extract<SensorEvent, { type: 'ORIENTATION_CHANGED' }> | null =
    orientation === state.orientation
      ? null
      : { type: 'ORIENTATION_CHANGED', orientation, at: sample.at };

  return { state: nextState, event };
}
