import type { TalentoRanking } from "@/lib/api";
import { StaggerGroup, StaggerItem } from "./motion/Stagger";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 6) return "text-warning";
  return "text-destructive";
}

export function RankingTalentos({ talentos }: { talentos: TalentoRanking[] }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold text-foreground">Ranking de talentos</h2>
        <p className="text-xs text-muted-foreground">Ordenado por puntaje IA promedio</p>
      </div>
      <StaggerGroup className="flex-1 divide-y divide-border overflow-y-auto">
        {talentos.map((t, idx) => (
          <StaggerItem key={t.talentoId}>
            <div className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">{idx + 1}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {iniciales(t.nombreCompleto)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{t.nombreCompleto}</p>
                <p className="truncate text-xs text-muted-foreground" title={t.rol}>
                  {t.rol}
                </p>
              </div>
              <span className={`shrink-0 text-sm font-semibold tabular-nums ${colorPuntaje(t.puntajeIAPromedio)}`}>
                {t.puntajeIAPromedio === null ? "—" : t.puntajeIAPromedio.toFixed(1)}
              </span>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
