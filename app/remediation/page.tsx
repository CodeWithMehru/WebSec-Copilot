// app/remediation/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import { Wrench, ChevronDown } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

import { useScan } from "@/components/providers/scan-provider";

export default function RemediationPage() {
  const router = useRouter();
  const { activeScanId } = useScan();

  const items = useQuery(
    api.remediations.getByScan,
    activeScanId ? { scanId: activeScanId } : "skip"
  );

  const updateStatus = useMutation(api.remediations.updateStatus);

  const priorityColors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-400",
    high: "bg-orange-500/10 text-orange-400",
    medium: "bg-yellow-500/10 text-yellow-400",
    low: "bg-blue-500/10 text-blue-400",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-500/10 text-gray-400",
    "in-progress": "bg-blue-500/10 text-blue-400",
    resolved: "bg-green-500/10 text-green-400",
    deferred: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <AppShell>
      <PageHeader
        title="Remediation Board"
        description="Track and manage security fixes"
      />

      {!activeScanId ? (
        <EmptyState
          title="No active scan"
          description="Run a security audit to see remediation steps here"
          icon={Wrench}
        />
      ) : items === undefined ? (
        <LoadingState message="Loading remediations..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No remediations"
          description="Scan results will appear here"
          icon={Wrench}
        />
      ) : (
        <div className="space-y-4 pb-10">
          {items.map((item) => {
            const ai = item.finding?.aiExplanation;
            
            // Preview logic: first 300 characters
            const rawContent = ai?.fixRecommendation || item.fixSuggestion || "";
            const isLong = rawContent.length > 300;
            const preview = isLong ? rawContent.slice(0, 300) : rawContent;

            const handleCardClick = () => {
              // Navigate to scan-specific detail page with finding highlighting via query param
              router.push(`/remediation/scan/${item.scanId}?findingId=${item.findingId}`);
            };

            return (
              <div
                key={item._id}
                onClick={handleCardClick}
                className="group relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition hover:border-blue-500/30 cursor-pointer overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded ${
                          priorityColors[item.priority] || ""
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
                        {item.effort} effort
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition truncate">
                      {item.title}
                    </h3>

                    <div className="text-xs text-[hsl(var(--muted-foreground))] whitespace-pre-wrap line-clamp-2 italic">
                       {ai?.whatHappened || item.description || "No description available."}
                    </div>

                    {/* AI Fix Recommendation Preview */}
                    {preview && (
                      <div className="text-xs mt-3 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10 whitespace-pre-wrap break-words leading-relaxed relative">
                        <strong className="text-blue-400 block mb-1 uppercase tracking-wider text-[10px]">AI Fix Recommendation</strong>
                        {preview}
                        {isLong && (
                          <span className="inline-block ml-1 text-blue-400 font-bold group-hover:underline">... More →</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatus({
                          id: item._id as Id<"remediations">,
                          status: e.target.value,
                        })
                      }
                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer ${
                        statusColors[item.status] || ""
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="deferred">Deferred</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}