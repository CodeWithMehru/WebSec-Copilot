"use client";
import { Shield, Menu } from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./mobile-nav";

export function TopNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="relative z-10 flex h-[var(--topbar-height)] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:bg-[hsl(var(--card)/0.5)] lg:backdrop-blur-xl px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="relative z-20 lg:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--accent))] transition"
            style={{ touchAction: 'manipulation' }}
          >
            <Menu className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
            <Shield className="h-4 w-4 text-white" />
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
