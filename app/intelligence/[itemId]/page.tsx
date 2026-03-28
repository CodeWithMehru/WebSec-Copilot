"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/common/loading-state";
import { SourceBadge } from "@/components/common/source-badge";
import { ChevronRight, ExternalLink, Tag } from "lucide-react";
import Link from "next/link";

export default function IntelligenceDetailPage() {
  const params = useParams();
  const item = useQuery(api.intelligence.get, { id: params.itemId as Id<"intelligence"> });

  if (!item) return <AppShell><LoadingState message="Loading intelligence item..." /></AppShell>;

  return (
    <AppShell>
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-4">
        <Link href="/intelligence" className="hover:text-white transition">Intelligence</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white truncate max-w-xs">{item.title}</span>
      </div>

      <div className="max-w-3xl">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] mb-2 inline-block">{item.type}</span>
              <h1 className="text-xl font-bold text-white mt-2">{item.title}</h1>
            </div>
            {item.severity && <span className="shrink-0 text-xs uppercase font-medium text-[hsl(var(--muted-foreground))]">{item.severity}</span>}
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">{item.summary}</p>
          <div className="flex flex-wrap items-center gap-3">
            <SourceBadge source={item.source} />
            {item.publishedAt && <span className="text-xs text-[hsl(var(--muted-foreground))]">Published: {item.publishedAt}</span>}
          </div>
        </div>

        {item.url && (
          <a href={item.url} target="_blank" rel="noopener" className="flex items-center gap-2 mb-5 text-sm text-[hsl(var(--primary))] hover:underline">
            <ExternalLink className="h-4 w-4" /> {item.url}
          </a>
        )}

        {item.relatedCves && item.relatedCves.length > 0 && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 mb-5">
            <h3 className="text-sm font-semibold text-white mb-3">Related CVEs</h3>
            <div className="flex flex-wrap gap-2">
              {item.relatedCves.map((cve) => (
                <span key={cve} className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">{cve}</span>
              ))}
            </div>
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Tag className="h-4 w-4" />Tags</h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-[hsl(var(--secondary))] text-xs text-[hsl(var(--muted-foreground))]">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
