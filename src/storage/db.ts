import { mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";

export type AppDatabase = Database.Database;

export const DEFAULT_DATABASE_PATH = "data/freela-agent.sqlite";

export function openDatabase(databasePath = DEFAULT_DATABASE_PATH): AppDatabase {
  mkdirSync(dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

export function resetDatabase(databasePath = DEFAULT_DATABASE_PATH): void {
  try {
    unlinkSync(databasePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export function migrate(db: AppDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      technologies_json TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      english_level TEXT NOT NULL,
      minimum_hourly_rate REAL NOT NULL,
      preferred_job_types_json TEXT NOT NULL,
      avoid_json TEXT NOT NULL,
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      external_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      url TEXT NOT NULL,
      budget_type TEXT NOT NULL,
      budget_min REAL,
      budget_max REAL,
      currency TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      posted_at TEXT,
      detected_skills_json TEXT NOT NULL,
      raw_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_platform_external_id
      ON jobs(platform, external_id)
      WHERE external_id IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_url
      ON jobs(url)
      WHERE url <> 'unknown';

    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      summary TEXT NOT NULL,
      match_reasons_json TEXT NOT NULL,
      warnings_json TEXT NOT NULL,
      analyzed_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_recommendations_job_id
      ON recommendations(job_id);

    CREATE INDEX IF NOT EXISTS idx_recommendations_profile_analyzed_at
      ON recommendations(profile_id, analyzed_at);

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      UNIQUE(job_id)
    );
  `);
}
