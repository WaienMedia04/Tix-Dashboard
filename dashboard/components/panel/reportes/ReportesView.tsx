"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { type PeriodoReporte, type ReporteResponse, fetchReporte } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { FiltroPeriodoReporte, type FiltroReporteState } from "./FiltroPeriodoReporte";
import { ResumenEjecutivoReporte } from "./ResumenEjecutivoReporte";
import { TablaReporte } from "./TablaReporte";
import { SkeletonStatCards, SkeletonTableRows } from "@/components/motion/Skeleton";
import { descargarCsv } from "@/lib/csv";

const ETIQUETA_PERIODO: Record<PeriodoReporte, string> = {
  mensual: "mensual",
  semanal: "semanal",
  anual: "anual",
  personalizado: "personalizado",
};

function mesActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

function semanaActualIso(): string {
  const hoy = new Date();
  const copia = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
  const diaIso = copia.getUTCDay() || 7;
  copia.setUTCDate(copia.getUTCDate() + 4 - diaIso);
  const inicioAnio = new Date(Date.UTC(copia.getUTCFullYear(), 0, 1));
  const numSemana = Math.ceil(((copia.getTime() - inicioAnio.getTime()) / 86400000 + 1) / 7);
  return `${copia.getUTCFullYear()}-W${String(numSemana).padStart(2, "0")}`;
}

function anioActual(): string {
  return String(new Date().getFullYear());
}

function primerDiaMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function filtroInicial(): FiltroReporteState {
  return { periodo: "mensual", valor: mesActual(), fechaInicio: primerDiaMes(), fechaFin: hoyIso() };
}

function formatearRango(inicio: string, fin: string): string {
  const opciones: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" };
  const desde = new Date(inicio).toLocaleDateString("es-DO", opciones);
  const hasta = new Date(fin).toLocaleDateString("es-DO", opciones);
  return desde === hasta ? desde : `${desde} — ${hasta}`;
}

function generarCsv(reporte: ReporteResponse): string {
  const filas = [
    [
      "Empleado",
      "Rol",
      "Puntaje promedio",
      "% Cumplimiento",
      "Cumplimiento de tareas",
      "Enviadas",
      "Total bitácoras",
    ],
    ...reporte.detalle.map((d) => [
      d.nombre,
      d.rol,
      d.puntajeProm === null ? "—" : String(d.puntajeProm),
      d.cumplimiento === null ? "—" : String(d.cumplimiento),
      d.cumplimientoTareasProm === null ? "—" : String(d.cumplimientoTareasProm),
      String(d.enviadas),
      String(d.totalBitacoras),
    ]),
  ];
  return filas.map((fila) => fila.map((celda) => `"${celda.replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; datos: ReporteResponse };

function ReporteResultado({ slug, filtro }: { slug: string; filtro: FiltroReporteState }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;
    fetchReporte(slug, filtro.periodo, {
      valor: filtro.periodo === "personalizado" ? undefined : filtro.valor,
      fechaInicio: filtro.periodo === "personalizado" ? filtro.fechaInicio : undefined,
      fechaFin: filtro.periodo === "personalizado" ? filtro.fechaFin : undefined,
    })
      .then((datos) => {
        if (!cancelado) setEstado({ tipo: "listo", datos });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, filtro.periodo, filtro.valor, filtro.fechaInicio, filtro.fechaFin]);

  if (estado.tipo === "cargando") {
    return (
      <div className="space-y-4">
        <SkeletonStatCards count={3} />
        <section className="rounded-lg border border-border bg-card shadow-card">
          <table className="w-full text-left text-sm">
            <tbody>
              <SkeletonTableRows rows={5} cols={6} />
            </tbody>
          </table>
        </section>
      </div>
    );
  }
  if (estado.tipo === "error") {
    return <p className="text-sm text-destructive">No se pudo cargar el reporte para este período.</p>;
  }

  const { datos } = estado;

  return (
    <div className="space-y-4">
      <div className="hidden print:block">
        <h1 className="font-display text-xl font-semibold text-foreground">TalentiX RD — {datos.empresa.nombre}</h1>
        <p className="text-sm text-muted-foreground">
          Reporte {ETIQUETA_PERIODO[datos.periodo]} · {formatearRango(datos.rangoInicio, datos.rangoFin)}
        </p>
        <div className="my-3 border-t border-border" />
      </div>

      <div className="print:hidden flex justify-end gap-2">
        <button
          onClick={() =>
            descargarCsv(`reporte-${datos.empresa.slug}-${datos.periodo}-${datos.valor}.csv`, generarCsv(datos))
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Download className="h-4 w-4" />
          Exportar Excel
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <FileText className="h-4 w-4" />
          Exportar PDF
        </button>
      </div>

      <ResumenEjecutivoReporte resumen={datos.resumen} />
      <TablaReporte datos={datos.detalle} />
    </div>
  );
}

export function ReportesView() {
  const { slug } = usePanel();
  const [filtro, setFiltro] = useState<FiltroReporteState>(filtroInicial);

  function cambiarPeriodo(periodo: PeriodoReporte) {
    setFiltro((prev) => ({
      ...prev,
      periodo,
      valor: periodo === "mensual" ? mesActual() : periodo === "semanal" ? semanaActualIso() : anioActual(),
    }));
  }

  return (
    <div className="space-y-4">
      <FiltroPeriodoReporte
        filtro={filtro}
        onCambiarPeriodo={cambiarPeriodo}
        onCambiarValor={(valor) => setFiltro((prev) => ({ ...prev, valor }))}
        onCambiarFechaInicio={(fechaInicio) => setFiltro((prev) => ({ ...prev, fechaInicio }))}
        onCambiarFechaFin={(fechaFin) => setFiltro((prev) => ({ ...prev, fechaFin }))}
      />

      <ReporteResultado
        key={`${filtro.periodo}-${filtro.valor}-${filtro.fechaInicio}-${filtro.fechaFin}`}
        slug={slug}
        filtro={filtro}
      />
    </div>
  );
}
