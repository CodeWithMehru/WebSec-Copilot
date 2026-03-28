"use client";
import { AppShell } from "@/components/layout/app-shell";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Loader2, ArrowRight, Shield, CheckCircle2 } from "lucide-react";

export default function DemoPage() {
  const router = useRouter();
  const seedDemo = useMutation(api.seed.seedDemoData);
  const scans = useQuery(api.scans.listRecent);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDemo();
      setSeeded(true);
      setTimeout(() => router.push(`/audit/${result.scanId}`), 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const existingScan = scans?.[0];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto pt-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Demo Mode</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-8 leading-relaxed">
          Load pre-seeded demo data to explore the full WebSec Copilot experience. This includes 18 security findings, 8 threat intelligence items, 6 remediation suggestions, and a complete audit report.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSeed}
            disabled={isSeeding || seeded}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/20 transition-all mx-auto"
          >
            {seeded ? (
              <><CheckCircle2 className="h-5 w-5" />Demo Data Loaded! Redirecting...</>
            ) : isSeeding ? (
              <><Loader2 className="h-5 w-5 animate-spin" />Seeding Demo Data...</>
            ) : (
              <><Sparkles className="h-5 w-5" />Load Demo Data</>
            )}
          </button>

          {existingScan && (
            <button
              onClick={() => router.push(`/audit/${existingScan._id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[hsl(var(--border))] text-white font-medium hover:bg-[hsl(var(--accent))] transition mx-auto"
            >
              <ArrowRight className="h-5 w-5" /> Go to Latest Scan
            </button>
          )}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Findings", value: "18", color: "text-orange-400" },
            { label: "Intelligence", value: "8", color: "text-blue-400" },
            { label: "Remediations", value: "6", color: "text-green-400" },
            { label: "Score", value: "38/100", color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 text-left">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" />Demo Scan Includes</h3>
          <ul className="space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
            <li>• <strong className="text-white">Website scan</strong> — security headers, cookies, TLS, technologies, JS exposure</li>
            <li>• <strong className="text-white">GitHub repo scan</strong> — secrets, dependencies, auth patterns, code risks</li>
            <li>• <strong className="text-white">CVE lookup</strong> — CVE-2021-23337 (lodash command injection)</li>
            <li>• <strong className="text-white">Package analysis</strong> — lodash vulnerability context</li>
            <li>• <strong className="text-white">AI explanations</strong> — for critical findings with fix recommendations</li>
            <li>• <strong className="text-white">Intelligence feed</strong> — Exa research, GitHub advisories, exploit analysis</li>
            <li>• <strong className="text-white">Remediation board</strong> — prioritized fixes with safer code examples</li>
            <li>• <strong className="text-white">Complete report</strong> — executive summary and exportable sections</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
