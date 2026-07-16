"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, CircleCheck, Lightbulb, TriangleAlert } from "lucide-react";
import { type PeriodoReporte, type ReporteEjecutivoResponse, fetchReporteEjecutivo } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { FiltroPeriodoReporte, type FiltroReporteState } from "../reportes/FiltroPeriodoReporte";
import { ResumenEjecutivoReporte } from "../reportes/ResumenEjecutivoReporte";
import { TablaReporte } from "../reportes/TablaReporte";
import { SkeletonStatCards, SkeletonTableRows } from "@/components/motion/Skeleton";

function mesActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
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

function ListaAnalisis({
  icon: Icon,
  titulo,
  items,
  color,
}: {
  icon: typeof CircleCheck;
  titulo: string;
  items: string[];
  color: "success" | "warning" | "primary";
}) {
  const estilos = {
    success: { fondo: "bg-success/10", texto: "text-success" },
    warning: { fondo: "bg-warning/10", texto: "text-warning" },
    primary: { fondo: "bg-primary/10", texto: "text-primary" },
  }[color];

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${estilos.fondo}`}>
          <Icon className={`h-4 w-4 ${estilos.texto}`} />
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{titulo}</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Sin puntos para este período.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-foreground">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${estilos.fondo.replace("/10", "")}`} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; datos: ReporteEjecutivoResponse };

function ReporteEjecutivoResultado({ slug, filtro }: { slug: string; filtro: FiltroReporteState }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;
    fetchReporteEjecutivo(slug, filtro.periodo, {
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
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground shadow-card">
          <BrainCircuit className="h-4 w-4 animate-pulse text-primary" />
          Generando análisis ejecutivo con IA...
        </div>
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
    return <p className="text-sm text-destructive">No se pudo cargar el reporte ejecutivo para este período.</p>;
  }

  const { datos } = estado;

  return (
    <div className="space-y-4">
      {datos.analisis ? (
        <>
          <div className="bg-gradient-primary rounded-xl p-5 text-white shadow-elegant">
            <div className="flex items-center gap-2 text-white/80">
              <BrainCircuit className="h-4 w-4" />
              <p className="text-xs font-semibold tracking-wide uppercase">Análisis ejecutivo — generado por IA</p>
            </div>
            <p className="font-display mt-2 text-base leading-relaxed">{datos.analisis.resumenEjecutivo}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ListaAnalisis icon={CircleCheck} titulo="Fortalezas" items={datos.analisis.fortalezas} color="success" />
            <ListaAnalisis icon={TriangleAlert} titulo="Riesgos" items={datos.analisis.riesgos} color="warning" />
            <ListaAnalisis icon={Lightbulb} titulo="Recomendaciones" items={datos.analisis.recomendaciones} color="primary" />
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground shadow-card">
          No se pudo generar el análisis narrativo para este período — los datos agregados siguen disponibles abajo.
        </div>
      )}

      <ResumenEjecutivoReporte resumen={datos.resumen} />
      <TablaReporte datos={datos.detalle} />
    </div>
  );
}

export function ReportesEjecutivosView() {
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
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">Reportes Ejecutivos</h1>
        <p className="text-sm text-muted-foreground">Análisis narrativo generado por IA sobre el desempeño del equipo</p>
      </div>

      <FiltroPeriodoReporte
        filtro={filtro}
        onCambiarPeriodo={cambiarPeriodo}
        onCambiarValor={(valor) => setFiltro((prev) => ({ ...prev, valor }))}
        onCambiarFechaInicio={(fechaInicio) => setFiltro((prev) => ({ ...prev, fechaInicio }))}
        onCambiarFechaFin={(fechaFin) => setFiltro((prev) => ({ ...prev, fechaFin }))}
      />

      <ReporteEjecutivoResultado
        key={`${filtro.periodo}-${filtro.valor}-${filtro.fechaInicio}-${filtro.fechaFin}`}
        slug={slug}
        filtro={filtro}
      />
    </div>
  );
}
