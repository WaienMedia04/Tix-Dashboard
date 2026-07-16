"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Award, CheckCircle2, Sparkles } from "lucide-react";
import { type KpisResponse, fetchKpis } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { MetricCard } from "@/components/MetricCard";
import { EvolucionPuntajeChart } from "./EvolucionPuntajeChart";
import { BitacorasSemanalChart } from "./BitacorasSemanalChart";
import { DistribucionEstadoChart } from "./DistribucionEstadoChart";
import { DistribucionProductividadChart } from "./DistribucionProductividadChart";
import { TablaKpisEmpleado } from "./TablaKpisEmpleado";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonChart, SkeletonStatCards } from "@/components/motion/Skeleton";

function periodoActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; datos: KpisResponse };

function KpisResultado({ slug, periodo }: { slug: string; periodo: string }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;
    fetchKpis(slug, periodo)
      .then((datos) => {
        if (!cancelado) setEstado({ tipo: "listo", datos });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, periodo]);

  if (estado.tipo === "cargando") {
    return (
      <div className="space-y-4">
        <SkeletonStatCards count={4} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }
  if (estado.tipo === "error") {
    return <p className="text-sm text-destructive">No se pudieron cargar los KPIs.</p>;
  }

  const { datos } = estado;
  const { resumen } = datos;

  return (
    <div className="space-y-4">
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <MetricCard
            label="Puntaje IA promedio"
            value={resumen.puntajeProm === null ? "—" : resumen.puntajeProm.toFixed(1)}
            icon={Sparkles}
            variant="primary"
            delta={
              resumen.variacion === null || resumen.variacion === 0
                ? undefined
                : {
                    valor: `${resumen.variacion > 0 ? "+" : ""}${resumen.variacion.toFixed(1)} vs mes anterior`,
                    direccion: resumen.variacion > 0 ? "subida" : "bajada",
                  }
            }
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            label="% de cumplimiento"
            value={resumen.porcentajeCumplimientoPromedio === null ? "—" : `${resumen.porcentajeCumplimientoPromedio}%`}
            icon={CheckCircle2}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            label="Empleado destacado"
            value={resumen.empleadoDestacado?.nombre ?? "—"}
            hint={resumen.empleadoDestacado ? `${resumen.empleadoDestacado.puntajeProm.toFixed(1)} / 10` : undefined}
            icon={Award}
          />
        </StaggerItem>
        <StaggerItem>
          <MetricCard
            label="Empleados en riesgo"
            value={String(resumen.empleadosEnRiesgo)}
            hint="Puntaje IA promedio < 5"
            icon={AlertTriangle}
          />
        </StaggerItem>
      </StaggerGroup>

      <StaggerGroup className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StaggerItem>
          <EvolucionPuntajeChart datos={datos.evolucionSemanal} />
        </StaggerItem>
        <StaggerItem>
          <BitacorasSemanalChart datos={datos.bitacorasSemanal} />
        </StaggerItem>
        <StaggerItem>
          <DistribucionEstadoChart datos={datos.distribucionEstado} />
        </StaggerItem>
        <StaggerItem>
          <DistribucionProductividadChart datos={datos.distribucionProductividad} />
        </StaggerItem>
      </StaggerGroup>
      <TablaKpisEmpleado datos={datos.kpisPorEmpleado} />
    </div>
  );
}

export function KpisView() {
  const { slug } = usePanel();
  const [periodo, setPeriodo] = useState(periodoActual);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Período</label>
          <input
            type="month"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <KpisResultado key={periodo} slug={slug} periodo={periodo} />
    </div>
  );
}
