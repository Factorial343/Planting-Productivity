import type { Campus, Coordinates } from '../types';
import {
  createGeofenceState,
  distanceM,
  stepGeofence,
  type GeofenceState,
} from './geofence';

const CAMPUS: Campus = {
  id: 7,
  name: 'Test Campus',
  latitude: 40,
  longitude: -75,
  radiusM: 150,
};

describe('geofence detection', () => {
  test('calculates known distances', () => {
    const oneKmEast: Coordinates = { latitude: 40.009, longitude: -75 };
    expect(distanceM(CAMPUS, oneKmEast)).toBeGreaterThan(990);
    expect(distanceM(CAMPUS, oneKmEast)).toBeLessThan(1010);
  });

  test('very first fix inside emits ENTERED_CAMPUS', () => {
    let state = createGeofenceState();
    const result = stepGeofence(
      state,
      { coords: CAMPUS, accuracyM: 10, at: 100 },
      CAMPUS,
    );

    expect(result.event).toEqual({
      type: 'ENTERED_CAMPUS',
      campusId: 7,
      at: 100,
    });
    expect(result.status.isInside).toBe(true);
  });

  test('requires two fixes to enter after starting outside', () => {
    let state = createGeofenceState();
    let result = stepGeofence(
      state,
      { coords: { latitude: 41, longitude: -75 }, accuracyM: 10, at: 0 },
      CAMPUS,
    );
    state = result.state;
    expect(result.event).toBeNull();

    result = stepGeofence(
      state,
      { coords: CAMPUS, accuracyM: 10, at: 10 },
      CAMPUS,
    );
    state = result.state;
    expect(result.event).toBeNull();

    result = stepGeofence(
      state,
      { coords: CAMPUS, accuracyM: 10, at: 20 },
      CAMPUS,
    );
    expect(result.event).toEqual({
      type: 'ENTERED_CAMPUS',
      campusId: 7,
      at: 20,
    });
  });

  test('requires two fixes to leave', () => {
    let state = confirmedInsideState();
    let result = stepGeofence(
      state,
      { coords: { latitude: 40, longitude: -74.997 }, accuracyM: 10, at: 100 },
      CAMPUS,
    );
    state = result.state;
    expect(result.event).toBeNull();
    expect(result.status.isInside).toBe(true);

    result = stepGeofence(
      state,
      { coords: { latitude: 40, longitude: -74.997 }, accuracyM: 10, at: 200 },
      CAMPUS,
    );
    expect(result.event).toEqual({
      type: 'LEFT_CAMPUS',
      campusId: 7,
      at: 200,
    });
  });

  test('jitter at the boundary does not flip-flop', () => {
    let state = confirmedInsideState();
    const boundaryFix = {
      coords: { latitude: 40, longitude: -75 + 0.002 },
      accuracyM: 10,
      at: 100,
    };

    let result = stepGeofence(state, boundaryFix, CAMPUS);
    state = result.state;
    expect(result.status.isInside).toBe(true);

    result = stepGeofence(
      state,
      { coords: CAMPUS, accuracyM: 10, at: 200 },
      CAMPUS,
    );
    expect(result.status.isInside).toBe(true);
  });

  test('ignores fixes with accuracy worse than 100 m', () => {
    let state = createGeofenceState();
    let result = stepGeofence(
      state,
      { coords: CAMPUS, accuracyM: 101, at: 100 },
      CAMPUS,
    );
    expect(result.event).toBeNull();
    expect(result.status.distanceM).toBeNull();
    state = result.state;

    result = stepGeofence(
      state,
      { coords: CAMPUS, accuracyM: 100, at: 200 },
      CAMPUS,
    );
    expect(result.event?.type).toBe('ENTERED_CAMPUS');
  });

  test('no event on the first fix when outside', () => {
    const result = stepGeofence(
      createGeofenceState(),
      { coords: { latitude: 41, longitude: -75 }, accuracyM: 20, at: 500 },
      CAMPUS,
    );
    expect(result.event).toBeNull();
    expect(result.status.isInside).toBe(false);
  });
});

function confirmedInsideState(): GeofenceState {
  const first = stepGeofence(
    createGeofenceState(),
    { coords: CAMPUS, accuracyM: 10, at: 0 },
    CAMPUS,
  );
  return first.state;
}
