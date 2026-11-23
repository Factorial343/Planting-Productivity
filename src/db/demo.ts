import { getDb } from './schema';
import { campusesRepo, sessionsRepo } from './repos';

// Inserts a finished fake session that ended just now.
export async function addTestSession(minutes: number): Promise<void> {
  const now = Date.now();
  await sessionsRepo.insert({
    mode: 'single',
    startTime: now - minutes * 60000,
    endTime: now,
    plannedMs: minutes * 60000,
    focusedMs: minutes * 60000,
    pickupCount: 0,
    campusId: null,
    endReason: 'completed',
  });
}

// Deletes every saved session. Goals, campuses and the plant choice stay.
export async function resetSessions(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM sessions');
}


// Creates one placeholder campus if none exist. Returns false if one already exists.
export async function addDemoCampus(): Promise<boolean> {
  const existing = await campusesRepo.list();
  if (existing.length > 0) return false;
  await campusesRepo.save({ name: 'Demo Campus', latitude: 0, longitude: 0, radiusM: 100 });
  return true;
}