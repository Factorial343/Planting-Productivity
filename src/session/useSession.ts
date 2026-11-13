import { useCallback, useEffect, useRef, useState } from 'react';

type SessionState = {
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
  finishSession: () => number;
};

export function useSession(
  durationMinutes: number,
  paused = false,
): SessionState {
  const durationSeconds = durationMinutes * 60;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const accumulatedSeconds = useRef(0);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (paused) {
      return;
    }

    startedAt.current = Date.now();

    const updateElapsed = () => {
      if (startedAt.current === null) {
        return;
      }

      const elapsed =
        accumulatedSeconds.current +
        Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsedSeconds(Math.min(durationSeconds, elapsed));
    };

    const intervalId = setInterval(updateElapsed, 1000);

    return () => {
      clearInterval(intervalId);
      if (startedAt.current !== null) {
        accumulatedSeconds.current = Math.min(
          durationSeconds,
          accumulatedSeconds.current +
            Math.floor((Date.now() - startedAt.current) / 1000),
        );
        setElapsedSeconds(accumulatedSeconds.current);
      }
      startedAt.current = null;
    };
  }, [durationSeconds, paused]);

  const finishSession = useCallback(() => {
    const elapsed =
      startedAt.current === null
        ? accumulatedSeconds.current
        : accumulatedSeconds.current +
          Math.floor((Date.now() - startedAt.current) / 1000);
    const finishedAt = Math.min(durationSeconds, elapsed);
    accumulatedSeconds.current = finishedAt;
    startedAt.current = null;
    setElapsedSeconds(finishedAt);
    return finishedAt;
  }, [durationSeconds]);

  return {
    elapsedSeconds,
    remainingSeconds: Math.max(0, durationSeconds - elapsedSeconds),
    progress: durationSeconds === 0 ? 0 : elapsedSeconds / durationSeconds,
    finishSession,
  };
}
