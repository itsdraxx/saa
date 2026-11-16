import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: SqlJsDatabase;
let dbPath: string;
let saveTimer: ReturnType<typeof setInterval> | null = null;

// ─── Initialization (call once before app.listen) ─────
export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();

  dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, "..", "data", "saa.db");

  // Ensure the data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing DB from file or create a fresh one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Performance pragmas
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");

  // Create all tables
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     TEXT NOT NULL,
      author_name TEXT NOT NULL,
      text        TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      ip_hash     TEXT,
      visitor_id  TEXT
    );
  `);
  try {
    db.run("ALTER TABLE comments ADD COLUMN visitor_id TEXT;");
  } catch {}
  db.run("CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);");
  db.run("CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);");

  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     TEXT NOT NULL,
      visitor_id  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(post_id, visitor_id)
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);");

  db.run(`
    CREATE TABLE IF NOT EXISTS trivia_scores (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      score       INTEGER NOT NULL,
      total       INTEGER NOT NULL,
      percentage  REAL NOT NULL,
      time_taken  INTEGER,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      visitor_id  TEXT
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_trivia_scores ON trivia_scores(score DESC, time_taken ASC);");

  db.run(`
    CREATE TABLE IF NOT EXISTS wishes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      relation    TEXT,
      message     TEXT NOT NULL,
      emoji       TEXT DEFAULT '❤️',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      ip_hash     TEXT
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);");

  // Auto-save to disk every 10 seconds (sql.js is in-memory, we persist periodically)
  saveTimer = setInterval(() => saveDb(), 10_000);

  // Save on process exit
  process.on("SIGINT", () => { saveDb(); process.exit(0); });
  process.on("SIGTERM", () => { saveDb(); process.exit(0); });

  console.log(`  📦 SQLite database initialized at ${dbPath}`);
}

// ─── Persist in-memory DB to disk ─────────────────────
export function saveDb(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

// ─── Helper: Run a SELECT and return all rows as objects ─
export function dbAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  if (!db) throw new Error("Database not initialized — call initDb() first");
  const stmt = db.prepare(sql);
  stmt.bind(params as (string | number | null | Uint8Array)[]);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

// ─── Helper: Run a SELECT and return the first row ────
export function dbGet<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const rows = dbAll<T>(sql, params);
  return rows[0];
}

// ─── Helper: Run INSERT/UPDATE/DELETE ─────────────────
export function dbRun(sql: string, params: unknown[] = []): { lastId: number } {
  if (!db) throw new Error("Database not initialized — call initDb() first");
  db.run(sql, params as (string | number | null | Uint8Array)[]);

  // Get last insert rowid
  const row = dbGet<{ id: number }>("SELECT last_insert_rowid() as id");
  return { lastId: row?.id ?? 0 };
}
