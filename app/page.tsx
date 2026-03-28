import Link from "next/link";
import { Shield, Scan, Brain, FileText, ArrowRight, Zap, Globe, Code, Lock, Eye, Target } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210 100% 60% / 0.15), transparent)" }} />

        {/* CHANGED: Swapped "px-6" for "pl-2 pr-6" to pull the left side closer to the edge */}
<nav className="relative flex items-center justify-between pl-3 pr-6 py-4 max-w-7xl mx-auto">
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
      <Shield className="h-5 w-5 text-white" />
    </div>
    <span className="text-lg font-bold text-white tracking-tight">WebSec Copilot</span>
  </div>
  
</nav>

        <div className="relative px-6 pt-20 pb-28 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Zap className="h-3 w-3" /> AI-Powered Security Auditing
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Security Copilot for<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI-Built Web Apps</span>
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste a URL, GitHub repo, CVE, package, or code snippet. Get instant security analysis, threat intelligence, AI-powered remediation, and exportable reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/audit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
              <Scan className="h-5 w-5" /> Start Security Audit
            </Link>
            <Link href="/demo" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[hsl(var(--border))] text-white font-medium hover:bg-[hsl(var(--accent))] transition">
              <Eye className="h-5 w-5" /> View Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Comprehensive Security Analysis</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-center mb-14 max-w-xl mx-auto">Multi-source vulnerability detection with AI-powered insights and actionable remediation</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Globe, title: "Runtime Scanning", desc: "Security headers, TLS, cookies, CSP, exposed endpoints, JS secrets, and technology fingerprinting", color: "from-purple-500 to-indigo-500" },
            { icon: Code, title: "Code Analysis", desc: "Secrets detection, dependency vulnerabilities, auth patterns, input validation, and dangerous sinks", color: "from-green-500 to-emerald-500" },
            { icon: Brain, title: "AI Explanations", desc: "Every finding gets an AI explanation with impact, exploitability, fix recommendation, and safer code", color: "from-blue-500 to-cyan-500" },
            { icon: Target, title: "Threat Intelligence", desc: "CVE data, exploit writeups, advisories, and package risk context from Exa and Apify", color: "from-red-500 to-orange-500" },
            { icon: Lock, title: "Remediation Board", desc: "Prioritized fix recommendations with safer code examples and stack-aware guidance", color: "from-amber-500 to-yellow-500" },
            { icon: FileText, title: "Export Reports", desc: "Professional PDF, Markdown, and JSON reports with executive summaries and evidence", color: "from-teal-500 to-cyan-500" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--primary)/0.3)] transition-all">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${color} mb-4`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 border-t border-[hsl(var(--border))]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-14">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Submit Targets", desc: "Paste URLs, repos, CVEs, packages, or code snippets" },
              { step: "02", title: "AI Analysis", desc: "Multi-layer scanning with AI-powered vulnerability detection" },
              { step: "03", title: "Get Results", desc: "Dashboard with scores, findings, intelligence, and remediation" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">{step}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/20 p-12">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to secure your AI-built app?</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">Start a free security audit in seconds. No sign-up required.</p>
          <Link href="/audit" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all">
            <Scan className="h-5 w-5" /> Start Free Audit
          </Link>
        </div>
      </section>

      {/* Footer */}
<footer className="border-t border-[hsl(var(--border))] px-6 py-8">
  <div className="max-w-7xl mx-auto flex items-center justify-center">
    <div className="flex items-center gap-2">
      <Shield className="h-4 w-4 text-blue-400" />
      <span className="text-xs text-[hsl(var(--muted-foreground))]">
        WebSec Copilot • Built by CodeWithMehru
      </span>
    </div>
  </div>
</footer>
    </div>
  );
}
