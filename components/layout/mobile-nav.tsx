"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, X, Scan, AlertTriangle, Brain, Wrench, FileText, Sparkles, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/audit", label: "New Audit", icon: Scan },
  { href: "/findings", label: "Findings", icon: AlertTriangle },
  { href: "/intelligence", label: "Intelligence", icon: Brain },
  { href: "/remediation", label: "Remediation", icon: Wrench },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/demo", label: "Demo", icon: Sparkles },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] animate-slide-in">
        <div className="flex h-14 items-center justify-between px-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">WebSec Copilot</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[hsl(var(--accent))]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
