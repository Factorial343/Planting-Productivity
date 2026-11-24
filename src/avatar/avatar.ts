import type { PlantStage } from '../types';

export const STAGE_THRESHOLDS: Record<PlantStage, number> = { 1: 0, 2: 60, 3: 180, 4: 360, 5: 600 };
export const STAGE_NAMES: Record<PlantStage, string> = {
  1: 'Seed', 2: 'Seedling', 3: 'Sapling', 4: 'Young tree', 5: 'Mature tree',
};

export function getAvatarStage(totalMinutes: number): PlantStage {
  let stage: PlantStage = 1;
  for (const s of [2, 3, 4, 5] as const) {
    if (totalMinutes >= STAGE_THRESHOLDS[s]) stage = s;
  }
  return stage;
}

// Minutes still needed for the next stage, or null at the top stage.
export function minutesToNextStage(totalMinutes: number): number | null {
  const stage = getAvatarStage(totalMinutes);
  if (stage === 5) return null;
  return STAGE_THRESHOLDS[(stage + 1) as PlantStage] - totalMinutes;
}

// Stage from progress toward a goal. Stage 5 only appears at 100%.
export function getGoalStage(doneMinutes: number, targetMinutes: number): PlantStage {
  if (targetMinutes <= 0) return 1;
  if (doneMinutes >= targetMinutes) return 5;
  const quarters = Math.floor((Math.max(0, doneMinutes) * 4) / targetMinutes);
  return (1 + quarters) as PlantStage;
}

// Minutes still needed to reach the next stage of the goal, or null at Stage 5.
export function minutesToNextGoalStage(doneMinutes: number, targetMinutes: number): number | null {
  if (targetMinutes <= 0) return null;
  const stage = getGoalStage(doneMinutes, targetMinutes);
  if (stage === 5) return null;
  return Math.ceil((stage * targetMinutes) / 4 - doneMinutes);
}