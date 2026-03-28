"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useDashboard(scanId: Id<"scans"> | undefined) {
  const data = useQuery(api.dashboard.getScanDashboard, scanId ? { scanId } : "skip");
  return { data, isLoading: data === undefined };
}
