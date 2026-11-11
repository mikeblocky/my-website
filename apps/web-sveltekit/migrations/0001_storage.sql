CREATE TABLE IF NOT EXISTS redis_strings (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER);
CREATE TABLE IF NOT EXISTS redis_sorted (key TEXT NOT NULL, member_hash TEXT NOT NULL, value TEXT NOT NULL, score REAL NOT NULL, PRIMARY KEY(key, member_hash));
CREATE INDEX IF NOT EXISTS sorted_rank ON redis_sorted(key, score, member_hash);
CREATE TABLE IF NOT EXISTS redis_hashes (key TEXT NOT NULL, field TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY(key, field));
CREATE TABLE IF NOT EXISTS redis_archive (key TEXT PRIMARY KEY, type TEXT NOT NULL, object_key TEXT NOT NULL, expires_at INTEGER);
CREATE TABLE IF NOT EXISTS vault_folders (id TEXT PRIMARY KEY, person TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS vault_files (id TEXT PRIMARY KEY, folder_id TEXT NOT NULL REFERENCES vault_folders(id), object_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS vault_folder_files ON vault_files(folder_id, created_at);
CREATE TABLE IF NOT EXISTS auth_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
