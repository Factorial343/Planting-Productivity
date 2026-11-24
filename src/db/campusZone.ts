import { getDb } from './schema';
import type { Campus } from '../types';

// The app uses one campus zone. Update it in place so saved sessions keep pointing at it.
export async function saveCampusZone(zone: Omit<Campus, 'id'>): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM campuses ORDER BY name LIMIT 1',
  );
  if (existing) {
    await db.runAsync(
      'UPDATE campuses SET name = ?, latitude = ?, longitude = ?, radius_m = ? WHERE id = ?',
      [zone.name, zone.latitude, zone.longitude, zone.radiusM, existing.id],
    );
  } else {
    await db.runAsync(
      'INSERT INTO campuses (name, latitude, longitude, radius_m) VALUES (?, ?, ?, ?)',
      [zone.name, zone.latitude, zone.longitude, zone.radiusM],
    );
  }
}