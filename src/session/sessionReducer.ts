import type { Millis, SessionEvent, SessionState } from '../types';

export const initialSessionState: SessionState = {
  status: 'idle',
  mode: 'single',
  startedAt: null,
  lastTickAt: null,
  plannedMs: 0,
  focusedMs: 0,
  pickupCount: 0,
  campusId: null,
  pauseReason: null,
};

// Add the time since the last tick to focusedMs. Only counts while focusing.
function bank(state: SessionState, at: Millis): SessionState {
  if (state.status !== 'focusing' || state.lastTickAt === null) return state;
  const delta = Math.max(0, at - state.lastTickAt); // guard against clock going backwards
  return { ...state, focusedMs: state.focusedMs + delta, lastTickAt: at };
}

function pause(state: SessionState, at: Millis, reason: 'pickup' | 'manual'): SessionState {
  return {
    ...bank(state, at),
    status: 'paused',
    pauseReason: reason,
    pickupCount: reason === 'pickup' ? state.pickupCount + 1 : state.pickupCount,
    lastTickAt: null,
  };
}

function resume(state: SessionState, at: Millis): SessionState {
  return { ...state, status: 'focusing', pauseReason: null, lastTickAt: at };
}

function finish(state: SessionState, at: Millis): SessionState {
  return { ...bank(state, at), status: 'ended', pauseReason: null, lastTickAt: null };
}

export function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
  switch (event.type) {
    case 'START':
      if (state.status === 'focusing' || state.status === 'paused') return state;
      return {
        status: 'focusing',
        mode: event.mode,
        startedAt: event.at,
        lastTickAt: event.at,
        plannedMs: event.plannedMs,
        focusedMs: 0,
        pickupCount: 0,
        campusId: event.campusId,
        pauseReason: null,
      };

    case 'TICK': {
      if (state.status !== 'focusing') return state;
      const next = bank(state, event.at);
      if (next.plannedMs > 0 && next.focusedMs >= next.plannedMs) {
        return { ...next, focusedMs: next.plannedMs, status: 'ended', lastTickAt: null };
      }
      return next;
    }

    case 'PICKUP':
      return state.status === 'focusing' ? pause(state, event.at, 'pickup') : state;

    case 'PAUSE':
      return state.status === 'focusing' ? pause(state, event.at, 'manual') : state;

    case 'RESUME':
      return state.status === 'paused' ? resume(state, event.at) : state;

    case 'PROMPT_ANSWERED':
      if (state.status !== 'paused' || state.pauseReason !== 'pickup') return state;
      return event.answer === 'done' ? finish(state, event.at) : resume(state, event.at);

    case 'END':
      return state.status === 'focusing' || state.status === 'paused'
        ? finish(state, event.at)
        : state;
  }
}