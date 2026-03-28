"use client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingState } from "@/components/common/loading-state";
import { EmptyState } from "@/components/common/empty-state";
import Link from "next/link";
import { FileText, Download, Trash2 } from "lucide-react";

export default function ReportsPage() {
  const reports = useQuery(api.reports.list);
  const removeAllReports = useMutation(api.reports.removeAll);

  const formatIST = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " IST";
  };

  if (!reports) {
    return (
      <AppShell>
        <PageHeader title="Reports" description="Generated security audit reports" />
        <LoadingState message="Loading reports..." />
      </AppShell>
    );
  }

  if (reports.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Reports" description="Generated security audit reports" />
        <EmptyState title="No reports yet" description="Reports are generated after scan completion" icon={FileText} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Reports" description="Generated security audit reports">
        {reports && reports.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete all reports? This action cannot be undone.")) {
                removeAllReports();
              }
            }}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:border-red-500/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
        )}
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Link href={`/reports/${r._id}`} key={r._id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:bg-[hsl(var(--accent)/0.3)] transition group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Security Report</h3>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${r.status === "ready" || r.status === "generated" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>{r.status}</span>
            </div>
            
            <div className="space-y-1 mb-4">
              <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Description:</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))/90 leading-relaxed line-clamp-2">{r.executiveSummary}</p>
            </div>

            <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center gap-2 text-[10px] font-medium text-[hsl(var(--muted-foreground))/60 uppercase tracking-wider">
              <span>{r.format.toUpperCase()}</span>
              <span>•</span>
              <span>{formatIST(r.generatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
