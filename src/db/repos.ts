import { getDb } from './schema';
import type {
  Campus, CampusesRepo, Goal, GoalsRepo, Millis,
  NewSession, Session, SessionsRepo,
} from '../types';

type SessionRow = {
  id: number; mode: Session['mode']; start_time: number; end_time: number | null;
  planned_ms: number; focused_ms: number; pickup_count: number;
  campus_id: number | null; end_reason: Session['endReason'];
};
const toSession = (r: SessionRow): Session => ({
  id: r.id, mode: r.mode, startTime: r.start_time, endTime: r.end_time,
  plannedMs: r.planned_ms, focusedMs: r.focused_ms, pickupCount: r.pickup_count,
  campusId: r.campus_id, endReason: r.end_reason,
});

export const sessionsRepo: SessionsRepo = {
  async insert(s: NewSession) {
    const db = await getDb();
    const res = await db.runAsync(
      `INSERT INTO sessions (mode, start_time, end_time, planned_ms, focused_ms,
         pickup_count, campus_id, end_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.mode, s.startTime, s.endTime, s.plannedMs, s.focusedMs,
       s.pickupCount, s.campusId, s.endReason],
    );
    return { id: res.lastInsertRowId, ...s };
  },
  async listBetween(from: Millis, to: Millis) {
    const db = await getDb();
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM sessions WHERE start_time >= ? AND start_time < ? ORDER BY start_time DESC',
      [from, to],
    );
    return rows.map(toSession);
  },
  async totalFocusedMs(from: Millis, to: Millis) {
    const db = await getDb();
    const row = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(focused_ms), 0) AS total FROM sessions WHERE start_time >= ? AND start_time < ?',
      [from, to],
    );
    return row?.total ?? 0;
  },
};

type CampusRow = { id: number; name: string; latitude: number; longitude: number; radius_m: number };
const toCampus = (r: CampusRow): Campus => ({
  id: r.id, name: r.name, latitude: r.latitude, longitude: r.longitude, radiusM: r.radius_m,
});

export const campusesRepo: CampusesRepo = {
  async list() {
    const db = await getDb();
    return (await db.getAllAsync<CampusRow>('SELECT * FROM campuses ORDER BY name')).map(toCampus);
  },
  async save(c) {
    const db = await getDb();
    const res = await db.runAsync(
      'INSERT INTO campuses (name, latitude, longitude, radius_m) VALUES (?, ?, ?, ?)',
      [c.name, c.latitude, c.longitude, c.radiusM],
    );
    return { id: res.lastInsertRowId, ...c };
  },
  async remove(id) {
    const db = await getDb();
    await db.runAsync('DELETE FROM campuses WHERE id = ?', [id]);
  },
};

type GoalRow = { id: number; period: Goal['period']; target_minutes: number; start_date: string };
const toGoal = (r: GoalRow): Goal => ({
  id: r.id, period: r.period, targetMinutes: r.target_minutes, startDate: r.start_date,
});

export const goalsRepo: GoalsRepo = {
  async getActive(period) {
    const db = await getDb();
    const row = await db.getFirstAsync<GoalRow>(
      'SELECT * FROM goals WHERE period = ? ORDER BY id DESC LIMIT 1', [period],
    );
    return row ? toGoal(row) : null;
  },
  async set(g) {
    const db = await getDb();
    const res = await db.runAsync(
      'INSERT INTO goals (period, target_minutes, start_date) VALUES (?, ?, ?)',
      [g.period, g.targetMinutes, g.startDate],
    );
    return { id: res.lastInsertRowId, ...g };
  },
};