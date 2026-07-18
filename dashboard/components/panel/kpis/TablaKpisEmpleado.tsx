import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { KpiEmpleado, Tendencia } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { EstadoBadge } from "@/components/EstadoBadge";
import { StaggerGroup, StaggerItem, StaggerRow, StaggerTableBody } from "@/components/motion/Stagger";

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
  const vacio = datos.length === 0;

  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      {/* Escritorio/tablet ancha: tabla */}
      <div className="hidden overflow-x-auto lg:block">
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
            {vacio && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay empleados con datos en este período.
                </td>
              </tr>
            )}
          </tbody>
          {!vacio && (
            <StaggerTableBody>
              {datos.map((d) => (
                <StaggerRow key={d.talentoId} className="border-t border-border transition-colors hover:bg-muted/50">
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    <div className="flex items-center gap-2.5">
                      <Avatar nombreCompleto={d.nombre} fotoUrl={d.fotoUrl} size="sm" />
                      {d.nombre}
                      {d.estadoActual && <EstadoBadge estado={d.estadoActual} />}
                    </div>
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

      {/* Celular/tablet vertical: tarjetas apiladas */}
      <div className="divide-y divide-border lg:hidden">
        {vacio && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay empleados con datos en este período.
          </p>
        )}
        {!vacio && (
          <StaggerGroup>
            {datos.map((d) => (
              <StaggerItem key={d.talentoId}>
                <div className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar nombreCompleto={d.nombre} fotoUrl={d.fotoUrl} size="sm" />
                      <span className="truncate text-sm font-medium text-foreground">{d.nombre}</span>
                      {d.estadoActual && <EstadoBadge estado={d.estadoActual} />}
                    </div>
                    <IconoTendencia tendencia={d.tendencia} />
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
                      Bitácoras: <span className="tabular-nums text-foreground">{d.enviadas}</span>
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
