import type { ExaSearchResult } from "./client";
import type { IntelligenceItem } from "@/types/intelligence";

export function mapExaToIntelligence(results: ExaSearchResult[], scanId: string, type: "cve" | "exploit" | "research" | "advisory" = "research"): Omit<IntelligenceItem, "id">[] {
  return results.map(r => ({
    scanId,
    type,
    title: r.title || "Untitled",
    summary: r.text?.substring(0, 500) || r.highlights?.join(" ") || "No summary available",
    url: r.url,
    source: "exa" as const,
    publishedAt: r.publishedDate,
    tags: ["exa-search"],
  }));
}
