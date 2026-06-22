"use client";

import type { DashboardData } from "@/lib/api";
import { usePanel } from "./PanelContext";
import { MetricCard } from "../MetricCard";
import { RankingTalentos } from "../RankingTalentos";
import { WorklogsRecientes } from "../WorklogsRecientes";

function puntajeIAPromedioGlobal(data: DashboardData): string {
  const conPuntaje = data.rankingTalentos.filter((t) => t.puntajeIAPromedio !== null);
  if (conPuntaje.length === 0) return "—";
  const promedio =
    conPuntaje.reduce((sum, t) => sum + (t.puntajeIAPromedio ?? 0), 0) / conPuntaje.length;
  return `${promedio.toFixed(1)} / 10`;
}

export function DashboardResumen() {
  const { dashboardInicial: data } = usePanel();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total de bitácoras" value={String(data.metricas.totalBitacoras)} />
        <MetricCard
          label="% de cumplimiento"
          value={`${data.metricas.porcentajeEnviadas}%`}
          hint={`${data.metricas.enviadas} de ${data.metricas.totalBitacoras} enviadas`}
        />
        <MetricCard label="Puntaje IA promedio" value={puntajeIAPromedioGlobal(data)} />
      </div>

      <RankingTalentos talentos={data.rankingTalentos} />
      <WorklogsRecientes worklogs={data.worklogsRecientes} />
    </div>
  );
}
