"use client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { useScan } from "@/components/providers/scan-provider";

export default function FindingsPage() {
  const { activeScanId } = useScan();
  const findings = useQuery(api.findings.getByScan, activeScanId ? { scanId: activeScanId } : "skip");

  return (
    <AppShell>
      <PageHeader title="Findings" description="All security findings across your scans" />
      {!activeScanId ? (
        <EmptyState title="No active scan" description="Run a security audit to see findings here" icon={AlertTriangle} />
      ) : !findings ? (
        <LoadingState message="Loading findings..." />
      ) : findings.length === 0 ? (
        <EmptyState title="No findings yet" description="Scan results will appear here" icon={AlertTriangle} />
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider hidden lg:table-cell">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {findings.map((f) => {
                  const sevColors: Record<string, string> = { critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-blue-500", info: "bg-gray-500" };
                  const sevBg: Record<string, string> = { critical: "bg-red-500/10 text-red-400", high: "bg-orange-500/10 text-orange-400", medium: "bg-yellow-500/10 text-yellow-400", low: "bg-blue-500/10 text-blue-400", info: "bg-gray-500/10 text-gray-400" };
                  return (
                    <tr key={f._id} className="hover:bg-[hsl(var(--accent)/0.3)] transition cursor-pointer">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] uppercase font-medium ${sevBg[f.severity] || ""}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sevColors[f.severity] || ""}`} />
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/findings/${f._id}`} className="text-white hover:text-[hsl(var(--primary))] transition">{f.title}</Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[hsl(var(--muted-foreground))] text-xs capitalize">{f.category.replace(/-/g, " ")}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-[hsl(var(--muted-foreground))] text-xs capitalize">{f.source}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[hsl(var(--muted-foreground))] text-xs">{f.confidence}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
