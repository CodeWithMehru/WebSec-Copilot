"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Scan, AlertTriangle, Brain, Wrench, FileText, Sparkles, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/audit", label: "New Audit", icon: Scan },
  { href: "/findings", label: "Findings", icon: AlertTriangle },
  { href: "/intelligence", label: "Intelligence", icon: Brain },
  { href: "/remediation", label: "Remediation", icon: Wrench },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/demo", label: "Demo", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[var(--sidebar-width)] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Logo */}
      <div className="flex h-[var(--topbar-height)] items-center gap-2.5 border-b border-[hsl(var(--border))] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
          <Shield className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">WebSec Copilot</h1>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Security AI</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <Link
          href="/"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
            pathname === "/" ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                isActive
                  ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
