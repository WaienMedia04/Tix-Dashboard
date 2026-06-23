import type { LucideIcon } from "lucide-react";

export interface MetricDelta {
  valor: string;
  direccion: "subida" | "bajada";
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  delta?: MetricDelta;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="font-display mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {delta && (
        <span
          className={`mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            delta.direccion === "subida" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {delta.valor}
        </span>
      )}
    </div>
  );
}
