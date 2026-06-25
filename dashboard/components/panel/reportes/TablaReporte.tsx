import type { ReporteDetalleItem } from "@/lib/api";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 5) return "text-warning";
  return "text-destructive";
}

export function TablaReporte({ datos }: { datos: ReporteDetalleItem[] }) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2">Empleado</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Puntaje promedio</th>
              <th className="px-4 py-2">% Cumplimiento</th>
              <th className="px-4 py-2">Enviadas</th>
              <th className="px-4 py-2">Total bitácoras</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay empleados registrados.
                </td>
              </tr>
            )}
            {datos.map((d) => (
              <tr key={d.talentoId} className="border-t border-border transition-colors hover:bg-muted/50 print:hover:bg-transparent">
                <td className="px-4 py-2.5 font-medium text-foreground">{d.nombre}</td>
                <td className="max-w-[220px] truncate px-4 py-2.5 text-muted-foreground" title={d.rol}>
                  {d.rol}
                </td>
                <td className={`px-4 py-2.5 font-semibold tabular-nums ${colorPuntaje(d.puntajeProm)}`}>
                  {d.puntajeProm === null ? "—" : d.puntajeProm.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                  {d.cumplimiento === null ? "—" : `${d.cumplimiento}%`}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{d.enviadas}</td>
                <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{d.totalBitacoras}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
