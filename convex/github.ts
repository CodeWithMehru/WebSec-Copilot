import { action } from "./_generated/server";
import { v } from "convex/values";

export const getRepoInfo = action({
  args: { owner: v.string(), repo: v.string() },
  handler: async (_, args) => {
    const token = process.env.GITHUB_TOKEN || "";
    const headers: HeadersInit = { Accept: "application/vnd.github.v3+json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`https://api.github.com/repos/${args.owner}/${args.repo}`, {
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
});
