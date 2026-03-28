"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/common/loading-state";
import { Shield, AlertTriangle, Bug, Brain, Wrench, Clock, CheckCircle2, Activity, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score <= 20 ? "#ef4444" : score <= 40 ? "#f97316" : score <= 60 ? "#eab308" : score <= 80 ? "#3b82f6" : "#22c55e";
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 50 ? "D" : "F";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-white">{score}</span>
        <span className="text-xs font-medium" style={{ color }}>{grade}</span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity, count }: { severity: string; count: number }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    info: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors[severity] || colors.info}`}>
      <span className="text-lg font-bold">{count}</span>
      <span className="text-xs capitalize">{severity}</span>
    </div>
  );
}

export default function ScanDashboard() {
  const params = useParams();
  const scanId = params.scanId as Id<"scans">;
  const data = useQuery(api.dashboard.getScanDashboard, { scanId });

  if (!data) return <AppShell><LoadingState message="Loading scan dashboard..." /></AppShell>;

  const { scan, project, findings, intelligence, remediations, categories, technologies } = data;
  const summary = scan.summary || { totalFindings: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0, overallScore: 0, threatLevel: "safe" };
  const isRunning = scan.status === "running" || scan.status === "pending";

  const threatColors: Record<string, string> = { critical: "text-red-400", high: "text-orange-400", medium: "text-yellow-400", low: "text-blue-400", safe: "text-green-400" };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
          <Link href="/audit" className="hover:text-white transition">Audits</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{project?.name || "Scan"}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Security Dashboard</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{project?.name || "Audit scan"}</p>
          </div>
          <div className="flex items-center gap-2">
            {isRunning ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                <Activity className="h-3.5 w-3.5 animate-pulse" /> Scanning... {scan.progress}%
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Score Card */}
        <div className="lg:col-span-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex flex-col items-center justify-center gradient-border">
          <ScoreRing score={summary.overallScore} />
          <p className="text-sm font-medium text-white mt-3">Overall Security Score</p>
          <p className={`text-xs font-medium capitalize mt-1 ${threatColors[summary.threatLevel] || ""}`}>
            {summary.threatLevel} Risk
          </p>
        </div>

        {/* Severity Breakdown */}
        <div className="lg:col-span-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" /> Findings Summary
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <SeverityBadge severity="critical" count={summary.critical} />
            <SeverityBadge severity="high" count={summary.high} />
            <SeverityBadge severity="medium" count={summary.medium} />
            <SeverityBadge severity="low" count={summary.low} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>Total: {summary.totalFindings}</span>
            <span>Info: {summary.info}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" /> Scan Overview
          </h3>
          <div className="space-y-3">
            {[
              { icon: Bug, label: "Findings", value: findings.length, color: "text-orange-400" },
              { icon: Brain, label: "Intelligence", value: intelligence.length, color: "text-blue-400" },
              { icon: Wrench, label: "Remediations", value: remediations.length, color: "text-green-400" },
              { icon: Clock, label: "Sources", value: scan.sources.join(", "), color: "text-purple-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
                </div>
                <span className="text-sm font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Scores */}
      {categories.length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Category Scores</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map(({ category, score, findingCount }) => {
              const color = score <= 40 ? "text-red-400" : score <= 70 ? "text-yellow-400" : "text-green-400";
              return (
                <div key={category} className="rounded-lg bg-[hsl(var(--secondary))] p-3 text-center">
                  <p className={`text-lg font-bold ${color}`}>{score}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize mt-0.5">{category.replace(/-/g, " ")}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{findingCount} findings</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Vulnerabilities */}
        <div className="lg:col-span-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3.5">
            <h3 className="text-sm font-semibold text-white">Top Vulnerabilities</h3>
            <Link href="/findings" className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">View all <ExternalLink className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {findings.slice(0, 6).map((f) => {
              const severityColors: Record<string, string> = {
                critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-blue-500", info: "bg-gray-500",
              };
              return (
                <Link href={`/findings/${f._id}`} key={f._id} className="flex items-center gap-3 px-5 py-3 hover:bg-[hsl(var(--accent)/0.5)] transition">
                  <span className={`h-2 w-2 rounded-full ${severityColors[f.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{f.title}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize">{f.category} · {f.source}</p>
                  </div>
                  <span className="text-[10px] uppercase font-medium text-[hsl(var(--muted-foreground))]">{f.severity}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Intelligence Feed */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3.5">
            <h3 className="text-sm font-semibold text-white">Intelligence Feed</h3>
            <Link href="/intelligence" className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1">View all <ExternalLink className="h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {intelligence.slice(0, 5).map((item) => (
              <Link href={`/intelligence/${item._id}`} key={item._id} className="block px-5 py-3 hover:bg-[hsl(var(--accent)/0.5)] transition">
                <p className="text-xs text-white truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">{item.type}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{item.source}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Detected Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-md bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-xs text-white">{tech}</span>
              ))}
            </div>
          </div>
        )}

        {/* Remediation Summary */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Remediation Progress</h3>
            <Link href="/remediation" className="text-xs text-[hsl(var(--primary))] hover:underline">View all</Link>
          </div>
          {remediations.length > 0 ? (
            <div className="space-y-2">
              {remediations.slice(0, 3).map((r) => (
                <div key={r._id} className="flex items-center justify-between rounded-lg bg-[hsl(var(--secondary))] px-3 py-2">
                  <span className="text-xs text-white truncate flex-1">{r.title}</span>
                  <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded ${
                    r.status === "resolved" ? "bg-green-500/10 text-green-400" : r.status === "in-progress" ? "bg-blue-500/10 text-blue-400" : "bg-gray-500/10 text-gray-400"
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No remediations yet</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
