require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { json } = require("body-parser");
const { GraphQLDateTime } = require("graphql-scalars");
const { Pool } = require("pg");
const { Octokit } = require("@octokit/rest");
const { createServer } = require("http");
const cron = require("node-cron");
const { typeDefs } = require("./schema");
const { resolvers } = require("./resolvers");
const { parseGitHubUrl } = require("./utils");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres", // Changed from app_db to postgres to match your actual database
  password: "postgres",
  port: 5432,
});

// Test the database connection
pool.query("SELECT NOW(), current_database()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Database connected:", res.rows[0]);
    console.log("Current database:", res.rows[0].current_database);

    // Check if repositories table exists
    pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'repositories')",
      (tableErr, tableRes) => {
        if (tableErr) {
          console.error("Error checking repositories table:", tableErr);
        } else {
          console.log("Repositories table exists:", tableRes.rows[0].exists);
        }
      }
    );
  }
});

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return error;
  },
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== "production",
});

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  await server.start();

  // Important: Use expressMiddleware correctly and pass the context
  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      context: async () => {
        return { pool, octokit };
      },
    })
  );

  app.listen(port, () => {
    console.log("GITHUB_TOKEN exists:", !!process.env.GITHUB_TOKEN);
    console.log(`Server running at http://localhost:${port}/graphql`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
