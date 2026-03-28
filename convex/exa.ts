import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const searchVulnerabilities = action({
  args: {
    scanId: v.id("scans"),
    query: v.string(),
    findingId: v.optional(v.id("findings")),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.EXA_API_KEY || "";
    if (!apiKey) return [];

    try {
      const res = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({
          query: args.query,
          numResults: 5,
          type: "auto",
          useAutoprompt: true,
          contents: { text: { maxCharacters: 1000 } },
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const results = data.results || [];

      for (const r of results) {
        await ctx.runMutation(api.intelligence.create, {
          scanId: args.scanId,
          type: "research",
          title: r.title || "Research",
          summary: r.text?.substring(0, 500) || "No summary",
          url: r.url,
          source: "exa",
          publishedAt: r.publishedDate,
          tags: ["exa-search"],
          relatedFindings: args.findingId ? [args.findingId] : [],
        });
      }

      return results;
    } catch {
      return [];
    }
  },
});
