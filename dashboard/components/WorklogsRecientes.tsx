import type { WorklogReciente } from "@/lib/api";
import { EstadoBadge } from "./EstadoBadge";

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function resumenDe(w: WorklogReciente): string {
  return w.informeAvances || w.actividadesRealizadas || w.notasTix || "Sin información registrada.";
}

export function WorklogsRecientes({ worklogs }: { worklogs: WorklogReciente[] }) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">Bitácoras recientes</h2>
        <p className="text-sm text-muted-foreground">Últimos {worklogs.length} reportes registrados</p>
      </div>
      <ul className="divide-y divide-border">
        {worklogs.map((w) => (
          <li key={w.id} className="px-4 py-3 transition-colors hover:bg-muted/50">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{w.talento}</span>
                <span className="text-xs text-muted-foreground">{formatearFecha(w.fecha)}</span>
                {w.horaEnvio && <span className="text-xs tabular-nums text-muted-foreground">{w.horaEnvio}</span>}
              </div>
              <div className="flex items-center gap-3">
                {w.puntajeIA !== null && (
                  <span className="text-xs font-semibold tabular-nums text-primary">IA: {w.puntajeIA}/10</span>
                )}
                <EstadoBadge estado={w.estadoEnvio} />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{resumenDe(w)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
