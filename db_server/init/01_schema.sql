-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the repositories table
CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    owner VARCHAR(255),
    CONSTRAINT repositories_pkey PRIMARY KEY (id)
);

-- Create an index on the id column for faster lookups (already implied by PRIMARY KEY)
CREATE INDEX IF NOT EXISTS idx_repositories_id ON repositories(id);

-- Create the releases table
CREATE TABLE IF NOT EXISTS releases (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER NOT NULL, -- repositories table
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    tag_name TEXT,
    created_at VARCHAR(255),
    published_at VARCHAR(255),
    CONSTRAINT fk_repository FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
);

-- Create an index on repository_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_releases_repository_id ON releases(repository_id);

-- Insert some sample data
INSERT INTO repositories (name, url, owner) VALUES
    ('react', 'https://github.com/facebook/react', 'facebook'),
ON CONFLICT (owner) DO NOTHING; 