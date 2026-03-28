"use client";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useScan } from "@/components/providers/scan-provider";
import { Globe, Github, Server, AlertTriangle, Package, Code, Loader2, ArrowRight } from "lucide-react";

export default function AuditPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.create);
  const startAudit = useAction(api.auditOrchestrator.runFullAudit);
  const { setActiveScanId } = useScan();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputs, setInputs] = useState({
    websiteUrl: "",
    githubUrl: "",
    domain: "",
    cveId: "",
    packageName: "",
    codeSnippet: "",
  });
  const [stack, setStack] = useState(""); 

  const hasInput = Object.values(inputs).some(v => v.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasInput || isSubmitting) return;

    // Strict Website URL Validation
    if (inputs.websiteUrl) {
      try {
        const parsed = new URL(inputs.websiteUrl);
        const hostname = parsed.hostname.toLowerCase();
        const blockedKeywords = ["github.com", "gitlab.com", "bitbucket.org"];
        const pathSegments = parsed.pathname.split("/").filter(Boolean);

        const isInvalid = 
          (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
          hostname === "localhost" || 
          hostname === "127.0.0.1" ||
          !hostname.includes(".") ||
          pathSegments.length > 1;

        if (isInvalid) {
          alert("Invalid target: Please enter a valid website URL (not repository or code link).");
          return;
        }
      } catch (e) {
        alert("Invalid target: Please enter a valid website URL (not repository or code link).");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const sources: string[] = [];
      const cleanInputs: Record<string, string> = {};
      if (inputs.websiteUrl) { sources.push("website"); cleanInputs.websiteUrl = inputs.websiteUrl; }
      if (inputs.githubUrl) { sources.push("github"); cleanInputs.githubUrl = inputs.githubUrl; }
      if (inputs.domain) { sources.push("domain"); cleanInputs.domain = inputs.domain; }
      if (inputs.cveId) { sources.push("cve"); cleanInputs.cveId = inputs.cveId; }
      if (inputs.packageName) { sources.push("package"); cleanInputs.packageName = inputs.packageName; }
      if (inputs.codeSnippet) { sources.push("snippet"); cleanInputs.codeSnippet = inputs.codeSnippet; }

      const projectId = await createProject({
        name: inputs.websiteUrl || inputs.githubUrl || inputs.domain || inputs.packageName || "Audit",
        inputs: cleanInputs,
        stack: stack || undefined,
      });
      const scanId = await startAudit({ projectId, sources, inputs: cleanInputs });
      setActiveScanId(scanId);
      router.push(`/audit/${scanId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputFields = [
    { key: "websiteUrl", label: "Website URL", placeholder: "https://example.com", icon: Globe, type: "url" },
    { key: "githubUrl", label: "GitHub Repository", placeholder: "https://github.com/owner/repo", icon: Github, type: "url" },
    { key: "domain", label: "Domain", placeholder: "example.com", icon: Server, type: "text" },
    { key: "cveId", label: "CVE ID", placeholder: "CVE-2021-23337", icon: AlertTriangle, type: "text" },
    { key: "packageName", label: "Package Name", placeholder: "lodash, express, etc.", icon: Package, type: "text" },
  ];

  return (
    <AppShell>
      <PageHeader title="New Security Audit" description="Submit any combination of inputs for a unified security analysis" />
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {inputFields.map(({ key, label, placeholder, icon: Icon, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                <Icon className="h-3.5 w-3.5" />{label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={inputs[key as keyof typeof inputs]}
                onChange={e => setInputs(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 text-sm text-white placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] transition"
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
              Stack (optional)
            </label>
            <select
              value={stack}
              onChange={e => setStack(e.target.value)}
              className="w-full h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
            >
              <option value="">Auto-detect</option>
              <option value="Next.js">Next.js</option>
              <option value="React">React</option>
              <option value="Vue">Vue</option>
              <option value="Express">Express</option>
              <option value="Django">Django</option>
              <option value="Rails">Rails</option>
              <option value="Laravel">Laravel</option>
            </select>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="space-y-1.5 mb-6">
          <label className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]"><Code className="h-3.5 w-3.5" />Code Snippet</label>
          <textarea
            placeholder="Paste code to analyze..."
            value={inputs.codeSnippet}
            onChange={e => setInputs(prev => ({ ...prev, codeSnippet: e.target.value }))}
            rows={6}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 py-2.5 text-sm text-white font-mono placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] resize-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={!hasInput || isSubmitting}
          style={{ touchAction: 'manipulation' }}
          className="relative z-30 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20 transition-all"
        >
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Starting Scan...</> : <><ArrowRight className="h-4 w-4" />Start Security Audit</>}
        </button>
      </form>
    </AppShell>
  );
}
