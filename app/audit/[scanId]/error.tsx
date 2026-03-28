"use client";
import { ErrorState } from "@/components/common/error-state";
import { AppShell } from "@/components/layout/app-shell";

export default function ScanError({ reset }: { reset: () => void }) {
  return <AppShell><ErrorState title="Failed to load scan" message="The scan data could not be loaded" onRetry={reset} /></AppShell>;
}
