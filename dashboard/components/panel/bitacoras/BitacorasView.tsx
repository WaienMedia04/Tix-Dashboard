"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import { type BitacoraItem, type BitacorasResponse, fetchBitacoras } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { MetricCard } from "@/components/MetricCard";
import { FiltrosBitacoras, type FiltrosState } from "./FiltrosBitacoras";
import { TablaBitacoras } from "./TablaBitacoras";
import { BitacoraDrawer } from "./BitacoraDrawer";

function primerDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function ultimoDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);
}

function filtrosIniciales(): FiltrosState {
  return { fechaInicio: primerDiaMes(), fechaFin: ultimoDiaMes(), talentoId: "", estado: "" };
}

type EstadoCarga =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; data: BitacorasResponse };

function BitacorasResultado({
  slug,
  codigoAcceso,
  filtros,
  page,
  onPageChange,
}: {
  slug: string;
  codigoAcceso: string;
  filtros: FiltrosState;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const [estado, setEstado] = useState<EstadoCarga>({ tipo: "cargando" });
  const [seleccionada, setSeleccionada] = useState<BitacoraItem | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetchBitacoras(slug, codigoAcceso, {
      fechaInicio: filtros.fechaInicio || undefined,
      fechaFin: filtros.fechaFin || undefined,
      talentoId: filtros.talentoId || undefined,
      estado: filtros.estado || undefined,
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
  }, [slug, codigoAcceso, filtros, page]);

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
        />
        <MetricCard label="% enviadas" value={resp ? `${resp.resumen.porcentajeEnviadas}%` : "—"} icon={CheckCircle2} />
        <MetricCard
          label="Puntaje IA promedio"
          value={resp?.resumen.puntajeProm == null ? "—" : `${resp.resumen.puntajeProm.toFixed(1)} / 10`}
          icon={Sparkles}
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

      <BitacoraDrawer bitacora={seleccionada} onClose={() => setSeleccionada(null)} />
    </>
  );
}

export function BitacorasView() {
  const { slug, codigoAcceso, dashboardInicial } = usePanel();
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
        codigoAcceso={codigoAcceso}
        filtros={filtros}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
