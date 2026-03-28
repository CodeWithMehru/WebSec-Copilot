"use client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import Link from "next/link";
import { Brain, ExternalLink } from "lucide-react";
import { SourceBadge } from "@/components/common/source-badge";

import { useScan } from "@/components/providers/scan-provider";

export default function IntelligencePage() {
  const { activeScanId } = useScan();
  const findings = useQuery(api.findings.getByScan, activeScanId ? { scanId: activeScanId } : "skip");
  const intelligence = useQuery(api.intelligence.getByScan, activeScanId ? { scanId: activeScanId } : "skip");

  if (!activeScanId) {
    return (
      <AppShell>
        <PageHeader title="Threat Intelligence" description="Real-world context for your specific vulnerabilities" />
        <EmptyState title="No active scan" description="Run a scan to see context-aware threat intelligence" icon={Brain} />
      </AppShell>
    );
  }

  if (!findings || !intelligence) {
    return (
      <AppShell>
        <PageHeader title="Threat Intelligence" description="Real-world context for your specific vulnerabilities" />
        <LoadingState message="Loading intelligence data..." />
      </AppShell>
    );
  }

  // Filter findings that have at least one intelligence item linked
  // OR just show all findings and their linked items
  const uniqueFindings = findings.filter((f, i, self) => 
    self.findIndex(t => t.title === f.title) === i
  );

  return (
    <AppShell>
      <PageHeader title="Threat Intelligence" description="Real-world exploitation context and advisories for your scan results" />
      
      {uniqueFindings.length === 0 ? (
        <EmptyState title="No findings detected" description="Run a scan to see context-aware threat intelligence" icon={Brain} />
      ) : (
        <div className="space-y-12">
          {uniqueFindings.map((finding) => {
            const relatedIntel = intelligence.filter(item => 
              item.relatedFindings?.includes(finding._id)
            );

            return (
              <div key={finding._id} className="space-y-6">
                {/* Finding Header Group */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-800" />
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Targeted Research:</span>
                    <span className="text-sm font-semibold text-white uppercase">{finding.title}</span>
                  </div>
                  <div className="h-px flex-1 bg-neutral-800" />
                </div>

                {relatedIntel.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                    <Brain className="h-8 w-8 text-neutral-600 mb-2" />
                    <p className="text-xs text-neutral-500 italic uppercase tracking-tighter">No specific real-world incidents found for this vulnerability type yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedIntel.map((item) => {
                      const typeColors: Record<string, string> = { 
                        cve: "border-l-red-500", 
                        exploit: "border-l-orange-500", 
                        advisory: "border-l-yellow-500", 
                        blog: "border-l-blue-500", 
                        patch: "border-l-green-500", 
                        changelog: "border-l-purple-500", 
                        research: "border-l-cyan-500" 
                      };
                      
                      return (
                        <Link 
                          href={`/intelligence/${item._id}`} 
                          key={item._id} 
                          className={`group block rounded-xl border border-[hsl(var(--border))] border-l-2 ${typeColors[item.type] || "border-l-gray-500"} bg-[hsl(var(--card))] p-5 hover:bg-[hsl(var(--accent)/0.3)] transition-all hover:translate-y-[-2px]`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] tracking-wider">{item.type}</span>
                            {item.url && <ExternalLink className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] opacity-50 group-hover:opacity-100 transition-opacity" />}
                          </div>
                          <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">{item.title}</h3>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-3 mb-4 leading-relaxed">{item.summary}</p>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-800/50">
                            <SourceBadge source={item.source} />
                            {item.severity && (
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                item.severity === "high" || item.severity === "critical" ? "text-red-400 bg-red-400/10" : "text-neutral-500 bg-neutral-500/10"
                              }`}>
                                {item.severity}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
