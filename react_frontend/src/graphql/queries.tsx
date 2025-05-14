import { gql } from "@apollo/client";

export const GET_REPOSITORIES = gql`
  query GetRepositories {
    repositories {
      id
      name
      owner
      url
      latestRelease {
        id
        tag_name
        published_at
        seen
      }
    }
  }
`;

export const GET_REPOSITORY_DETAILS = gql`
  query GetRepositoryDetails($id: ID!) {
    repository(id: $id) {
      id
      name
      owner
      url
      releases {
        id
        repository_id
        name
        tag_name
        body
        published_at
        created_at
        seen
      }
    }
  }
`;

export const GET_LATEST_RELEASE = gql`
  query GetLatestRelease($id: ID!) {
    repository(id: $id) {
      id
      name
      latestRelease {
        id
        name
        tag_name
        body
        published_at
        created_at
        seen
      }
    }
  }
`;
