import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { Coordinates, Millis } from '../types';

export type LocationPermission = 'unknown' | 'granted' | 'denied';

export type LocationFix = {
  coords: Coordinates;
  accuracyM: number | null;
  at: Millis;
};

type UseLocationOptions = {
  enabled: boolean;
  onFix: (fix: LocationFix) => void;
};

export type UseLocationResult = {
  permission: LocationPermission;
  requestPermission: () => Promise<LocationPermission>;
  currentFix: LocationFix | null;
  error: string | null;
};

export function useLocation({
  enabled,
  onFix,
}: UseLocationOptions): UseLocationResult {
  const [permission, setPermission] = useState<LocationPermission>('unknown');
  const [currentFix, setCurrentFix] = useState<LocationFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onFixRef = useRef(onFix);

  onFixRef.current = onFix;

  const publishFix = useCallback((location: Location.LocationObject) => {
    const fix: LocationFix = {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      accuracyM: location.coords.accuracy ?? null,
      at: location.timestamp,
    };
    setCurrentFix(fix);
    setError(null);
    onFixRef.current(fix);
  }, []);

  const requestPermission = useCallback(async (): Promise<LocationPermission> => {
    setError(null);
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      const nextPermission: LocationPermission =
        response.status === 'granted' ? 'granted' : 'denied';
      setPermission(nextPermission);

      if (nextPermission === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          publishFix(location);
        } catch (readError) {
          const message =
            readError instanceof Error
              ? readError.message
              : 'Failed to read the current location.';
          setError(message);
        }
      }

      return nextPermission;
    } catch (permissionError) {
      setPermission('denied');
      const message =
        permissionError instanceof Error
          ? permissionError.message
          : 'Failed to request location permission.';
      setError(message);
      return 'denied';
    }
  }, [publishFix]);

  useEffect(() => {
    if (!enabled || permission !== 'granted') {
      return;
    }

    let active = true;
    let subscription: Location.LocationSubscription | null = null;

    void Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        if (active) {
          publishFix(location);
        }
      },
      (reason) => {
        if (active) {
          setError(reason);
        }
      },
    )
      .then((watchSubscription) => {
        if (active) {
          subscription = watchSubscription;
        } else {
          watchSubscription.remove();
        }
      })
      .catch((watchError: unknown) => {
        if (!active) {
          return;
        }
        const message =
          watchError instanceof Error
            ? watchError.message
            : 'Failed to watch location updates.';
        setError(message);
      });

    return () => {
      active = false;
      subscription?.remove();
    };
  }, [enabled, permission, publishFix]);

  useEffect(() => {
    if (!enabled) {
      setError(null);
    }
  }, [enabled]);

  return { permission, requestPermission, currentFix, error };
}
