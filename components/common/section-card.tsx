import { ReactNode } from "react";

export function SectionCard({ title, description, children, className = "", action }: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3.5">
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
