"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/common/loading-state";
import { CopyButton } from "@/components/common/copy-button";
import { SourceBadge } from "@/components/common/source-badge";
import { ChevronRight, Shield, Zap, Target, AlertTriangle, Wrench, Code, BookOpen } from "lucide-react";
import Link from "next/link";

export default function FindingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const finding = useQuery(api.findings.get, { id: params.findingId as Id<"findings"> });

  if (!finding) return <AppShell><LoadingState message="Loading finding..." /></AppShell>;

  const sevColors: Record<string, string> = { critical: "bg-red-500/10 text-red-400 border-red-500/20", high: "bg-orange-500/10 text-orange-400 border-orange-500/20", medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", low: "bg-blue-500/10 text-blue-400 border-blue-500/20", info: "bg-gray-500/10 text-gray-400 border-gray-500/20" };
  const ai = finding.aiExplanation;

  return (
    <AppShell>
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-4">
        <Link href="/findings" className="hover:text-white transition">Findings</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white truncate max-w-xs">{finding.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-white">{finding.title}</h1>
              <span className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs uppercase font-semibold ${sevColors[finding.severity] || ""}`}>{finding.severity}</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">{finding.description}</p>
            <div className="flex flex-wrap gap-2">
              <SourceBadge source={finding.source} />
              <span className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] capitalize">{finding.category.replace(/-/g, " ")}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">Confidence: {finding.confidence}%</span>
            </div>
          </div>

          {/* Evidence */}
          {finding.evidence && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Code className="h-4 w-4 text-purple-400" />Evidence</h3>
              <div className="rounded-lg bg-[hsl(var(--secondary))] p-4 font-mono text-xs text-[hsl(var(--muted-foreground))] overflow-x-auto relative">
                <div className="absolute top-2 right-2"><CopyButton text={finding.evidence.raw} /></div>
                <pre className="whitespace-pre-wrap">{finding.evidence.raw}</pre>
              </div>
              {finding.evidence.location && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Location: {finding.evidence.location}</p>}
            </div>
          )}

          {/* AI Explanation */}
          {ai && (
            <div className="space-y-4">
              {[
                { icon: Shield, title: "What Happened", content: ai.whatHappened, color: "text-blue-400" },
                { icon: AlertTriangle, title: "Impact", content: ai.impact, color: "text-red-400" },
              ].filter(s => s.content).map(({ icon: Icon, title, content, color }) => (
                <div key={title} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} />{title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed text-sm whitespace-pre-wrap">{content}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Fix this issue Redirect Button (Analysis -> Remediation handoff) */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-400" />
              Remediation
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              Fix recommendations are managed in the Remediation module.
            </p>

            <hr className="my-6 border-neutral-800" />
            
            <p className="text-xs text-neutral-400 mb-2">
              Want to fix this vulnerability?
            </p>
            
            <button 
              className="mt-2 text-sm text-blue-500 hover:underline flex items-center gap-1 group transition"
              onClick={() => {
                router.push(`/remediation/scan/${finding.scanId}?findingId=${finding._id}`);
              }}
            >
              🔧 Fix this issue &rarr;
            </button>
          </div>
          {finding.references && finding.references.length > 0 && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">References</h3>
              <ul className="space-y-2">
                {finding.references.map((ref, i) => (
                  <li key={i}><a href={ref} target="_blank" rel="noopener" className="text-xs text-[hsl(var(--primary))] hover:underline truncate block">{ref}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
