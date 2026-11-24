import { useEffect, useState } from 'react';
import {
  addRound,
  campusesRepo,
  completeRound,
  getSelectedPlant,
  goalsRepo,
  listRounds,
  sessionsRepo,
  updateRound,
} from '../db';
import { minutesToNextGoalStage } from '../avatar/avatar';
import { DEFAULT_PLANT, type PlantId } from '../avatar/plants';
import { monthRange, msToMinutes, weekRange } from './goalMath';
import { canStartAnotherGoal, computeRounds, type RoundProgress } from './rounds';
import type { PlantStage } from '../types';

const DEFAULT_WEEK_TARGET_MIN = 10 * 60;
const DEFAULT_MONTH_TARGET_MIN = 40 * 60;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface RecentSession { id: number; label: string; minutes: number }

export interface Stats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  weekTargetMinutes: number;
  monthTargetMinutes: number;
  stage: PlantStage;
  minutesToNext: number | null;
  plant: PlantId;
  rounds: RoundProgress[];
  currentGoal: RoundProgress | null;
  canStartAnother: boolean;
  recent: RecentSession[];
}

const EMPTY: Stats = {
  todayMinutes: 0, weekMinutes: 0, monthMinutes: 0,
  weekTargetMinutes: DEFAULT_WEEK_TARGET_MIN,
  monthTargetMinutes: DEFAULT_MONTH_TARGET_MIN,
  stage: 1, minutesToNext: null,
  plant: DEFAULT_PLANT, rounds: [], currentGoal: null, canStartAnother: false,
  recent: [],
};

// Loads once each time the screen using it mounts.
export function useStats(refreshKey = 0): Stats {
  const [stats, setStats] = useState<Stats>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const now = Date.now();
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const week = weekRange(now);
      const month = monthRange(now);

      const [today, weekMs, monthMs, weekGoal, monthGoal, all, campuses] =
        await Promise.all([
          sessionsRepo.totalFocusedMs(dayStart.getTime(), dayEnd.getTime()),
          sessionsRepo.totalFocusedMs(week.from, week.to),
          sessionsRepo.totalFocusedMs(month.from, month.to),
          goalsRepo.getActive('week'),
          goalsRepo.getActive('month'),
          sessionsRepo.listBetween(0, now + 1),
          campusesRepo.list(),
        ]);

      const names = new Map(campuses.map((c) => [c.id, c.name]));
      const weekTarget = weekGoal?.targetMinutes ?? DEFAULT_WEEK_TARGET_MIN;
      const selectedPlant = await getSelectedPlant();

      // Goal 1 of the week is created the first time the week is viewed.
      let rows = await listRounds(week.from);
      if (rows.length === 0) {
        await addRound(week.from, week.from, weekTarget, selectedPlant);
        rows = await listRounds(week.from);
      }
      // Goal 1 follows the weekly target and the chosen plant until it is complete.
      if (
        rows[0].completedAt === null &&
        (rows[0].targetMinutes !== weekTarget || rows[0].plant !== selectedPlant)
      ) {
        await updateRound(rows[0].id, weekTarget, selectedPlant);
        rows = [{ ...rows[0], targetMinutes: weekTarget, plant: selectedPlant }, ...rows.slice(1)];
      }

      const weekSessions = all.filter((s) => s.startTime >= week.from && s.startTime < week.to);
      const rounds = computeRounds(rows, weekSessions, week.to);

      // Lock in finished goals so later changes to the target or plant can't undo them.
      for (const r of rounds) {
        const row = rows.find((x) => x.id === r.id);
        if (r.complete && row && row.completedAt === null) {
          await completeRound(r.id, r.targetMinutes, r.plant, now);
        }
      }

      const current = rounds[rounds.length - 1];
      const next: Stats = {
        todayMinutes: msToMinutes(today),
        weekMinutes: msToMinutes(weekMs),
        monthMinutes: msToMinutes(monthMs),
        weekTargetMinutes: weekTarget,
        monthTargetMinutes: monthGoal?.targetMinutes ?? DEFAULT_MONTH_TARGET_MIN,
        stage: current.stage,
        minutesToNext: minutesToNextGoalStage(current.minutes, current.targetMinutes),
        plant: current.plant,
        rounds,
        currentGoal: current,
        canStartAnother: canStartAnotherGoal(rounds),
        recent: all.slice(0, 5).map((s) => ({
          id: s.id,
          label: `${DAYS[new Date(s.startTime).getDay()]} · ${
            s.campusId === null ? 'Off campus' : names.get(s.campusId) ?? 'Campus'
          }`,
          minutes: msToMinutes(s.focusedMs),
        })),
      };
      if (!cancelled) setStats(next);
    })().catch((e) => console.error('useStats failed', e));
    return () => { cancelled = true; };
  }, [refreshKey]);

  return stats;
}