import { formatDistanceToNow, format, isValid } from "date-fns";

export function timeAgo(date: number | Date): string {
  const d = typeof date === "number" ? new Date(date) : date;
  if (!isValid(d)) return "Unknown";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDate(date: number | Date, fmt = "MMM dd, yyyy"): string {
  const d = typeof date === "number" ? new Date(date) : date;
  if (!isValid(d)) return "Unknown";
  return format(d, fmt);
}

export function formatDateTime(date: number | Date): string {
  return formatDate(date, "MMM dd, yyyy HH:mm");
}

export function duration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
