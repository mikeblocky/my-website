CREATE UNIQUE INDEX IF NOT EXISTS one_folder_per_person ON vault_folders(lower(person));
CREATE TABLE IF NOT EXISTS vault_comments (id TEXT PRIMARY KEY, folder_id TEXT NOT NULL REFERENCES vault_folders(id), file_id TEXT REFERENCES vault_files(id), x REAL CHECK(x IS NULL OR (x>=0 AND x<=1)), y REAL CHECK(y IS NULL OR (y>=0 AND y<=1)), author TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','viewer')), body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS vault_comments_folder ON vault_comments(folder_id,created_at);
