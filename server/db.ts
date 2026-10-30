import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The database lives next to the project in data/ (gitignored). Override with BK117_DB_PATH.
export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const dbPath = process.env.BK117_DB_PATH ?? join(root, 'data', 'bk117.db');
if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(readFileSync(join(root, 'server', 'schema.sql'), 'utf8'));
