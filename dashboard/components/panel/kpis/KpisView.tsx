"use client";

import { useEffect, useState } from "react";
import { type KpisResponse, fetchKpis } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { EvolucionPuntajeChart } from "./EvolucionPuntajeChart";
import { BitacorasSemanalChart } from "./BitacorasSemanalChart";
import { DistribucionEstadoChart } from "./DistribucionEstadoChart";
import { DistribucionProductividadChart } from "./DistribucionProductividadChart";
import { TablaKpisEmpleado } from "./TablaKpisEmpleado";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonChart } from "@/components/motion/Skeleton";

function periodoActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "listo"; datos: KpisResponse };

function KpisResultado({
  slug,
  codigoAcceso,
  periodo,
}: {
  slug: string;
  codigoAcceso: string;
  periodo: string;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;
    fetchKpis(slug, codigoAcceso, periodo)
      .then((datos) => {
        if (!cancelado) setEstado({ tipo: "listo", datos });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, codigoAcceso, periodo]);

  if (estado.tipo === "cargando") {
    return (
      <div className="space-y-4">
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

  return (
    <div className="space-y-4">
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
  const { slug, codigoAcceso } = usePanel();
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

      <KpisResultado key={periodo} slug={slug} codigoAcceso={codigoAcceso} periodo={periodo} />
    </div>
  );
}
