"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Id } from "@/convex/_generated/dataModel";

type ScanContextType = {
  activeScanId: Id<"scans"> | null;
  setActiveScanId: (id: Id<"scans"> | null) => void;
};

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [activeScanId, setActiveScanId] = useState<Id<"scans"> | null>(null);

  // Reset on app load (initial mount)
  useEffect(() => {
    // Clear any persisted scan IDs
    localStorage.removeItem("activeScanId");
    sessionStorage.removeItem("activeScanId");
    setActiveScanId(null);
    console.log("[ScanProvider] State reset on app load");
  }, []);

  return (
    <ScanContext.Provider value={{ activeScanId, setActiveScanId }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error("useScan must be used within a ScanProvider");
  }
  return context;
}
