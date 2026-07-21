import type { BitacoraItem } from "@/lib/api";
import { EstadoBadge } from "@/components/EstadoBadge";
import { CheckinBadge } from "@/components/CheckinBadge";
import { EnlaceTalento } from "@/components/EnlaceTalento";
import { SkeletonTableRows } from "@/components/motion/Skeleton";
import { StaggerGroup, StaggerItem, StaggerRow, StaggerTableBody } from "@/components/motion/Stagger";

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
  const vacio = !cargando && !error && items.length === 0;

  return (
    <section className="rounded-lg border border-border bg-card shadow-card">
      {/* Escritorio/tablet ancha: tabla */}
      <div className="hidden overflow-x-auto lg:block">
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
            </tr>
          </thead>
          <tbody>
            {cargando && <SkeletonTableRows rows={6} cols={7} />}
            {!cargando && error && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            )}
            {vacio && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay bitácoras para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
          {!cargando && !error && items.length > 0 && (
            <StaggerTableBody>
              {items.map((item) => (
                <StaggerRow
                  key={item.id}
                  onClick={() => onVer(item)}
                  className="cursor-pointer border-t border-border transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{formatearFecha(item.fecha)}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    <EnlaceTalento talentoId={item.talento.id}>{item.talento.nombreCompleto}</EnlaceTalento>
                  </td>
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
                </StaggerRow>
              ))}
            </StaggerTableBody>
          )}
        </table>
      </div>

      {/* Celular/tablet vertical: tarjetas apiladas */}
      <div className="divide-y divide-border lg:hidden">
        {cargando && (
          <div className="space-y-3 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-24 rounded-lg" />
            ))}
          </div>
        )}
        {!cargando && error && <p className="px-4 py-8 text-center text-sm text-destructive">{error}</p>}
        {vacio && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay bitácoras para los filtros seleccionados.
          </p>
        )}
        {!cargando && !error && items.length > 0 && (
          <StaggerGroup>
            {items.map((item) => (
              <StaggerItem key={item.id}>
                {/* div en vez de button: el nombre adentro es un <Link> (EnlaceTalento), y <a> dentro de <button> es HTML inválido */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onVer(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onVer(item);
                    }
                  }}
                  className="flex w-full cursor-pointer flex-col gap-2 px-4 py-3 text-left transition-colors active:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        <EnlaceTalento talentoId={item.talento.id}>{item.talento.nombreCompleto}</EnlaceTalento>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{item.talento.rol}</p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatearFecha(item.fecha)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CheckinBadge checkinEnviado={item.checkinEnviado} horaCheckin={item.horaCheckin} />
                    <EstadoBadge estado={item.estadoEnvio} />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`font-semibold tabular-nums ${colorPuntaje(item.puntajeIA)}`}>
                      Puntaje IA: {item.puntajeIA === null ? "—" : item.puntajeIA}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      Tareas: {item.cumplimientoTareas === null ? "—" : `${item.cumplimientoTareas}%`}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
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
