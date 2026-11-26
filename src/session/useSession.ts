import { useCallback, useEffect, useRef, useState } from 'react';
import type { Millis, SessionMode, SessionState as SharedSessionState } from '../types';
import { initialSessionState, sessionReducer } from './sessionReducer';

type SessionHookState = {
  session: SharedSessionState;
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
  start: (durationMinutes: number, mode?: SessionMode, campusId?: number | null) => void;
  pickup: () => void;
  pause: () => void;
  resume: () => void;
  keepGoing: () => void;
  end: () => number;
};

export function useSession(durationMinutes: number): SessionHookState {
  const durationMs = durationMinutes * 60000;
  const [session, setSession] = useState<SharedSessionState>(initialSessionState);
  const sessionRef = useRef(session);

  const dispatch = useCallback((event: Parameters<typeof sessionReducer>[1]) => {
    const next = sessionReducer(sessionRef.current, event);
    sessionRef.current = next;
    setSession(next);
  }, []);

  useEffect(() => {
    if (session.status !== 'focusing') {
      return;
    }

    const intervalId = setInterval(() => {
      dispatch({ type: 'TICK', at: Date.now() });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dispatch, session.status]);

  const start = useCallback((plannedMinutes: number, mode: SessionMode = 'single', campusId: number | null = null) => {
    dispatch({
      type: 'START',
      at: Date.now(),
      mode,
      plannedMs: plannedMinutes * 60000,
      campusId,
    });
  }, [dispatch]);

  const pickup = useCallback(() => {
    dispatch({ type: 'PICKUP', at: Date.now() });
  }, [dispatch]);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE', at: Date.now() });
  }, [dispatch]);

  const resume = useCallback(() => {
    dispatch({ type: 'RESUME', at: Date.now() });
  }, [dispatch]);

  const keepGoing = useCallback(() => {
    const current = sessionRef.current;
    dispatch(current.pauseReason === 'pickup'
      ? { type: 'PROMPT_ANSWERED', at: Date.now(), answer: 'keep_going' }
      : { type: 'RESUME', at: Date.now() });
  }, [dispatch]);

  const end = useCallback(() => {
    const at = Date.now();
    dispatch({ type: 'TICK', at });
    dispatch({ type: 'END', at, reason: 'user_ended' });
    const elapsedMs = sessionRef.current.focusedMs;
    return Math.min(durationMs, Math.floor(elapsedMs / 1000));
  }, [dispatch, durationMs]);

  const plannedMs = durationMs || session.plannedMs;
  const elapsedSeconds = Math.min(
    Math.floor(plannedMs / 1000),
    Math.floor(session.focusedMs / 1000),
  );

  return {
    session,
    elapsedSeconds,
    remainingSeconds: Math.max(0, Math.floor(plannedMs / 1000) - elapsedSeconds),
    progress: plannedMs === 0 ? 0 : session.focusedMs / plannedMs,
    start,
    pickup,
    pause,
    resume,
    keepGoing,
    end,
  };
}
