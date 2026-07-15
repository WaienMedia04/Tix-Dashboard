"use client";

import { CheckCircle2, ClipboardList, Sparkles, Users } from "lucide-react";
import type { DashboardData } from "@/lib/api";
import { usePanel } from "./PanelContext";
import { MetricCard } from "../MetricCard";
import { RankingTalentos } from "../RankingTalentos";
import { StaggerGroup, StaggerItem } from "../motion/Stagger";
import { ProductividadChart } from "./dashboard/ProductividadChart";
import { GaugeCumplimiento } from "./dashboard/GaugeCumplimiento";
import { GaugeCheckin } from "./dashboard/GaugeCheckin";
import { BitacoraDestacada } from "./dashboard/BitacoraDestacada";
import { ResumenHoyCard } from "./dashboard/ResumenHoyCard";
import { ActividadEquipo } from "./dashboard/ActividadEquipo";

function puntajeIAPromedioGlobal(data: DashboardData): string {
  const conPuntaje = data.rankingTalentos.filter((t) => t.puntajeIAPromedio !== null);
  if (conPuntaje.length === 0) return "—";
  const promedio =
    conPuntaje.reduce((sum, t) => sum + (t.puntajeIAPromedio ?? 0), 0) / conPuntaje.length;
  return `${promedio.toFixed(1)} / 10`;
}

function mesEnCurso(): string {
  const texto = new Date().toLocaleDateString("es-DO", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function DashboardResumen() {
  const { dashboardInicial: data } = usePanel();

  return (
    <StaggerGroup className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <MetricCard
            label="Total de bitácoras"
            value={String(data.metricas.totalBitacoras)}
            hint={mesEnCurso()}
            icon={ClipboardList}
            variant="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            label="% de cumplimiento"
            value={`${data.metricas.porcentajeEnviadas}%`}
            hint={`${data.metricas.enviadas} de ${data.metricas.totalBitacoras} enviadas`}
            icon={CheckCircle2}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard label="Puntaje IA promedio" value={puntajeIAPromedioGlobal(data)} icon={Sparkles} />
        </StaggerItem>
        <StaggerItem>
          <MetricCard label="Empleados activos" value={String(data.metricas.empleadosActivos)} icon={Users} />
        </StaggerItem>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <StaggerItem>
            <div className="h-72">
              <ProductividadChart datos={data.productividadSemanal} />
            </div>
          </StaggerItem>
          <StaggerItem>
            <ActividadEquipo empleados={data.actividadEquipo} />
          </StaggerItem>
        </div>

        <div className="space-y-4">
          <StaggerItem>
            <div className="h-72">
              <RankingTalentos talentos={data.rankingTalentos} />
            </div>
          </StaggerItem>
          <div className="grid grid-cols-2 gap-4">
            <StaggerItem>
              <div className="h-44">
                <GaugeCumplimiento porcentaje={data.metricas.totalBitacoras === 0 ? null : data.metricas.porcentajeEnviadas} />
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="h-44">
                <GaugeCheckin porcentaje={data.metricas.empleadosActivos === 0 ? null : data.metricas.porcentajeCheckinHoy} />
              </div>
            </StaggerItem>
          </div>
          <StaggerItem>
            <div className="h-44">
              <ResumenHoyCard bitacorasHoy={data.metricas.bitacorasHoy} totalBitacoras={data.metricas.totalBitacoras} />
            </div>
          </StaggerItem>
          <StaggerItem>
            <BitacoraDestacada worklog={data.worklogsRecientes[0]} />
          </StaggerItem>
        </div>
      </div>
    </StaggerGroup>
  );
}
