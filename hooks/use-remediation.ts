"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useRemediation(scanId: Id<"scans"> | undefined) {
  const items = useQuery(api.remediations.getByScan, scanId ? { scanId } : "skip");
  const updateStatus = useMutation(api.remediations.updateStatus);
  return { items: items || [], isLoading: items === undefined, updateStatus };
}
