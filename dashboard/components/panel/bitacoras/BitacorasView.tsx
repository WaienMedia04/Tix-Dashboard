"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import { type BitacoraItem, type BitacorasResponse, fetchBitacoras } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { MetricCard } from "@/components/MetricCard";
import { FiltrosBitacoras, type FiltrosState } from "./FiltrosBitacoras";
import { TablaBitacoras } from "./TablaBitacoras";
import { WorklogDetalleModal, bitacoraItemADetalle } from "./WorklogDetalleModal";

function primerDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function ultimoDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);
}

function filtrosIniciales(): FiltrosState {
  return { fechaInicio: primerDiaMes(), fechaFin: ultimoDiaMes(), talentoId: "", estado: "", departamento: "" };
}

type EstadoCarga =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; data: BitacorasResponse };

function BitacorasResultado({
  slug,
  puedeEditar,
  filtros,
  page,
  onPageChange,
}: {
  slug: string;
  puedeEditar: boolean;
  filtros: FiltrosState;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const [estado, setEstado] = useState<EstadoCarga>({ tipo: "cargando" });
  const [seleccionada, setSeleccionada] = useState<BitacoraItem | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchBitacoras(slug, {
      fechaInicio: filtros.fechaInicio || undefined,
      fechaFin: filtros.fechaFin || undefined,
      talentoId: filtros.talentoId || undefined,
      estado: filtros.estado || undefined,
      departamento: filtros.departamento || undefined,
      page,
      limit: 20,
    })
      .then((data) => {
        if (!cancelado) setEstado({ tipo: "listo", data });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, filtros, page]);

  const resp = estado.tipo === "listo" ? estado.data : null;
  const cargando = estado.tipo === "cargando";
  const error = estado.tipo === "error" ? "No se pudo cargar las bitácoras." : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total de bitácoras"
          value={resp ? String(resp.resumen.totalBitacoras) : "—"}
          icon={ClipboardList}
          bordered={false}
        />
        <MetricCard
          label="% enviadas"
          value={resp ? `${resp.resumen.porcentajeEnviadas}%` : "—"}
          icon={CheckCircle2}
          bordered={false}
        />
        <MetricCard
          label="Puntaje IA promedio"
          value={resp?.resumen.puntajeProm == null ? "—" : `${resp.resumen.puntajeProm.toFixed(1)} / 10`}
          icon={Sparkles}
          bordered={false}
        />
      </div>

      <TablaBitacoras
        items={resp?.data ?? []}
        cargando={cargando}
        error={error}
        page={resp?.page ?? page}
        totalPages={resp?.totalPages ?? 1}
        onPageChange={onPageChange}
        onVer={setSeleccionada}
      />

      <WorklogDetalleModal
        detalle={seleccionada ? bitacoraItemADetalle(seleccionada) : null}
        onClose={() => setSeleccionada(null)}
        slug={slug}
        puedeEditar={puedeEditar}
        onActualizado={(d) => {
          const aplicado = (item: BitacoraItem): BitacoraItem => ({
            ...item,
            tareasPlanificadas: d.tareasPlanificadas,
            cumplimientoTareas: d.cumplimientoTareas,
            estadoEnvio: d.estadoEnvio,
            puntajeIA: d.puntajeIA,
            calificacionCeo: d.calificacionCeo,
            actividadesRealizadas: d.actividadesRealizadas,
            capacitacion: d.capacitacion ?? null,
            queSeEjecuto: d.queSeEjecuto,
            detallesRelevantes: d.detallesRelevantes,
            informeAvances: d.informeAvances,
            objetivoDia: d.objetivoDia,
            notasTix: d.notasTix,
          });
          setSeleccionada((prev) => (prev ? aplicado(prev) : prev));
          setEstado((prev) =>
            prev.tipo === "listo"
              ? { tipo: "listo", data: { ...prev.data, data: prev.data.data.map((i) => (i.id === d.id ? aplicado(i) : i)) } }
              : prev,
          );
        }}
      />
    </>
  );
}

export function BitacorasView() {
  const { slug, rol, dashboardInicial } = usePanel();
  const puedeEditar = rol === "CEO" || rol === "RRHH";
  const [filtros, setFiltros] = useState<FiltrosState>(filtrosIniciales);
  const [page, setPage] = useState(1);

  function handleFiltrosChange(nuevos: FiltrosState) {
    setFiltros(nuevos);
    setPage(1);
  }

  const talentos = dashboardInicial.rankingTalentos.map((t) => ({
    talentoId: t.talentoId,
    nombreCompleto: t.nombreCompleto,
  }));

  const clave = JSON.stringify({ ...filtros, page });

  return (
    <div className="space-y-4">
      <FiltrosBitacoras
        talentos={talentos}
        valores={filtros}
        onChange={handleFiltrosChange}
        onLimpiar={() => handleFiltrosChange(filtrosIniciales())}
      />

      <BitacorasResultado
        key={clave}
        slug={slug}
        puedeEditar={puedeEditar}
        filtros={filtros}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
