// app/remediation/scan/[scanId]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { LoadingState } from "@/components/common/loading-state";
import { ChevronRight, Wrench, ShieldCheck, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { useEffect, useRef } from "react";

const STATUS_OPTIONS = ["pending", "in-progress", "resolved", "deferred"] as const;

export default function RemediationScanPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scanId = params.scanId as Id<"scans">;
  const activeFindingId = searchParams.get("findingId");

  const items = useQuery(
    api.remediations.getByScan,
    scanId ? { scanId } : "skip"
  );
  const updateStatus = useMutation(api.remediations.updateStatus);

  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeFindingId && items && activeRef.current) {
        activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeFindingId, items]);

  if (items === undefined) {
    return (
      <AppShell>
        <LoadingState message="Loading remediations..." />
      </AppShell>
    );
  }

  const priorityColors: Record<string, string> = {
    critical: "text-red-400 bg-red-500/10",
    high: "text-orange-400 bg-orange-500/10",
    medium: "text-yellow-400 bg-yellow-500/10",
    low: "text-blue-400 bg-blue-500/10",
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Link href="/remediation" className="transition hover:text-white">
          Remediation
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">Scan Plan</span>
      </div>

      <PageHeader
        title="Full Remediation Plan"
        description="Non-truncated implementation guidance for all scan findings"
      />

      <div className="space-y-6 pb-20">
        {items.length === 0 ? (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
            No remediation items found for this scan.
          </div>
        ) : (
          items.map((item) => {
            const isActive = item.findingId === activeFindingId;
            const ai = item.finding?.aiExplanation;

            return (
              <div
                key={item._id}
                ref={isActive ? activeRef : null}
                className={`rounded-xl border transition-all duration-500 ${
                  isActive 
                    ? "border-blue-500 ring-1 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                } bg-[hsl(var(--card))]`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${priorityColors[item.priority]}`}>
                          {item.priority}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 text-[hsl(var(--muted-foreground))]">
                          {item.effort} Effort
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] italic">
                        {ai?.whatHappened || item.description}
                      </p>
                    </div>

                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatus({
                          id: item._id as Id<"remediations">,
                          status: e.target.value,
                        })
                      }
                      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-6">
                    {/* AI Fix Recommendation - FULL VIEW */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
                      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
                        <Wrench className="h-4 w-4" />
                        AI Fix Recommendation
                      </h4>
                      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {ai?.fixRecommendation || item.fixSuggestion}
                      </div>
                    </div>

                    {/* Impact - FULL VIEW */}
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
                      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        Impact & Attacker Perspective
                      </h4>
                      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-yellow-50/80">
                        {ai?.impact}
                      </div>
                    </div>

                    {/* Stack Guidance */}
                    {ai?.stackGuidance && (
                      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">
                          Stack Guidance
                        </h4>
                        <p className="text-sm text-purple-100/70 leading-relaxed">
                          {ai.stackGuidance}
                        </p>
                      </div>
                    )}

                    {/* Safer Example */}
                    {(ai?.saferExample || item.saferCode) && (
                      <div className="rounded-xl border border-green-500/20 bg-black/40 p-6">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400 mb-4">
                          <ShieldCheck className="h-4 w-4" />
                          Safe Implementation Example
                        </h4>
                        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/20 p-4 text-xs leading-relaxed text-green-300 font-mono border border-white/5">
                          {ai?.saferExample || item.saferCode}
                        </pre>
                      </div>
                    )}

                    {/* Sources Grid */}
                    {ai?.sources && ai.sources.length > 0 && (
                      <div className="pt-4">
                         <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                          <LinkIcon className="h-3 w-3" />
                          Authoritative Sources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {ai.sources.map((source: string, idx: number) => (
                            <a 
                              key={idx} 
                              href={source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[10px] text-blue-400 hover:bg-white/10 transition"
                            >
                              <span className="truncate max-w-[150px]">{new URL(source).hostname}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}