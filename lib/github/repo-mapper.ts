import type { GitHubRepo } from "./client";

export function mapRepoMetadata(repo: GitHubRepo) {
  return {
    name: repo.full_name,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    topics: repo.topics,
    visibility: repo.visibility,
    defaultBranch: repo.default_branch,
    htmlUrl: repo.html_url,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
  };
}
