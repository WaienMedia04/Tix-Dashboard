import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { KpiEmpleado, Tendencia } from "@/lib/api";
import { StaggerRow, StaggerTableBody } from "@/components/motion/Stagger";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 5) return "text-warning";
  return "text-destructive";
}

function IconoTendencia({ tendencia }: { tendencia: Tendencia }) {
  if (tendencia === null) return <span className="text-muted-foreground">—</span>;
  if (tendencia === "subio") return <TrendingUp className="h-4 w-4 text-success" />;
  if (tendencia === "bajo") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function TablaKpisEmpleado({ datos }: { datos: KpiEmpleado[] }) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2">Empleado</th>
              <th className="px-4 py-2">Puntaje promedio</th>
              <th className="px-4 py-2">% Cumplimiento</th>
              <th className="px-4 py-2">Cumpl. tareas</th>
              <th className="px-4 py-2">Bitácoras enviadas</th>
              <th className="px-4 py-2 text-right">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay empleados con datos en este período.
                </td>
              </tr>
            )}
          </tbody>
          {datos.length > 0 && (
            <StaggerTableBody>
              {datos.map((d) => (
                <StaggerRow key={d.talentoId} className="border-t border-border transition-colors hover:bg-muted/50">
                  <td className="px-4 py-2.5 font-medium text-foreground">{d.nombre}</td>
                  <td className={`px-4 py-2.5 font-semibold tabular-nums ${colorPuntaje(d.puntajeProm)}`}>
                    {d.puntajeProm === null ? "—" : d.puntajeProm.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                    {d.cumplimiento === null ? "—" : `${d.cumplimiento}%`}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                    {d.cumplimientoTareasProm === null ? "—" : `${d.cumplimientoTareasProm}%`}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{d.enviadas}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end">
                      <IconoTendencia tendencia={d.tendencia} />
                    </div>
                  </td>
                </StaggerRow>
              ))}
            </StaggerTableBody>
          )}
        </table>
      </div>
    </section>
  );
}
