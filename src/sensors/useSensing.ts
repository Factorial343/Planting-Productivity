import { useEffect, useId, useRef, useState } from 'react';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';
import { createOrientationState, stepOrientation } from '../detection/faceDown';
import { createPickupState, stepPickup } from '../detection/pickup';
import type { Orientation, SensorEvent } from '../types';
import { useAccelerometer } from './useAccelerometer';

type UseSensingOptions = {
  enabled: boolean;
  onEvent: (event: SensorEvent) => void;
};

export function useSensing({
  enabled,
  onEvent,
}: UseSensingOptions): { orientation: Orientation; pickupCount: number } {
  const [orientation, setOrientation] = useState<Orientation>('other');
  const [pickupCount, setPickupCount] = useState(0);
  const orientationStateRef = useRef(createOrientationState());
  const pickupStateRef = useRef(createPickupState());
  const onEventRef = useRef(onEvent);
  const enabledRef = useRef(enabled);
  const keepAwakeTag = useId();

  onEventRef.current = onEvent;
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    orientationStateRef.current = createOrientationState();
    pickupStateRef.current = createPickupState();
    setOrientation('other');
    setPickupCount(0);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    const deactivate = () => {
      void deactivateKeepAwake(keepAwakeTag).catch((error: unknown) => {
        console.error('Failed to deactivate keep-awake for sensing.', error);
      });
    };

    void activateKeepAwakeAsync(keepAwakeTag)
      .then(() => {
        if (!active) {
          deactivate();
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error('Failed to activate keep-awake for sensing.', error);
        }
      });

    return () => {
      active = false;
      deactivate();
    };
  }, [enabled, keepAwakeTag]);

  useAccelerometer({
    enabled,
    onSample: (sample, at) => {
      if (!enabledRef.current) {
        return;
      }

      const orientationResult = stepOrientation(orientationStateRef.current, {
        z: sample.z,
        at,
      });
      orientationStateRef.current = orientationResult.state;
      if (orientationResult.event) {
        setOrientation(orientationResult.event.orientation);
        onEventRef.current(orientationResult.event);
      }

      const pickupResult = stepPickup(pickupStateRef.current, {
        ...sample,
        at,
      });
      pickupStateRef.current = pickupResult.state;
      if (pickupResult.event) {
        setPickupCount((count) => count + 1);
        onEventRef.current(pickupResult.event);
      }
    },
  });

  return { orientation, pickupCount };
}
