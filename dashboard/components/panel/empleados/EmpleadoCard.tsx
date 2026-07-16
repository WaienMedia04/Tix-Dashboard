"use client";

import { useState } from "react";
import Link from "next/link";
import type { EmpleadoResumen } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Modal";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 5) return "text-warning";
  return "text-destructive";
}

type Metrica = "puntaje" | "bitacoras" | "cumplimiento";

const TITULOS: Record<Metrica, string> = {
  puntaje: "Puntaje IA promedio",
  bitacoras: "Bitácoras",
  cumplimiento: "Cumplimiento",
};

export function EmpleadoCard({ slug, empleado }: { slug: string; empleado: EmpleadoResumen }) {
  const activo = empleado.estado === "activo";
  const [metricaAbierta, setMetricaAbierta] = useState<Metrica | null>(null);

  function abrirMetrica(e: React.MouseEvent, metrica: Metrica) {
    e.preventDefault();
    e.stopPropagation();
    setMetricaAbierta(metrica);
  }

  return (
    <>
      <Link
        href={`/${slug}/empleados/${empleado.id}`}
        className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40"
      >
        <div className="flex items-start gap-3">
          <Avatar nombreCompleto={empleado.nombreCompleto} fotoUrl={empleado.fotoUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-sm font-semibold text-foreground">
              {empleado.nombreCompleto}
            </p>
            <p className="truncate text-xs text-muted-foreground" title={empleado.rol}>
              {empleado.rol}
            </p>
            {empleado.departamento && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{empleado.departamento}</p>
            )}
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${
              activo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            {activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={(e) => abrirMetrica(e, "puntaje")}
            className="rounded-md p-1 text-left transition-colors hover:bg-muted"
          >
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Puntaje IA</p>
            <p
              className={`font-display mt-1 text-base font-semibold tabular-nums ${colorPuntaje(empleado.puntajeIAPromedio)}`}
            >
              {empleado.puntajeIAPromedio === null ? "—" : empleado.puntajeIAPromedio.toFixed(1)}
            </p>
          </button>
          <button
            type="button"
            onClick={(e) => abrirMetrica(e, "bitacoras")}
            className="rounded-md p-1 text-left transition-colors hover:bg-muted"
          >
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Bitácoras</p>
            <p className="font-display mt-1 text-base font-semibold tabular-nums text-foreground">
              {empleado.totalBitacoras}
            </p>
          </button>
          <button
            type="button"
            onClick={(e) => abrirMetrica(e, "cumplimiento")}
            className="rounded-md p-1 text-left transition-colors hover:bg-muted"
          >
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Cumplimiento</p>
            <p className="font-display mt-1 text-base font-semibold tabular-nums text-foreground">
              {empleado.porcentajeCumplimiento === null ? "—" : `${empleado.porcentajeCumplimiento}%`}
            </p>
          </button>
        </div>
      </Link>

      <Modal
        open={metricaAbierta !== null}
        onClose={() => setMetricaAbierta(null)}
        title={metricaAbierta ? TITULOS[metricaAbierta] : ""}
        description={empleado.nombreCompleto}
      >
        {metricaAbierta === "puntaje" && (
          <p className="text-sm text-foreground">
            {empleado.puntajeIAPromedio === null ? (
              "Sin bitácoras con puntaje IA todavía."
            ) : (
              <>
                Puntaje IA promedio de{" "}
                <span className={`font-semibold ${colorPuntaje(empleado.puntajeIAPromedio)}`}>
                  {empleado.puntajeIAPromedio.toFixed(1)} / 10
                </span>{" "}
                en {empleado.rol}
                {empleado.departamento ? ` — ${empleado.departamento}` : ""}.
              </>
            )}
          </p>
        )}
        {metricaAbierta === "bitacoras" && (
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              {empleado.totalBitacoras} bitácora{empleado.totalBitacoras === 1 ? "" : "s"} registrada
              {empleado.totalBitacoras === 1 ? "" : "s"} en total.
            </p>
            <Link
              href={`/${slug}/empleados/${empleado.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Ver historial completo
            </Link>
          </div>
        )}
        {metricaAbierta === "cumplimiento" && (
          <p className="text-sm text-foreground">
            {empleado.porcentajeCumplimiento === null ? (
              "Sin bitácoras registradas todavía."
            ) : (
              <>
                <span className="font-semibold">{empleado.porcentajeCumplimiento}%</span> de cumplimiento de
                envío
                {empleado.cumplimientoTareasPromedio !== null && (
                  <> · {empleado.cumplimientoTareasPromedio}% de cumplimiento de tareas en promedio</>
                )}
                .
              </>
            )}
          </p>
        )}
      </Modal>
    </>
  );
}
