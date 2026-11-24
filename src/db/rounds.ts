import { DEFAULT_PLANT, isPlantId, type PlantId } from '../avatar/plants';
import type { GoalRoundRow } from '../goals/rounds';
import type { Millis } from '../types';
import { getDb } from './schema';

type Row = {
  id: number;
  week_start: number;
  start_ms: number;
  target_minutes: number;
  plant: string;
  completed_at: number | null;
};

const toRound = (r: Row): GoalRoundRow => ({
  id: r.id,
  weekStart: r.week_start,
  startMs: r.start_ms,
  targetMinutes: r.target_minutes,
  plant: isPlantId(r.plant) ? r.plant : DEFAULT_PLANT,
  completedAt: r.completed_at,
});

export async function listRounds(weekStart: Millis): Promise<GoalRoundRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM goal_rounds WHERE week_start = ? ORDER BY start_ms ASC, id ASC',
    [weekStart],
  );
  return rows.map(toRound);
}

export async function addRound(
  weekStart: Millis,
  startMs: Millis,
  targetMinutes: number,
  plant: PlantId,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO goal_rounds (week_start, start_ms, target_minutes, plant) VALUES (?, ?, ?, ?)',
    [weekStart, startMs, targetMinutes, plant],
  );
}

// Changes a goal's target and plant, but only while it is not complete.
export async function updateRound(id: number, targetMinutes: number, plant: PlantId): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE goal_rounds SET target_minutes = ?, plant = ? WHERE id = ? AND completed_at IS NULL',
    [targetMinutes, plant, id],
  );
}

// Locks in a finished goal so later changes to the weekly target or plant can't undo it.
export async function completeRound(
  id: number,
  targetMinutes: number,
  plant: PlantId,
  at: Millis,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE goal_rounds SET target_minutes = ?, plant = ?, completed_at = ? WHERE id = ?',
    [targetMinutes, plant, at, id],
  );
}