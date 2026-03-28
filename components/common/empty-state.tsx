import { SearchX } from "lucide-react";

export function EmptyState({ title = "No data yet", description = "Data will appear here once available", icon: Icon = SearchX }: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--muted)/0.5)] mb-4">
        <Icon className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
      </div>
      <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
      <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-xs">{description}</p>
    </div>
  );
}
