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
      `);
      return db;
    })();
  }
  return dbPromise;
}