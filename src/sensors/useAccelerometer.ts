import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import type { AccelerometerReading } from '../types';

type UseAccelerometerOptions = {
  enabled: boolean;
  intervalMs?: number;
  onSample: (reading: AccelerometerReading, at: number) => void;
};

const GRAVITY_M_PER_S_SQUARED = 9.80665;
const DISPLAY_INTERVAL_MS = 250;

export function useAccelerometer({
  enabled,
  intervalMs = 50,
  onSample,
}: UseAccelerometerOptions): AccelerometerReading | null {
  const [reading, setReading] = useState<AccelerometerReading | null>(null);
  const onSampleRef = useRef(onSample);
  const lastDisplayUpdateAtRef = useRef(0);

  onSampleRef.current = onSample;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    let subscription: ReturnType<typeof Accelerometer.addListener> | undefined;
    lastDisplayUpdateAtRef.current = 0;

    void Accelerometer.isAvailableAsync()
      .then((isAvailable) => {
        if (!active) {
          return;
        }
        if (!isAvailable) {
          console.error('Accelerometer is not available on this device.');
          return;
        }

        Accelerometer.setUpdateInterval(intervalMs);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const sample = {
            x: x * GRAVITY_M_PER_S_SQUARED,
            y: y * GRAVITY_M_PER_S_SQUARED,
            z: z * GRAVITY_M_PER_S_SQUARED,
          };
          const at = Date.now();

          onSampleRef.current(sample, at);
          if (at - lastDisplayUpdateAtRef.current >= DISPLAY_INTERVAL_MS) {
            lastDisplayUpdateAtRef.current = at;
            setReading(sample);
          }
        });
      })
      .catch((error: unknown) => {
        if (active) {
          console.error('Failed to initialize the accelerometer.', error);
        }
      });

    return () => {
      active = false;
      subscription?.remove();
    };
  }, [enabled, intervalMs]);

  return reading;
}
