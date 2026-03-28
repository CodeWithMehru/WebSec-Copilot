const GITHUB_API = "https://api.github.com";

export class GitHubClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || "";
  }

  private headers(): HeadersInit {
    const h: HeadersInit = { Accept: "application/vnd.github.v3+json" };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
      const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getTree(owner: string, repo: string, branch = "main"): Promise<GitHubTreeItem[]> {
    try {
      const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
        headers: this.headers(),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.tree || [];
    } catch {
      return [];
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
        headers: { ...this.headers(), Accept: "application/vnd.github.v3.raw" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  default_branch: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
}

export const githubClient = new GitHubClient();
