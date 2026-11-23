import { useSyncExternalStore } from 'react';

type DemoState = {
  faceDown: boolean;
  onCampus: boolean;
  pickups: number; // fake pickups during the current session
};

let state: DemoState = { faceDown: true, onCampus: true, pickups: 0 };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getDemoState(): DemoState {
  return state;
}

export function setDemoState(patch: Partial<Pick<DemoState, 'faceDown' | 'onCampus'>>) {
  state = { ...state, ...patch };
  emit();
}

export function addFakePickup() {
  state = { ...state, pickups: state.pickups + 1 };
  emit();
}

export function resetPickups() {
  state = { ...state, pickups: 0 };
  emit();
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getDemoState,
  );
}