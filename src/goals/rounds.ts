import type { PlantId } from '../avatar/plants';
import { getGoalStage } from '../avatar/avatar';
import type { Millis, PlantStage } from '../types';

export const MAX_ROUNDS_PER_WEEK = 5;

// One row of the goal_rounds table.
export interface GoalRoundRow {
  id: number;
  weekStart: Millis;
  startMs: Millis;
  targetMinutes: number;
  plant: PlantId;
  completedAt: Millis | null;
}

export interface RoundSession {
  startTime: Millis;
  focusedMs: Millis;
}

export interface RoundProgress {
  id: number;
  number: number; // 1 for the first goal of the week, 2 for the next, ...
  plant: PlantId;
  targetMinutes: number;
  minutes: number;
  stage: PlantStage;
  complete: boolean;
}

// rounds must be sorted by startMs. weekEnd is exclusive.
// A round counts sessions that start at or after its own start and before the next round starts.
export function computeRounds(
  rounds: GoalRoundRow[],
  sessions: RoundSession[],
  weekEnd: Millis,
): RoundProgress[] {
  return rounds.map((round, i) => {
    const end = i + 1 < rounds.length ? rounds[i + 1].startMs : weekEnd;
    const focusedMs = sessions
      .filter((s) => s.startTime >= round.startMs && s.startTime < end)
      .reduce((sum, s) => sum + s.focusedMs, 0);
    const minutes = Math.floor(focusedMs / 60000);
    return {
      id: round.id,
      number: i + 1,
      plant: round.plant,
      targetMinutes: round.targetMinutes,
      minutes,
      stage: getGoalStage(minutes, round.targetMinutes),
      complete: round.targetMinutes > 0 && minutes >= round.targetMinutes,
    };
  });
}

export function canStartAnotherGoal(rounds: RoundProgress[]): boolean {
  if (rounds.length === 0 || rounds.length >= MAX_ROUNDS_PER_WEEK) return false;
  return rounds[rounds.length - 1].complete;
}