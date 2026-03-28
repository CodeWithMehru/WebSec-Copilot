"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Download, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.reportId as Id<"reports">;
  const report = useQuery(api.reports.get, { id: reportId });

  if (report === undefined) {
    return (
      <AppShell>
        <LoadingState message="Loading report..." />
      </AppShell>
    );
  }

  if (report === null) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-red-400">Report not found.</div>
      </AppShell>
    );
  }

  const handleExport = (format: string) => {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "markdown") {
      let md = `# ${report.title}\n\n## Executive Summary\n\n${report.executiveSummary}\n\n`;
      for (const s of report.sections) {
        md += `## ${s.title}\n\n${s.content}\n\n`;
      }
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, "-")}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

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

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Link href="/reports" className="transition hover:text-white">
          Reports
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">Report Detail</span>
      </div>

      <PageHeader title="Security Report">
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("markdown")}
            className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-white transition hover:bg-[hsl(var(--accent))]"
          >
            <Download className="h-3.5 w-3.5" />
            Markdown
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-white transition hover:bg-[hsl(var(--accent))]"
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </button>
        </div>
      </PageHeader>

      <div className="max-w-4xl space-y-5">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <FileText className="h-5 w-5 text-blue-400" />
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {report.executiveSummary}
          </p>
        </div>

        {[...report.sections]
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
            >
              <h2 className="mb-3 text-sm font-semibold text-white">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {section.content}
              </p>
            </div>
          ))}
      </div>
    </AppShell>
  );
}