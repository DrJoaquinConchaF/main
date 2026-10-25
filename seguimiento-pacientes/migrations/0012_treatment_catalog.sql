CREATE TABLE IF NOT EXISTS clinical_catalogs (
 key TEXT PRIMARY KEY,
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
