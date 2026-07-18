import type { ReporteDetalleItem } from "@/lib/api";
import { StaggerGroup, StaggerItem, StaggerRow, StaggerTableBody } from "@/components/motion/Stagger";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 5) return "text-warning";
  return "text-destructive";
}

export function TablaReporte({ datos }: { datos: ReporteDetalleItem[] }) {
  const vacio = datos.length === 0;

  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      {/* Escritorio/tablet ancha (y siempre al imprimir): tabla */}
      <div className="hidden overflow-x-auto lg:block print:!block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2">Empleado</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Puntaje promedio</th>
              <th className="px-4 py-2">% Cumplimiento</th>
              <th className="px-4 py-2">Cumpl. tareas</th>
              <th className="px-4 py-2">Enviadas</th>
              <th className="px-4 py-2">Total bitácoras</th>
            </tr>
          </thead>
          <tbody>
            {vacio && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay empleados registrados.
                </td>
              </tr>
            )}
          </tbody>
          {!vacio && (
            <StaggerTableBody>
              {datos.map((d) => (
                <StaggerRow
                  key={d.talentoId}
                  className="border-t border-border transition-colors hover:bg-muted/50 print:hover:bg-transparent"
                >
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
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                    {d.cumplimientoTareasProm === null ? "—" : `${d.cumplimientoTareasProm}%`}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{d.enviadas}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{d.totalBitacoras}</td>
                </StaggerRow>
              ))}
            </StaggerTableBody>
          )}
        </table>
      </div>

      {/* Celular/tablet vertical: tarjetas apiladas (ocultas al imprimir) */}
      <div className="divide-y divide-border lg:hidden print:hidden">
        {vacio && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No hay empleados registrados.</p>
        )}
        {!vacio && (
          <StaggerGroup>
            {datos.map((d) => (
              <StaggerItem key={d.talentoId}>
                <div className="flex flex-col gap-2 px-4 py-3">
                  <div>
                    <p className="truncate text-sm font-medium text-foreground">{d.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.rol}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <span className="text-muted-foreground">
                      Puntaje:{" "}
                      <span className={`font-semibold tabular-nums ${colorPuntaje(d.puntajeProm)}`}>
                        {d.puntajeProm === null ? "—" : d.puntajeProm.toFixed(1)}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Cumplimiento:{" "}
                      <span className="tabular-nums text-foreground">
                        {d.cumplimiento === null ? "—" : `${d.cumplimiento}%`}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Tareas:{" "}
                      <span className="tabular-nums text-foreground">
                        {d.cumplimientoTareasProm === null ? "—" : `${d.cumplimientoTareasProm}%`}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Enviadas: <span className="tabular-nums text-foreground">{d.enviadas}</span> /{" "}
                      {d.totalBitacoras}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
}
