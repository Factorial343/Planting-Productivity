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