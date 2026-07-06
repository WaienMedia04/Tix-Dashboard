"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles, ClipboardList, CheckCircle2 } from "lucide-react";
import {
  type BitacoraItem,
  type EmpleadoDetalle,
  actualizarEstadoTalento,
  fetchEmpleadoDetalle,
} from "@/lib/api";
import { usePanel } from "../PanelContext";
import { MetricCard } from "@/components/MetricCard";
import { TablaBitacoras } from "../bitacoras/TablaBitacoras";
import { BitacoraDrawer } from "../bitacoras/BitacoraDrawer";
import { PuntajeIAChart } from "./PuntajeIAChart";
import { CumplimientoTareasChart } from "./CumplimientoTareasChart";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { Skeleton, SkeletonChart, SkeletonStatCards } from "@/components/motion/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; detalle: EmpleadoDetalle };

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function EmpleadoDetalleResultado({
  slug,
  codigoAcceso,
  talentoId,
  page,
  onPageChange,
}: {
  slug: string;
  codigoAcceso: string;
  talentoId: string;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [seleccionada, setSeleccionada] = useState<BitacoraItem | null>(null);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    fetchEmpleadoDetalle(slug, codigoAcceso, talentoId, page)
      .then((detalle) => {
        if (!cancelado) setEstado({ tipo: "listo", detalle });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, codigoAcceso, talentoId, page]);

  if (estado.tipo === "cargando") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <SkeletonStatCards count={3} />
        <SkeletonChart />
      </div>
    );
  }
  if (estado.tipo === "error") {
    return <p className="text-sm text-destructive">No se pudo cargar este empleado.</p>;
  }

  const { detalle } = estado;
  const activo = detalle.talento.estado === "activo";

  function alternarEstado() {
    setActualizando(true);
    actualizarEstadoTalento(talentoId, codigoAcceso, activo ? "inactivo" : "activo")
      .then((actualizado) => {
        setEstado({
          tipo: "listo",
          detalle: { ...detalle, talento: { ...detalle.talento, estado: actualizado.estado } },
        });
      })
      .catch(() => {
        // sin cambios visibles si falla; el boton vuelve a estar habilitado
      })
      .finally(() => setActualizando(false));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {iniciales(detalle.talento.nombreCompleto)}
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {detalle.talento.nombreCompleto}
              </h2>
              <p className="text-sm text-muted-foreground">{detalle.talento.rol}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                activo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              {activo ? "Activo" : "Inactivo"}
            </span>
            <button
              onClick={alternarEstado}
              disabled={actualizando}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activo ? "Marcar inactivo" : "Marcar activo"}
            </button>
          </div>
        </div>
      </div>

      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <MetricCard
            label="Puntaje IA promedio"
            value={detalle.metricas.puntajeIAPromedio === null ? "—" : `${detalle.metricas.puntajeIAPromedio.toFixed(1)} / 10`}
            icon={Sparkles}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard label="Total de bitácoras" value={String(detalle.metricas.totalBitacoras)} icon={ClipboardList} />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            label="% cumplimiento"
            value={detalle.metricas.porcentajeCumplimiento === null ? "—" : `${detalle.metricas.porcentajeCumplimiento}%`}
            icon={CheckCircle2}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            label="Cumplimiento de tareas"
            value={
              detalle.metricas.cumplimientoTareasPromedio === null
                ? "—"
                : `${detalle.metricas.cumplimientoTareasPromedio}%`
            }
            icon={CheckCircle2}
          />
        </StaggerItem>
      </StaggerGroup>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Evolución de puntaje IA
          </p>
          <PuntajeIAChart serie={detalle.serieIA} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Evolución de cumplimiento de tareas (check-in vs check-out)
          </p>
          <CumplimientoTareasChart serie={detalle.serieCumplimiento} />
        </div>
      </div>

      <TablaBitacoras
        items={detalle.historial.data}
        cargando={false}
        error={null}
        page={detalle.historial.page}
        totalPages={detalle.historial.totalPages}
        onPageChange={onPageChange}
        onVer={setSeleccionada}
      />

      <BitacoraDrawer bitacora={seleccionada} onClose={() => setSeleccionada(null)} />
    </div>
  );
}

export function EmpleadoDetalleView() {
  const { slug, codigoAcceso } = usePanel();
  const params = useParams<{ talentoId: string }>();
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-4">
      <Link
        href={`/${slug}/empleados`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Empleados
      </Link>
      <EmpleadoDetalleResultado
        key={page}
        slug={slug}
        codigoAcceso={codigoAcceso}
        talentoId={params.talentoId}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
