CREATE TABLE IF NOT EXISTS patient_histories (
 patient_id TEXT PRIMARY KEY REFERENCES patients(id),
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS clinical_visits (
 patient_id TEXT NOT NULL REFERENCES patients(id),
 date TEXT NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data)),
 version INTEGER NOT NULL DEFAULT 1,
 revision_token TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 PRIMARY KEY(patient_id,date)
);
CREATE TABLE IF NOT EXISTS clinical_write_guards (
 token TEXT PRIMARY KEY,
 allowed INTEGER NOT NULL CHECK(allowed=1)
);
