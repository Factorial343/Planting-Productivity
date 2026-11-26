import {
  createOrientationState,
  stepOrientation,
  type OrientationState,
} from './faceDown';

describe('orientation detection', () => {
  test('confirms flat face-up orientation after 10 seconds', () => {
    let state = createOrientationState();

    let result = stepOrientation(state, { z: 9.8, at: 0 });
    expect(result.event).toBeNull();
    state = result.state;

    result = stepOrientation(state, { z: 9.8, at: 9999 });
    expect(result.event).toBeNull();
    state = result.state;

    result = stepOrientation(state, { z: 9.8, at: 10000 });
    expect(result.event).toEqual({
      type: 'ORIENTATION_CHANGED',
      orientation: 'face-up',
      at: 10000,
    });
  });

  test('confirms flat face-down orientation after 10 seconds', () => {
    let state = createOrientationState();

    let result = stepOrientation(state, { z: -9.8, at: 0 });
    expect(result.event).toBeNull();
    state = result.state;

    result = stepOrientation(state, { z: -9.8, at: 10000 });
    expect(result.event).toEqual({
      type: 'ORIENTATION_CHANGED',
      orientation: 'face-down',
      at: 10000,
    });
  });

  test('ignores brief spikes shorter than 10 seconds', () => {
    let state = createOrientationState();

    let result = stepOrientation(state, { z: 9, at: 0 });
    state = result.state;
    result = stepOrientation(state, { z: 0, at: 9999 });
    expect(result.event).toBeNull();
    state = result.state;

    result = stepOrientation(state, { z: 9, at: 10000 });
    state = result.state;
    result = stepOrientation(state, { z: 9, at: 19998 });
    expect(result.event).toBeNull();
    state = result.state;

    result = stepOrientation(state, { z: 9, at: 20000 });
    expect(result.event).toMatchObject({
      type: 'ORIENTATION_CHANGED',
      orientation: 'face-up',
    });
  });

  test('uses hysteresis to avoid flicker near exit and entry thresholds', () => {
    let state = confirmedOrientation('face-up');

    let result = stepOrientation(state, { z: 6.1, at: 301 });
    expect(result.state.orientation).toBe('face-up');
    expect(result.event).toBeNull();
    state = result.state;

    result = stepOrientation(state, { z: 5.9, at: 302 });
    expect(result.event).toMatchObject({
      type: 'ORIENTATION_CHANGED',
      orientation: 'other',
    });
    state = result.state;

    for (const [z, at] of [
      [6.1, 303],
      [7, 304],
      [8, 305],
    ]) {
      result = stepOrientation(state, { z, at });
      expect(result.state.orientation).toBe('other');
      expect(result.event).toBeNull();
      state = result.state;
    }

    state = confirmedOrientation('face-down');
    result = stepOrientation(state, { z: -5.9, at: 301 });
    expect(result.event).toMatchObject({
      type: 'ORIENTATION_CHANGED',
      orientation: 'other',
    });
    state = result.state;
    result = stepOrientation(state, { z: -7, at: 302 });
    expect(result.state.orientation).toBe('other');
    expect(result.event).toBeNull();
  });

  test('transitions from up to down and back after each confirmation delay', () => {
    let state = confirmedOrientation('face-up');

    let result = stepOrientation(state, { z: -9, at: 301 });
    expect(result.event).toMatchObject({
      type: 'ORIENTATION_CHANGED',
      orientation: 'other',
    });
    state = result.state;

    result = stepOrientation(state, { z: -9, at: 10000 });
    expect(result.event).toBeNull();
    state = result.state;
    result = stepOrientation(state, { z: -9, at: 10301 });
    expect(result.event).toMatchObject({
      type: 'ORIENTATION_CHANGED',
      orientation: 'face-down',
    });
    state = result.state;

    result = stepOrientation(state, { z: 9, at: 10302 });
    expect(result.event).toMatchObject({
      type: 'ORIENTATION_CHANGED',
      orientation: 'other',
    });
    state = result.state;

    result = stepOrientation(state, { z: 9, at: 20000 });
    expect(result.event).toBeNull();
    state = result.state;
    result = stepOrientation(state, { z: 9, at: 20303 });
    expect(result.event).toMatchObject({
      type: 'ORIENTATION_CHANGED',
      orientation: 'face-up',
    });
  });
});

function confirmedOrientation(
  orientation: 'face-up' | 'face-down',
): OrientationState {
  const z = orientation === 'face-up' ? 9 : -9;
  const first = stepOrientation(createOrientationState(), { z, at: 0 });
  return stepOrientation(first.state, { z, at: 10000 }).state;
}
