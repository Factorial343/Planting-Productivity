import type { Millis } from '../types';
export interface Range { from: Millis; to: Millis } // from inclusive, to exclusive

export function weekRange(now: Millis): Range {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // back to Monday
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { from: start.getTime(), to: end.getTime() };
}

export function monthRange(now: Millis): Range {
  const d = new Date(now);
  return {
    from: new Date(d.getFullYear(), d.getMonth(), 1).getTime(),
    to: new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(),
  };
}

export const msToMinutes = (ms: Millis): number => Math.floor(ms / 60000);

export function goalProgress(doneMinutes: number, targetMinutes: number): number {
  if (targetMinutes <= 0) return 0;
  return Math.min(1, Math.max(0, doneMinutes / targetMinutes));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}