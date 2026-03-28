import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const scrapeAdvisory = action({
  args: {
    scanId: v.id("scans"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const token = process.env.APIFY_API_TOKEN || "";
    if (!token) return null;

    try {
      const res = await fetch("https://api.apify.com/v2/acts/apify~cheerio-scraper/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          startUrls: [{ url: args.url }],
          maxCrawlPages: 5,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) return null;
      const data = await res.json();
      const runId = data?.data?.id;

      if (runId) {
        await ctx.runMutation(api.intelligence.create, {
          scanId: args.scanId,
          type: "advisory",
          title: `Advisory scraping started: ${args.url}`,
          summary: `Apify scraping run ${runId} initiated`,
          url: args.url,
          source: "apify",
          tags: ["apify-scrape", "pending"],
        });
      }
      return runId;
    } catch {
      return null;
    }
  },
});
