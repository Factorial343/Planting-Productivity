import { useEffect, useRef, useState } from 'react';
import type { Campus, GeofenceStatus, LocationEvent } from '../types';
import { createGeofenceState, stepGeofence } from '../detection/geofence';
import { useLocation, type LocationFix } from './useLocation';

type UseGeofenceOptions = {
  enabled: boolean;
  campus?: Campus | null;
  selectedCampus?: Campus | null;
  onEvent: (event: LocationEvent) => void;
};

export function useGeofence({
  enabled,
  campus,
  selectedCampus,
  onEvent,
}: UseGeofenceOptions): GeofenceStatus {
  const selected = campus ?? selectedCampus ?? null;
  const [status, setStatus] = useState<GeofenceStatus>({
    isInside: false,
    distanceM: null,
  });
  const geofenceStateRef = useRef(createGeofenceState());
  const onEventRef = useRef(onEvent);

  onEventRef.current = onEvent;

  useEffect(() => {
    geofenceStateRef.current = createGeofenceState();
    setStatus({ isInside: false, distanceM: null });
  }, [selected?.id, enabled]);

  const location = useLocation({
    enabled: enabled && selected !== null,
    onFix: (fix: LocationFix) => {
      if (!selected) {
        return;
      }
      const result = stepGeofence(
        geofenceStateRef.current,
        fix,
        selected,
      );
      geofenceStateRef.current = result.state;
      setStatus(result.status);
      if (result.event) {
        onEventRef.current(result.event);
      }
    },
  });

  useEffect(() => {
    if (enabled && selected && location.permission === 'unknown') {
      void location.requestPermission();
    }
  }, [enabled, selected, location.permission, location.requestPermission]);

  return status;
}
