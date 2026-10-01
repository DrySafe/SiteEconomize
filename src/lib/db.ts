import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import type { EventEntry } from "./event-validation";
import { seed } from "./seed";
let instance: DatabaseSync;
export function db() {
  if (instance) return instance;
  const directory = resolve(
    /* turbopackIgnore: true */ process.env.DATA_DIR || "./data",
  );
  mkdirSync(directory, { recursive: true });
  instance = new DatabaseSync(join(directory, "grupo-e.sqlite"));
  instance.exec(
    "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY, type TEXT NOT NULL, data BLOB NOT NULL); CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);",
  );
  if (!instance.prepare("SELECT value FROM meta WHERE key=?").get("seeded")) {
    instance.exec("BEGIN IMMEDIATE");
    try {
      const insert = instance.prepare(
        "INSERT OR IGNORE INTO events(id,slug,data) VALUES(?,?,?)",
      );
      for (const entry of seed)
        insert.run(entry.id, entry.slug, JSON.stringify(entry));
      instance
        .prepare("INSERT INTO meta(key,value) VALUES(?,?)")
        .run("seeded", "1");
      instance.exec("COMMIT");
    } catch (error) {
      instance.exec("ROLLBACK");
      throw error;
    }
  }
  return instance;
}
export function getEvents(includeDrafts = false): EventEntry[] {
  const rows = db().prepare("SELECT data FROM events").all() as {
    data: string;
  }[];
  return rows
    .map((r) => JSON.parse(r.data) as EventEntry)
    .filter((e) => includeDrafts || e.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function getEvent(slug: string, includeDrafts = false) {
  const row = db().prepare("SELECT data FROM events WHERE slug=?").get(slug) as
    { data: string } | undefined;
  if (!row) return;
  const entry = JSON.parse(row.data) as EventEntry;
  return includeDrafts || entry.status === "published" ? entry : undefined;
}
export function saveEvent(entry: EventEntry) {
  db()
    .prepare(
      "INSERT INTO events(id,slug,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,data=excluded.data",
    )
    .run(entry.id, entry.slug, JSON.stringify(entry));
}
