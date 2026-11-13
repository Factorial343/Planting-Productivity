import type { SensorEvent } from '../types';

export const DEFAULT_PICKUP_CONFIG = {
  smoothingAlpha: 0.2,
  restingThresholdMps2: 0.4,
  restingDurationMs: 1500,
  pickupThresholdMps2: 1.5,
  pickupDurationMs: 400,
  unknownMotionDurationMs: 3000,
  cooldownMs: 5000,
} as const;

export type PickupConfig = {
  smoothingAlpha: number;
  restingThresholdMps2: number;
  restingDurationMs: number;
  pickupThresholdMps2: number;
  pickupDurationMs: number;
  unknownMotionDurationMs: number;
  cooldownMs: number;
};

type Vector = { x: number; y: number; z: number };

export type PickupState = {
  phase: 'unknown' | 'resting' | 'moving';
  smoothed: Vector | null;
  baseline: Vector | null;
  motionReference: Vector | null;
  restCandidate: Vector | null;
  restSince: number | null;
  motionSince: number | null;
  lastPickupAt: number | null;
  pickupArmed: boolean;
};

export function createPickupState(): PickupState {
  return {
    phase: 'unknown',
    smoothed: null,
    baseline: null,
    motionReference: null,
    restCandidate: null,
    restSince: null,
    motionSince: null,
    lastPickupAt: null,
    pickupArmed: false,
  };
}

export function stepPickup(
  state: PickupState,
  sample: { x: number; y: number; z: number; at: number },
  config: PickupConfig = DEFAULT_PICKUP_CONFIG,
): {
  state: PickupState;
  event: Extract<SensorEvent, { type: 'PICKUP_DETECTED' }> | null;
} {
  const smoothed = state.smoothed
    ? smooth(state.smoothed, sample, config.smoothingAlpha)
    : { x: sample.x, y: sample.y, z: sample.z };

  if (state.smoothed === null) {
    return {
      state: {
        ...state,
        smoothed,
        motionReference: smoothed,
        restCandidate: smoothed,
        restSince: sample.at,
      },
      event: null,
    };
  }

  let phase = state.phase;
  let baseline = state.baseline;
  const motionReference = state.motionReference;
  let restCandidate = state.restCandidate;
  let restSince = state.restSince;
  let motionSince = state.motionSince;
  let lastPickupAt = state.lastPickupAt;
  let pickupArmed = state.pickupArmed;
  let event: Extract<SensorEvent, { type: 'PICKUP_DETECTED' }> | null = null;
  const cooldownActive =
    lastPickupAt !== null && sample.at - lastPickupAt < config.cooldownMs;

  if (phase === 'unknown') {
    const distanceFromReference =
      motionReference === null ? 0 : distance(smoothed, motionReference);

    if (distanceFromReference > config.pickupThresholdMps2) {
      motionSince ??= sample.at;
      restCandidate = smoothed;
      restSince = sample.at;
    } else {
      motionSince = null;
      ({ restCandidate, restSince } = trackRest(
        smoothed,
        restCandidate,
        restSince,
        sample.at,
        config,
      ));

      if (restSince !== null && sample.at - restSince >= config.restingDurationMs) {
        phase = 'resting';
        baseline = restCandidate;
        pickupArmed = !cooldownActive;
      }
    }

    if (
      phase === 'unknown' &&
      motionSince !== null &&
      sample.at - motionSince >= config.unknownMotionDurationMs
    ) {
      phase = 'moving';
      pickupArmed = false;
      lastPickupAt = sample.at;
      restCandidate = smoothed;
      restSince = sample.at;
      event = { type: 'PICKUP_DETECTED', at: sample.at };
    }
  } else if (phase === 'resting') {
    if (!cooldownActive && lastPickupAt !== null && !pickupArmed) {
      pickupArmed = true;
    }

    const distanceFromBaseline =
      baseline === null ? 0 : distance(smoothed, baseline);

    if (distanceFromBaseline > config.restingThresholdMps2) {
      phase = 'moving';
      restCandidate = smoothed;
      restSince = sample.at;
    } else if (baseline !== null) {
      baseline = smooth(baseline, smoothed, config.smoothingAlpha);
    }

    if (distanceFromBaseline > config.pickupThresholdMps2) {
      if (cooldownActive || !pickupArmed) {
        motionSince = null;
      } else {
        motionSince ??= sample.at;
        if (sample.at - motionSince >= config.pickupDurationMs) {
          phase = 'moving';
          pickupArmed = false;
          lastPickupAt = sample.at;
          restCandidate = smoothed;
          restSince = sample.at;
          motionSince = null;
          event = { type: 'PICKUP_DETECTED', at: sample.at };
        }
      }
    } else {
      motionSince = null;
    }
  } else {
    const distanceFromBaseline =
      baseline === null ? 0 : distance(smoothed, baseline);

    if (distanceFromBaseline > config.pickupThresholdMps2) {
      if (cooldownActive || !pickupArmed) {
        motionSince = null;
      } else {
        motionSince ??= sample.at;
        if (sample.at - motionSince >= config.pickupDurationMs) {
          pickupArmed = false;
          lastPickupAt = sample.at;
          motionSince = null;
          restCandidate = smoothed;
          restSince = sample.at;
          event = { type: 'PICKUP_DETECTED', at: sample.at };
        }
      }
    } else {
      motionSince = null;
    }

    ({ restCandidate, restSince } = trackRest(
      smoothed,
      restCandidate,
      restSince,
      sample.at,
      config,
    ));

    if (restSince !== null && sample.at - restSince >= config.restingDurationMs) {
      phase = 'resting';
      baseline = restCandidate;
      motionSince = null;
      pickupArmed = lastPickupAt === null || sample.at - lastPickupAt >= config.cooldownMs;
    }
  }

  return {
    state: {
      phase,
      smoothed,
      baseline,
      motionReference,
      restCandidate,
      restSince,
      motionSince,
      lastPickupAt,
      pickupArmed,
    },
    event,
  };
}

function smooth(previous: Vector, current: Vector, alpha: number): Vector {
  return {
    x: previous.x + alpha * (current.x - previous.x),
    y: previous.y + alpha * (current.y - previous.y),
    z: previous.z + alpha * (current.z - previous.z),
  };
}

function distance(first: Vector, second: Vector): number {
  const x = first.x - second.x;
  const y = first.y - second.y;
  const z = first.z - second.z;
  return Math.sqrt(x * x + y * y + z * z);
}

function trackRest(
  sample: Vector,
  candidate: Vector | null,
  since: number | null,
  at: number,
  config: PickupConfig,
): { restCandidate: Vector; restSince: number } {
  if (
    candidate === null ||
    since === null ||
    distance(sample, candidate) > config.restingThresholdMps2
  ) {
    return { restCandidate: sample, restSince: at };
  }

  return {
    restCandidate: smooth(candidate, sample, config.smoothingAlpha),
    restSince: since,
  };
}
