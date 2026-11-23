import { DEFAULT_PLANT, isPlantId, type PlantId } from '../avatar/plants';
import { getDb } from './schema';

const SELECTED_PLANT_KEY = 'selected_plant';

export async function getSelectedPlant(): Promise<PlantId> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [SELECTED_PLANT_KEY],
  );
  return row && isPlantId(row.value) ? row.value : DEFAULT_PLANT;
}

export async function setSelectedPlant(plant: PlantId): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [SELECTED_PLANT_KEY, plant],
  );
}
