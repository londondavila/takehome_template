import { gql } from "@apollo/client";

export const ADD_REPOSITORY = gql`
  mutation AddRepository($url: String!) {
    addRepository(url: $url) {
      id
      name
      url
    }
  }
`;

export const REMOVE_REPOSITORY = gql`
  mutation RemoveRepository($id: ID!) {
    removeRepository(id: $id)
  }
`;

export const MARK_RELEASE_AS_SEEN = gql`
  mutation MarkReleaseAsSeen($releaseId: ID!) {
    markReleaseAsSeen(releaseId: $releaseId)
  }
`;

export const TOGGLE_RELEASE_SEEN = gql`
  mutation ToggleReleaseSeen($id: ID!) {
    toggleReleaseSeen(id: $id) {
      id
      seen
    }
  }
`;

export const REFRESH_REPOSITORY = gql`
  mutation RefreshRepository($id: ID!) {
    refreshRepository(id: $id)
  }
`;

// TODO
// export const REFRESH_REPOSITORIES = gql`
//   mutation RefreshRepositories {
//     refreshRepositories
//   }
// `;
