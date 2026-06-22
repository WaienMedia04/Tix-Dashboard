import type { TalentoRanking } from "@/lib/api";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 6) return "text-warning";
  return "text-danger";
}

export function RankingTalentos({ talentos }: { talentos: TalentoRanking[] }) {
  return (
    <section className="rounded-md border border-surface-border bg-surface shadow-sm">
      <div className="border-b border-surface-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Ranking de talentos</h2>
        <p className="text-sm text-muted">Ordenado por puntaje IA promedio</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-muted">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Talento</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Puntaje IA</th>
              <th className="px-5 py-3 font-medium">Bitácoras enviadas</th>
            </tr>
          </thead>
          <tbody>
            {talentos.map((t, idx) => (
              <tr key={t.talentoId} className="border-t border-surface-border">
                <td className="px-5 py-3 text-muted">{idx + 1}</td>
                <td className="px-5 py-3 font-medium text-foreground">{t.nombreCompleto}</td>
                <td className="px-5 py-3 text-muted">{t.rol}</td>
                <td className={`px-5 py-3 font-semibold ${colorPuntaje(t.puntajeIAPromedio)}`}>
                  {t.puntajeIAPromedio === null ? "—" : t.puntajeIAPromedio.toFixed(1)}
                </td>
                <td className="px-5 py-3 text-muted">
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
