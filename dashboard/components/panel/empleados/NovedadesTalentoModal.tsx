"use client";

import { useEffect, useState } from "react";
import { type NovedadItem, type TipoNovedad, fetchNovedades } from "@/lib/api";
import { TIPOS_NOVEDAD as TIPOS, metaTipoNovedad as metaTipo } from "@/lib/novedades-tipos";
import { Modal } from "@/components/Modal";
import { SkeletonTableRows } from "@/components/motion/Skeleton";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

function TarjetaNovedad({ novedad }: { novedad: NovedadItem }) {
  const meta = metaTipo(novedad.tipo);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.fondo}`}>
        <meta.icon className={`h-4 w-4 ${meta.texto}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${meta.fondo} ${meta.texto}`}>{meta.label}</span>
          <span className="text-[11px] text-muted-foreground">{formatearFecha(novedad.fecha)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{novedad.descripcion}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">Registrado por {novedad.creadoPorNombre}</p>
      </div>
    </div>
  );
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; novedades: NovedadItem[] };

/** Historial de novedades de un empleado específico, con filtro por tipo y por rango de fechas. Se abre desde su perfil en el panel. */
export function NovedadesTalentoModal({
  slug,
  talentoId,
  nombreCompleto,
  open,
  onClose,
}: {
  slug: string;
  talentoId: string;
  nombreCompleto: string;
  open: boolean;
  onClose: () => void;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [filtroTipo, setFiltroTipo] = useState<TipoNovedad | "">("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstado({ tipo: "cargando" });
    fetchNovedades(slug, { talentoId })
      .then((novedades) => {
        if (!cancelado) setEstado({ tipo: "listo", novedades });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, talentoId, open]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFiltroTipo("");
      setDesde("");
      setHasta("");
    }
  }, [open]);

  const novedadesFiltradas =
    estado.tipo === "listo"
      ? estado.novedades.filter((n) => {
          if (filtroTipo && n.tipo !== filtroTipo) return false;
          const fecha = n.fecha.slice(0, 10);
          if (desde && fecha < desde) return false;
          if (hasta && fecha > hasta) return false;
          return true;
        })
      : [];

  const hayFiltrosActivos = filtroTipo !== "" || desde !== "" || hasta !== "";

  function limpiarFiltros() {
    setFiltroTipo("");
    setDesde("");
    setHasta("");
  }

  return (
    <Modal open={open} onClose={onClose} title={`Novedades de ${nombreCompleto}`} size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroTipo("")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                filtroTipo === "" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {TIPOS.map((t) => (
              <button
                key={t.valor}
                onClick={() => setFiltroTipo(t.valor)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                  filtroTipo === t.valor
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Desde
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={CAMPO_CLASES} />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Hasta
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={CAMPO_CLASES} />
            </label>
            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {estado.tipo === "cargando" && (
          <div className="rounded-lg border border-border bg-card">
            <table className="w-full">
              <tbody>
                <SkeletonTableRows rows={4} cols={1} />
              </tbody>
            </table>
          </div>
        )}
        {estado.tipo === "error" && <p className="text-sm text-destructive">No se pudieron cargar las novedades.</p>}
        {estado.tipo === "listo" && novedadesFiltradas.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
            {estado.novedades.length === 0
              ? "Todavía no hay novedades registradas para este empleado."
              : "Ningún resultado con estos filtros."}
          </div>
        )}
        {estado.tipo === "listo" && novedadesFiltradas.length > 0 && (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {novedadesFiltradas.map((novedad) => (
              <TarjetaNovedad key={novedad.id} novedad={novedad} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
