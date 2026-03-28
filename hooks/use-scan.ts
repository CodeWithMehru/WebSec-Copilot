"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useScan(scanId: Id<"scans"> | undefined) {
  const scan = useQuery(api.scans.get, scanId ? { id: scanId } : "skip");
  return { scan, isLoading: scan === undefined };
}

export function useRecentScans() {
  const scans = useQuery(api.scans.listRecent);
  return { scans: scans || [], isLoading: scans === undefined };
}
