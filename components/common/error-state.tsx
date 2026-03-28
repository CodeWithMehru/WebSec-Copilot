import { AlertCircle } from "lucide-react";

export function ErrorState({ title = "Something went wrong", message = "Please try again", onRetry }: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 mb-4">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>
      <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
      <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-xs mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition">
          Try Again
        </button>
      )}
    </div>
  );
}
