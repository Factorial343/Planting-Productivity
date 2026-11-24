import { useEffect, useState } from 'react';
import { campusesRepo } from '../db';
import { useGeofence } from '../location/useGeofence';
import { useSensing } from '../sensors/useSensing';
import type { Campus } from '../types';
import { addFakePickup, setDemoState } from './demoState';

// Feeds the phone's real sensors and location into the shared signal store that
// the Start Focus and timer screens already read. The demo buttons write to the
// same store, so they still work as overrides.
export function useLiveSignals(
  watching: boolean, // location is checked while the Start, timer and prompt screens are open
  sensing: boolean, // motion sensors run only while the timer is running
  onPickup: () => void,
): void {
  const [campus, setCampus] = useState<Campus | null>(null);

  // Reload the saved campus each time we start watching, so a new zone is picked up.
  useEffect(() => {
    if (!watching) return;
    let cancelled = false;
    campusesRepo
      .list()
      .then((list) => {
        if (!cancelled) setCampus(list[0] ?? null);
      })
      .catch((e) => console.error('Failed to load campus', e));
    return () => {
      cancelled = true;
    };
  }, [watching]);

  const { orientation } = useSensing({
    enabled: sensing,
    onEvent: (event) => {
      if (event.type === 'PICKUP_DETECTED') {
        addFakePickup(); // counts the pickup (the name comes from the demo tools)
        onPickup();
      }
    },
  });

  const geofence = useGeofence({ enabled: watching, campus, onEvent: () => {} });
  const hasFix = geofence.distanceM !== null;

  // Only write when the value changes, so the demo buttons can still override it.
  useEffect(() => {
    if (sensing) setDemoState({ faceDown: orientation === 'face-down' });
  }, [orientation, sensing]);

  useEffect(() => {
    if (hasFix) setDemoState({ onCampus: geofence.isInside });
  }, [hasFix, geofence.isInside]);
}