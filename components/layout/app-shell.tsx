"use client";
import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopNavbar } from "./top-navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))] isolate">
      <Sidebar />
      <div className="flex flex-1 flex-col relative z-0">
        <TopNavbar />
        <main className="flex-1 p-6 relative z-10 pointer-events-auto">
          <div className="mx-auto max-w-7xl animate-fade-in relative z-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
