export interface Repository {
  id: string;
  github_id: number;
  name: string;
  owner: string;
  description: string | null;
  url: string;
  created_at: string;
  latestRelease?: Release;
  hasUnseenReleases: boolean;
}

export interface Release {
  id: string;
  repository_id: string;
  release_id: string;
  tag_name: string;
  name: string | null;
  body: string | null;
  published_at: string;
  html_url: string;
  created_at: string;
  seen: boolean;
}