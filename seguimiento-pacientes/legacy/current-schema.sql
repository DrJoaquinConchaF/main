CREATE TABLE audit_events (
 id TEXT PRIMARY KEY,
 action TEXT NOT NULL,
 resource_type TEXT NOT NULL,
 resource_id TEXT NOT NULL,
 actor TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE control_plans (
 patient_id TEXT NOT NULL REFERENCES patients(id),
 date TEXT NOT NULL,
 data TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 PRIMARY KEY(patient_id,date)
);
CREATE TABLE "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE document_templates (
 id TEXT PRIMARY KEY,
 kind TEXT NOT NULL CHECK(kind IN ('prescription','exam_order')),
 title TEXT NOT NULL,
 content TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE documents (
 id TEXT PRIMARY KEY,
 patient_id TEXT NOT NULL REFERENCES patients(id),
 kind TEXT NOT NULL CHECK(kind IN ('inbody','lab','other')),
 date TEXT NOT NULL,
 name TEXT NOT NULL,
 object_key TEXT NOT NULL UNIQUE,
 size INTEGER NOT NULL,
 extracted_text TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
, version INTEGER NOT NULL DEFAULT 1, content_sha256 TEXT);
CREATE TABLE patients (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 rut TEXT,
 email TEXT,
 phone TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
, name_search TEXT NOT NULL DEFAULT '', is_demo INTEGER NOT NULL DEFAULT 0 CHECK(is_demo IN (0,1)));
CREATE TABLE photo_links (
 id TEXT PRIMARY KEY,
 patient_id TEXT NOT NULL REFERENCES patients(id),
 token_hash TEXT NOT NULL UNIQUE,
 expires_at TEXT NOT NULL,
 revoked INTEGER NOT NULL DEFAULT 0,
 uploads INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
, attention_date TEXT);
CREATE TABLE photo_requests (
 id TEXT PRIMARY KEY,
 patient_id TEXT NOT NULL REFERENCES patients(id),
 attention_date TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('missing_email','unconfigured','sending','sent','failed')),
 recipient TEXT,
 link_id TEXT REFERENCES photo_links(id),
 message_id TEXT,
 sent_at TEXT,
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 UNIQUE(patient_id,attention_date)
);
CREATE TABLE photos (
 id TEXT PRIMARY KEY,
 patient_id TEXT NOT NULL REFERENCES patients(id),
 date TEXT NOT NULL,
 attention_date TEXT,
 angle TEXT NOT NULL,
 notes TEXT NOT NULL DEFAULT '',
 object_key TEXT NOT NULL UNIQUE,
 size INTEGER NOT NULL,
 content_sha256 TEXT NOT NULL,
 source TEXT NOT NULL CHECK(source IN ('professional','patient')),
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 UNIQUE(patient_id,content_sha256)
);
CREATE TABLE records (
 id TEXT PRIMARY KEY,
 patient_id TEXT NOT NULL REFERENCES patients(id),
 kind TEXT NOT NULL CHECK(kind IN ('habits','anthropometry','inbody','lab','exercise')),
 date TEXT NOT NULL,
 data TEXT NOT NULL CHECK(json_valid(data)),
 document_id TEXT REFERENCES documents(id),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
, version INTEGER NOT NULL DEFAULT 1, attention_date TEXT);
CREATE TABLE written_documents (
 id TEXT PRIMARY KEY,
 patient_id TEXT NOT NULL REFERENCES patients(id),
 date TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('prescription','exam_order')),
 title TEXT NOT NULL,
 content TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE UNIQUE INDEX documents_content_unique ON documents(patient_id,content_sha256)
  WHERE content_sha256 IS NOT NULL;
CREATE INDEX documents_patient_date ON documents(patient_id,date);
CREATE UNIQUE INDEX patients_rut ON patients(rut) WHERE rut IS NOT NULL AND rut <> '';
CREATE INDEX photo_links_patient ON photo_links(patient_id,created_at);
CREATE INDEX photos_patient_date ON photos(patient_id,date);
CREATE INDEX records_patient_date ON records(patient_id,date);
CREATE INDEX written_documents_patient_date ON written_documents(patient_id,date);
