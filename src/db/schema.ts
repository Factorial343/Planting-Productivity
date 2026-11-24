import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('planting.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mode TEXT NOT NULL,
          start_time INTEGER NOT NULL,
          end_time INTEGER,
          planned_ms INTEGER NOT NULL,
          focused_ms INTEGER NOT NULL,
          pickup_count INTEGER NOT NULL,
          campus_id INTEGER,
          end_reason TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions(start_time);
        CREATE TABLE IF NOT EXISTS campuses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          radius_m REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          period TEXT NOT NULL,
          target_minutes INTEGER NOT NULL,
          start_date TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS goal_rounds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          week_start INTEGER NOT NULL,
          start_ms INTEGER NOT NULL,
          target_minutes INTEGER NOT NULL,
          plant TEXT NOT NULL,
          completed_at INTEGER
        );
        CREATE INDEX IF NOT EXISTS idx_goal_rounds_week ON goal_rounds(week_start);
      `);
      return db;
    })();
  }
  return dbPromise;
}