CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    owner VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS releases (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    tag_name TEXT,
    created_at VARCHAR(255),
    published_at VARCHAR(255),
    CONSTRAINT fk_repository FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
);
