import type { TalentoRanking } from "@/lib/api";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 6) return "text-warning";
  return "text-destructive";
}

export function RankingTalentos({ talentos }: { talentos: TalentoRanking[] }) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">Ranking de talentos</h2>
        <p className="text-sm text-muted-foreground">Ordenado por puntaje IA promedio</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Talento</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Puntaje IA</th>
              <th className="px-4 py-2">Bitácoras enviadas</th>
            </tr>
          </thead>
          <tbody>
            {talentos.map((t, idx) => (
              <tr key={t.talentoId} className="border-t border-border transition-colors hover:bg-muted/50">
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-2.5 font-medium text-foreground">{t.nombreCompleto}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{t.rol}</td>
                <td className={`px-4 py-2.5 font-semibold tabular-nums ${colorPuntaje(t.puntajeIAPromedio)}`}>
                  {t.puntajeIAPromedio === null ? "—" : t.puntajeIAPromedio.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                  {t.bitacorasEnviadas} / {t.totalBitacoras}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
