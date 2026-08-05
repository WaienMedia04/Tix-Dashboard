import type { LogroMural } from "@/lib/api";

export function WidgetLogros({ logros }: { logros: LogroMural[] }) {
  const desbloqueados = logros.filter((l) => l.desbloqueado).length;

  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Logros — {desbloqueados}/{logros.length}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {logros.map((logro) => (
          <div
            key={logro.id}
            className={`flex items-center gap-3 rounded-lg border p-2.5 ${
              logro.desbloqueado ? "border-border bg-card" : "border-border/60 bg-muted/40 opacity-60"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
              {logro.desbloqueado ? logro.icono : "🔒"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{logro.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">{logro.descripcion}</p>
              {!logro.desbloqueado && logro.meta > 1 && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.round((logro.progreso / logro.meta) * 100))}%` }}
                  />
                </div>
              )}
            </div>
            {!logro.desbloqueado && logro.meta > 1 && (
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {logro.progreso}/{logro.meta}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
