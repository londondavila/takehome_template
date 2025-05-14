const { parseGitHubUrl } = require("./utils");

const resolvers = {
  Query: {
    repositories: async (_, __, context) => {
      try {
        const { pool } = context;

        if (!pool) {
          throw new Error("Database connection pool is not defined in context");
        }

        const dbInfoResult = await pool.query(
          "SELECT current_database(), current_schema"
        );
        console.log("Current DB:", dbInfoResult.rows[0].current_database);
        console.log("Current Schema:", dbInfoResult.rows[0].current_schema);

        const tableCheckResult = await pool.query(
          "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'repositories')"
        );
        console.log(
          "Repositories table exists:",
          tableCheckResult.rows[0].exists
        );

        if (!tableCheckResult.rows[0].exists) {
          const publicSchemaCheck = await pool.query(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'repositories')"
          );
          console.log(
            "Repositories table exists in public schema:",
            publicSchemaCheck.rows[0].exists
          );

          if (publicSchemaCheck.rows[0].exists) {
            const result = await pool.query(
              "SELECT * FROM public.repositories ORDER BY id ASC"
            );
            return result.rows || [];
          }
        }

        const result = await pool.query(
          "SELECT * FROM repositories ORDER BY id ASC"
        );
        return result.rows || [];
      } catch (error) {
        console.error("Error fetching repositories:", error);
        throw new Error(`Failed to fetch repositories: ${error.message}`);
      }
    },

    repository: async (_, { id }, { pool }) => {
      const result = await pool.query(
        "SELECT * FROM repositories WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    },

    releases: async (_, { repositoryId }, context) => {
      const { pool } = context;

      if (!pool) {
        throw new Error("Database connection pool is not defined in context");
      }

      try {
        const result = await pool.query(
          "SELECT * FROM releases WHERE repository_id = $1 ORDER BY created_at DESC",
          [repositoryId]
        );
        return result.rows || [];
      } catch (error) {
        console.error("Error fetching releases:", error);
        throw new Error(`Failed to fetch releases: ${error.message}`);
      }
    },
  },

  Repository: {
    releases: async ({ id }, _, { pool }) => {
      const result = await pool.query(
        "SELECT * FROM releases WHERE repository_id = $1 ORDER BY created_at DESC",
        [id]
      );
      return result.rows;
    },
    latestRelease: async ({ id }, _, { pool }) => {
      const result = await pool.query(
        "SELECT * FROM releases WHERE repository_id = $1 ORDER BY created_at DESC LIMIT 1",
        [id]
      );
      return result.rows[0] || null;
    },
  },

  Mutation: {
    addRepository: async (_, { url }, context) => {
      const { pool, octokit } = context;

      if (!pool || !octokit) {
        throw new Error("Missing required dependencies in context");
      }

      const client = await pool.connect();
      try {
        const { owner, name } = parseGitHubUrl(url);
        console.log(`Adding repository ${owner}/${name}`);

        const { data: repo } = await octokit.repos.get({
          owner,
          repo: name,
        });

        const existingRepo = await client.query(
          "SELECT * FROM repositories WHERE name = $1 AND url = $2",
          [repo.name, repo.html_url]
        );

        if (existingRepo.rows.length > 0) {
          console.log("Repository already exists:", existingRepo.rows[0]);
          return existingRepo.rows[0];
        }

        const tableInfoResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'repositories'
          ORDER BY ordinal_position
        `);

        const columns = tableInfoResult.rows.map((row) => row.column_name);
        console.log("Repository table columns:", columns);

        query = `INSERT INTO repositories (name, owner, url) 
                  VALUES ($1, $2, $3) RETURNING *`;
        params = [repo.name, owner, repo.html_url];

        console.log("Executing query:", query);
        console.log("With params:", params);

        const result = await client.query(query, params);
        const newRepo = result.rows[0];
        console.log("New repository added:", newRepo);

        const releasesTableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'releases'
          )
        `);

        if (releasesTableExists.rows[0].exists) {
          try {
            const { data: releases } = await octokit.repos.listReleases({
              owner,
              repo: name,
              per_page: 10,
            });

            for (const release of releases) {
              await client.query(
                `INSERT INTO releases
                 (id, repository_id, name, tag_name, body, published_at, created_at, seen)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                  release.id.toString(),
                  newRepo.id,
                  release.name,
                  release.tag_name,
                  release.body,
                  release.published_at,
                  release.created_at,
                  release.seen || false,
                ]
              );
            }
            console.log(
              `Added ${releases.length} releases for repository ${owner}/${name}`
            );
          } catch (releaseError) {
            console.warn(
              `Could not fetch releases for ${owner}/${name}:`,
              releaseError.message
            );
          }
        } else {
          console.log(
            "Releases table doesn't exist - skipping release fetching"
          );
        }

        return newRepo;
      } catch (error) {
        console.error("Error adding repository:", error);
        throw new Error(`Failed to add repository: ${error.message}`);
      } finally {
        client.release();
      }
    },

    removeRepository: async (_, { id }, context) => {
      const { pool } = context;

      if (!pool) {
        throw new Error("Database connection pool is not defined in context");
      }

      try {
        const result = await pool.query(
          "DELETE FROM repositories WHERE id = $1 RETURNING *",
          [id]
        );

        if (result.rows.length === 0) {
          throw new Error(`Repository with id ${id} not found`);
        }

        console.log("Repository removed:", result.rows[0]);
        return true;
      } catch (error) {
        console.error("Error removing repository:", error);
        throw new Error(`Failed to remove repository: ${error.message}`);
      }
    },

    toggleReleaseSeen: async (_, { id }, { pool }) => {
      try {
        const result = await pool.query(
          `UPDATE releases 
          SET seen = NOT seen 
          WHERE id = $1 
          RETURNING *`,
          [id]
        );
        return result.rows[0];
      } catch (error) {
        console.error("Error toggling release seen status:", error);
        throw new Error("Failed to toggle release seen status");
      }
    },

    refreshRepository: async (_, { id }, { pool, octokit }) => {
      const client = await pool.connect();

      try {
        const repoResult = await client.query(
          "SELECT id, owner, name FROM repositories WHERE id = $1",
          [id]
        );

        if (repoResult.rows.length === 0) {
          throw new Error(`Repository with id ${id} not found`);
        }

        const repo = repoResult.rows[0];

        const { data: latestRelease } = await octokit.repos.getLatestRelease({
          owner: repo.owner,
          repo: repo.name,
        });
        const releaseExists = await client.query(
          "SELECT id FROM releases WHERE repository_id = $1 AND id = $2",
          [repo.id, latestRelease.id.toString()]
        );

        console.log(releaseExists);

        if (releaseExists.rows.length === 0) {
          await client.query(
            `INSERT INTO releases
             (repository_id, id, tag_name, name, body, published_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              repo.id,
              latestRelease.id.toString(),
              latestRelease.tag_name,
              latestRelease.name || "",
              latestRelease.body || "",
              latestRelease.published_at,
            ]
          );
        } else {
          await client.query(
            `UPDATE releases
             SET tag_name = $1, name = $2, body = $3, published_at = $4
             WHERE repository_id = $5 AND id = $6`,
            [
              latestRelease.tag_name,
              latestRelease.name || "",
              latestRelease.body || "",
              latestRelease.published_at,
              repo.id,
              latestRelease.id.toString(),
            ]
          );
        }

        return true;
      } catch (error) {
        console.error(
          `Error refreshing repository with id ${id}:`,
          error.message
        );
        throw new Error(`Failed to refresh repository: ${error.message}`);
      } finally {
        client.release();
      }
    },
  },
};

module.exports = { resolvers };
