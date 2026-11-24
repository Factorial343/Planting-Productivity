import { useEffect, useState } from 'react';
import { campusesRepo, goalsRepo, sessionsRepo } from '../db';
import { getGoalStage, minutesToNextGoalStage } from '../avatar/avatar';
import { monthRange, msToMinutes, weekRange } from './goalMath';
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
  recent: RecentSession[];
}

const EMPTY: Stats = {
  todayMinutes: 0, weekMinutes: 0, monthMinutes: 0,
  weekTargetMinutes: DEFAULT_WEEK_TARGET_MIN,
  monthTargetMinutes: DEFAULT_MONTH_TARGET_MIN,
  stage: 1, minutesToNext: null, recent: [],
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
      const weekMin = msToMinutes(weekMs);
      const weekTarget = weekGoal?.targetMinutes ?? DEFAULT_WEEK_TARGET_MIN;
      const next: Stats = {
        todayMinutes: msToMinutes(today),
        weekMinutes: msToMinutes(weekMs),
        monthMinutes: msToMinutes(monthMs),
        weekTargetMinutes: weekGoal?.targetMinutes ?? DEFAULT_WEEK_TARGET_MIN,
        monthTargetMinutes: monthGoal?.targetMinutes ?? DEFAULT_MONTH_TARGET_MIN,
        stage: getGoalStage(weekMin, weekTarget),
        minutesToNext: minutesToNextGoalStage(weekMin, weekTarget),
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