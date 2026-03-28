import { LoadingState } from "@/components/common/loading-state";
import { AppShell } from "@/components/layout/app-shell";

export default function ScanLoading() {
  return <AppShell><LoadingState message="Preparing scan dashboard..." /></AppShell>;
}
