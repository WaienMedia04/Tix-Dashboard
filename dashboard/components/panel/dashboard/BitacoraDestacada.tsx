import { NotebookPen } from "lucide-react";
import type { WorklogReciente } from "@/lib/api";
import { EstadoBadge } from "@/components/EstadoBadge";

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function resumenDe(w: WorklogReciente): string {
  return w.informeAvances || w.actividadesRealizadas || w.notasTix || "Sin información registrada.";
}

export function BitacoraDestacada({ worklog }: { worklog: WorklogReciente | undefined }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Bitácora más reciente</p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <NotebookPen className="h-3.5 w-3.5" />
        </span>
      </div>
      {!worklog ? (
        <p className="mt-3 flex-1 text-sm text-muted-foreground">Sin bitácoras registradas todavía.</p>
      ) : (
        <div className="mt-2 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display truncate text-sm font-semibold text-foreground">{worklog.talento}</p>
            <EstadoBadge estado={worklog.estadoEnvio} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">{formatearFecha(worklog.fecha)}</p>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{resumenDe(worklog)}</p>
        </div>
      )}
    </div>
  );
}
