"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Sparkles, ClipboardList, CheckCircle2, IdCard, Mail, Phone, Calendar, Building2 } from "lucide-react";
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
import { FotoTalento } from "./FotoTalento";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { Skeleton, SkeletonChart, SkeletonStatCards } from "@/components/motion/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; detalle: EmpleadoDetalle };

function tiempoEnEmpresa(fechaIngreso: string | null): string | null {
  if (!fechaIngreso) return null;
  const inicio = new Date(fechaIngreso);
  const hoy = new Date();
  let meses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth());
  if (hoy.getDate() < inicio.getDate()) meses -= 1;
  if (meses < 0) return null;
  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  if (anios === 0) return `${mesesRestantes} mes${mesesRestantes === 1 ? "" : "es"}`;
  if (mesesRestantes === 0) return `${anios} año${anios === 1 ? "" : "s"}`;
  return `${anios} año${anios === 1 ? "" : "s"}, ${mesesRestantes} mes${mesesRestantes === 1 ? "" : "es"}`;
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

function InfoRRHH({ talento }: { talento: EmpleadoDetalle["talento"] }) {
  const filas = [
    { icon: Building2, label: "Departamento", valor: talento.departamento },
    { icon: IdCard, label: "Cédula", valor: talento.cedula },
    { icon: Mail, label: "Correo", valor: talento.correo },
    { icon: Phone, label: "Teléfono", valor: talento.telefono },
    {
      icon: Calendar,
      label: "Fecha de ingreso",
      valor: talento.fechaIngreso ? formatearFecha(talento.fechaIngreso) : null,
    },
    { icon: Calendar, label: "Tiempo en la empresa", valor: tiempoEnEmpresa(talento.fechaIngreso) },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Información de RRHH</p>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filas.map((fila) => (
          <div key={fila.label} className="flex items-start gap-2.5">
            <fila.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-[11px] text-muted-foreground">{fila.label}</dt>
              <dd className="truncate text-sm font-medium text-foreground">{fila.valor ?? "—"}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EmpleadoDetalleResultado({
  slug,
  talentoId,
  page,
  onPageChange,
}: {
  slug: string;
  talentoId: string;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { rol } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [seleccionada, setSeleccionada] = useState<BitacoraItem | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const puedeEditar = rol === "CEO" || rol === "RRHH";

  useEffect(() => {
    let cancelado = false;
    fetchEmpleadoDetalle(slug, talentoId, page)
      .then((detalle) => {
        if (!cancelado) setEstado({ tipo: "listo", detalle });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, talentoId, page]);

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
    actualizarEstadoTalento(talentoId, activo ? "inactivo" : "activo")
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

  function handleFotoActualizada(fotoUrl: string) {
    setEstado({ tipo: "listo", detalle: { ...detalle, talento: { ...detalle.talento, fotoUrl } } });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <FotoTalento
              talentoId={detalle.talento.id}
              nombreCompleto={detalle.talento.nombreCompleto}
              fotoUrl={detalle.talento.fotoUrl}
              editable={puedeEditar}
              onActualizada={handleFotoActualizada}
            />
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

      <InfoRRHH talento={detalle.talento} />

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
  const { slug } = usePanel();
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
      <EmpleadoDetalleResultado key={page} slug={slug} talentoId={params.talentoId} page={page} onPageChange={setPage} />
    </div>
  );
}
