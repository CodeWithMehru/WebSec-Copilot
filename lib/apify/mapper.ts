import type { IntelligenceItem } from "@/types/intelligence";

export function mapApifyToIntelligence(items: unknown[], scanId: string): Omit<IntelligenceItem, "id">[] {
  return (items as Array<Record<string, unknown>>).map((item) => ({
    scanId,
    type: "advisory" as const,
    title: String(item.title || item.name || "Advisory"),
    summary: String(item.text || item.description || item.content || "").substring(0, 500),
    url: String(item.url || item.link || ""),
    source: "apify" as const,
    tags: ["apify-scrape"],
  }));
}
