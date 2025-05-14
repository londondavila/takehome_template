const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Repository {
    id: ID!
    name: String!
    owner: String!
    url: String!
    releases: [Release!]!
    latestRelease: Release
  }

  type Release {
    id: ID!
    repository_id: ID!
    name: String
    tag_name: String
    body: String
    published_at: String
    created_at: String!
    seen: Boolean!
  }

  type Query {
    repositories: [Repository!]!
    repository(id: ID!): Repository
    releases(repositoryId: ID!): [Release!]!
  }

  type Mutation {
    addRepository(url: String!): Repository!
    removeRepository(id: ID!): Boolean!
    toggleReleaseSeen(id: ID!): Release!
    # refreshRepositories: Boolean! TODO
    refreshRepository(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };
