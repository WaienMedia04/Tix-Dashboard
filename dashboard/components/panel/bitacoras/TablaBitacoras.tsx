import type { BitacoraItem } from "@/lib/api";
import { EstadoBadge } from "@/components/EstadoBadge";
import { CheckinBadge } from "@/components/CheckinBadge";
import { SkeletonTableRows } from "@/components/motion/Skeleton";
import { StaggerRow, StaggerTableBody } from "@/components/motion/Stagger";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 5) return "text-warning";
  return "text-destructive";
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function TablaBitacoras({
  items,
  cargando,
  error,
  page,
  totalPages,
  onPageChange,
  onVer,
}: {
  items: BitacoraItem[];
  cargando: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onVer: (item: BitacoraItem) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Empleado</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Check-in</th>
              <th className="px-4 py-2">Check-out</th>
              <th className="px-4 py-2">Puntaje IA</th>
              <th className="px-4 py-2">Cumpl. tareas</th>
              <th className="px-4 py-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {cargando && <SkeletonTableRows rows={6} cols={8} />}
            {!cargando && error && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            )}
            {!cargando && !error && items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay bitácoras para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
          {!cargando && !error && items.length > 0 && (
            <StaggerTableBody>
              {items.map((item) => (
                <StaggerRow key={item.id} className="border-t border-border transition-colors hover:bg-muted/50">
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{formatearFecha(item.fecha)}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{item.talento.nombreCompleto}</td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-muted-foreground" title={item.talento.rol}>
                    {item.talento.rol}
                  </td>
                  <td className="px-4 py-2.5">
                    <CheckinBadge checkinEnviado={item.checkinEnviado} horaCheckin={item.horaCheckin} />
                  </td>
                  <td className="px-4 py-2.5">
                    <EstadoBadge estado={item.estadoEnvio} />
                  </td>
                  <td className={`px-4 py-2.5 font-semibold tabular-nums ${colorPuntaje(item.puntajeIA)}`}>
                    {item.puntajeIA === null ? "—" : item.puntajeIA}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                    {item.cumplimientoTareas === null ? "—" : `${item.cumplimientoTareas}%`}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onVer(item)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Ver
                    </button>
                  </td>
                </StaggerRow>
              ))}
            </StaggerTableBody>
          )}
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Página {page} de {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}
