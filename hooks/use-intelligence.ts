"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useIntelligence(scanId: Id<"scans"> | undefined) {
  const items = useQuery(api.intelligence.getByScan, scanId ? { scanId } : "skip");
  return { items: items || [], isLoading: items === undefined };
}

export function useIntelligenceItem(itemId: Id<"intelligence"> | undefined) {
  const item = useQuery(api.intelligence.get, itemId ? { id: itemId } : "skip");
  return { item, isLoading: item === undefined };
}
