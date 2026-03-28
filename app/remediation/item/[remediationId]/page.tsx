// app/remediation/item/[remediationId]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { ChevronRight, ShieldCheck, Wrench, Code2, AlertTriangle, Info, Link as LinkIcon } from "lucide-react";

const STATUS_OPTIONS = ["pending", "in-progress", "resolved", "deferred"] as const;

export default function RemediationDetailPage() {
  const params = useParams();
  const remediationId = params.remediationId as Id<"remediations">;

  const remediation = useQuery(api.remediations.get, { id: remediationId });
  const updateStatus = useMutation(api.remediations.updateStatus);

  if (remediation === undefined) {
    return (
      <AppShell>
        <LoadingState message="Loading remediation..." />
      </AppShell>
    );
  }

  if (remediation === null) {
    return (
      <AppShell>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300">
          Remediation not found.
        </div>
      </AppShell>
    );
  }

  const ai = remediation.finding?.aiExplanation;
  const isRuntime = remediation.finding?.source === "runtime";

  const onStatusChange = async (status: string) => {
    await updateStatus({ id: remediation._id, status });
  };

  const renderBlock = (
    title: string,
    content?: string,
    Icon?: React.ComponentType<{ className?: string }>,
    variant: "default" | "blue" | "yellow" | "code" = "default"
  ) => {
    if (!content) return null;

    const variants = {
      default: "border-[hsl(var(--border))] bg-[hsl(var(--card))]",
      blue: "border-blue-500/20 bg-blue-500/5",
      yellow: "border-yellow-500/20 bg-yellow-500/5",
      code: "border-green-500/20 bg-black/40",
    };

    const iconColors = {
      default: "text-[hsl(var(--muted-foreground))]",
      blue: "text-blue-400",
      yellow: "text-yellow-400",
      code: "text-green-400",
    };

    return (
      <div className={`rounded-xl border p-6 ${variants[variant]}`}>
        <h2 className={`mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${iconColors[variant]}`}>
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </h2>

        {variant === "code" ? (
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/20 p-4 text-xs leading-relaxed text-green-300 font-mono">
            {content}
          </pre>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
            {content}
          </p>
        )}
      </div>
    );
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Link href="/remediation" className="transition hover:text-white">
          Remediation
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">Detail</span>
      </div>

      <PageHeader title={remediation.title}>
        <div className="flex items-center gap-2">
          <select
            value={remediation.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status} className="bg-black text-white">
                {status}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Priority", value: remediation.priority, color: "text-orange-400" },
            { label: "Effort", value: remediation.effort, color: "text-blue-400" },
            { label: "Status", value: remediation.status, color: "text-green-400" },
          ].map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center"
            >
              <div className="mb-1 text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--muted-foreground))]">
                {field.label}
              </div>
              <div className={`text-sm font-semibold capitalize ${field.color}`}>
                {field.value}
              </div>
            </div>
          ))}
        </div>

        {/* Simplified Runtime View: Overview -> AI Fix -> Impact -> Code -> Sources */}
        {renderBlock("Overview", ai?.whatHappened || remediation.description, ShieldCheck)}
        
        {renderBlock(
          "AI Fix Recommendation", 
          ai?.fixRecommendation || remediation.fixSuggestion, 
          Wrench, 
          "blue"
        )}

        {renderBlock("Impact", ai?.impact, AlertTriangle, "yellow")}

        {/* Detailed sections for Repo findings only */}
        {!isRuntime && (
          <>
            {renderBlock("Why It Happened", ai?.whyItHappened, Info)}
            {renderBlock("Exploitability", ai?.exploitability)}
            {renderBlock("Attacker Perspective", ai?.attackerPerspective)}
            {renderBlock("Stack Guidance", ai?.stackGuidance)}
          </>
        )}

        {renderBlock(
          "Safe Implementation Example", 
          ai?.saferExample || remediation.saferCode, 
          Code2, 
          "code"
        )}

        {/* Sources Section */}
        {ai?.sources && ai.sources.length > 0 && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
              <LinkIcon className="h-4 w-4" />
              Authoritative Sources
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ai.sources.map((source: string, idx: number) => (
                <a 
                  key={idx} 
                  href={source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 text-xs text-blue-400 transition hover:bg-white/10 hover:border-blue-500/30"
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500/50" />
                  <span className="truncate">{new URL(source).hostname}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}