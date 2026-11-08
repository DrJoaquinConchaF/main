CREATE TABLE IF NOT EXISTS private_access (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  password_hash TEXT,
  password_salt TEXT,
  recovery_hash TEXT,
  recovery_expires INTEGER
);
