CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY,
    'name' TEXT,
    'language' TEXT,
    'text' TEXT,
    'encrypted' BOOLEAN,
    position REAL,
    updated_at DATETIME,
    created_at DATETIME
);

-- SELECT * FROM snippets;
