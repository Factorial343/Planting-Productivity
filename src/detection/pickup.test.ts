import { createPickupState, stepPickup, type PickupState } from './pickup';

type Sample = { x: number; y: number; z: number; at: number };
type Vector = { x: number; y: number; z: number };

describe('pickup detection', () => {
  test('detects a phone lifted after resting', () => {
    const samples = trace(0, 3000, (at) =>
      at < 1600 ? RESTING : { x: 4, y: 0, z: 8.95 },
    );

    const events = runTrace(samples);

    expect(events).toHaveLength(1);
    expect(events[0].at).toBeGreaterThanOrEqual(2000);
    expect(events[0].type).toBe('PICKUP_DETECTED');
  });

  test('ignores a 100 ms desk bump', () => {
    const samples = trace(0, 4000, (at) =>
      at >= 2000 && at < 2100 ? { x: 4, y: 0, z: 8.95 } : RESTING,
    );

    expect(runTrace(samples)).toHaveLength(0);
  });

  test('detects a slow tilt of about 30 degrees', () => {
    const samples = trace(0, 5000, (at) => {
      const angle = Math.min(Math.max((at - 1600) / 2000, 0), 1) * (Math.PI / 6);
      return {
        x: 9.8 * Math.sin(angle),
        y: 0,
        z: 9.8 * Math.cos(angle),
      };
    });

    expect(runTrace(samples)).toHaveLength(1);
  });

  test('detects sustained motion that starts before rest is observed', () => {
    const samples = trace(0, 4000, (at) =>
      at === 0 ? RESTING : { x: 8, y: 0, z: 9.8 },
    );
    const events = runTrace(samples);

    expect(events).toHaveLength(1);
    expect(events[0].at).toBeGreaterThanOrEqual(3000);
    expect(events[0].at).toBeLessThanOrEqual(3200);
  });

  test('does not re-arm for movement during the pickup cooldown', () => {
    const samples = trace(0, 7000, (at) => {
      if (at < 1600 || (at >= 2700 && at < 4300)) {
        return RESTING;
      }
      return { x: 4, y: 0, z: 8.95 };
    });

    expect(runTrace(samples)).toHaveLength(1);
  });

  test('ignores noise-level jitter while resting', () => {
    const samples = trace(
      0,
      5000,
      (at) => ({
        x: Math.sin(at / 100) * 0.05,
        y: Math.cos(at / 150) * 0.05,
        z: 9.8 + Math.sin(at / 80) * 0.05,
      }),
    );

    expect(runTrace(samples)).toHaveLength(0);
  });
});

const RESTING: Vector = { x: 0, y: 0, z: 9.8 };

function trace(
  startAt: number,
  endAt: number,
  vectorAt: (at: number) => Vector,
): Sample[] {
  const samples: Sample[] = [];
  for (let at = startAt; at <= endAt; at += 50) {
    samples.push({ ...vectorAt(at), at });
  }
  return samples;
}

function runTrace(samples: Sample[]): Array<{ type: 'PICKUP_DETECTED'; at: number }> {
  let state: PickupState = createPickupState();
  const events: Array<{ type: 'PICKUP_DETECTED'; at: number }> = [];

  for (const sample of samples) {
    const result = stepPickup(state, sample);
    state = result.state;
    if (result.event) {
      events.push(result.event);
    }
  }

  return events;
}
