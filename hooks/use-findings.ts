"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useFindings(scanId: Id<"scans"> | undefined) {
  const findings = useQuery(api.findings.getByScan, scanId ? { scanId } : "skip");
  return { findings: findings || [], isLoading: findings === undefined };
}

export function useFinding(findingId: Id<"findings"> | undefined) {
  const finding = useQuery(api.findings.get, findingId ? { id: findingId } : "skip");
  return { finding, isLoading: finding === undefined };
}
