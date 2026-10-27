CREATE TABLE IF NOT EXISTS questions (
  user_id TEXT PRIMARY KEY NOT NULL,
  db_json TEXT NOT NULL,
  created_at TEXT DEFAULT (DATETIME('now', 'localtime')),
  updated_at TEXT DEFAULT (DATETIME('now', 'localtime'))
);
