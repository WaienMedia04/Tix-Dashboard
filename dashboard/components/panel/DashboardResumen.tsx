"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Sparkles, Users } from "lucide-react";
import { type DashboardData, fetchDashboard } from "@/lib/api";
import { usePanel } from "./PanelContext";
import { FiltroDepartamento } from "./FiltroDepartamento";
import { MetricCard } from "../MetricCard";
import { RankingTalentos } from "../RankingTalentos";
import { StaggerGroup, StaggerItem } from "../motion/Stagger";
import { ProductividadChart } from "./dashboard/ProductividadChart";
import { GaugeCumplimiento } from "./dashboard/GaugeCumplimiento";
import { GaugeCheckin } from "./dashboard/GaugeCheckin";
import { BitacoraDestacada } from "./dashboard/BitacoraDestacada";
import { ResumenHoyCard } from "./dashboard/ResumenHoyCard";
import { ActividadEquipo } from "./dashboard/ActividadEquipo";
import { DashboardDetalleModal, type DashboardDetalleKey } from "./DashboardDetalleModal";
import { WorklogDetalleModal, worklogRecienteADetalle } from "./bitacoras/WorklogDetalleModal";
import { SkeletonStatCards } from "@/components/motion/Skeleton";

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

function DashboardContenido({ data }: { data: DashboardData }) {
  const [detalleKey, setDetalleKey] = useState<DashboardDetalleKey | null>(null);
  const bitacoraReciente = data.worklogsRecientes[0];
  const [verBitacoraReciente, setVerBitacoraReciente] = useState(false);

  return (
    <StaggerGroup className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StaggerItem className="h-40">
          <MetricCard
            label="Total de bitácoras"
            value={String(data.metricas.totalBitacoras)}
            hint={mesEnCurso()}
            icon={ClipboardList}
            variant="primary"
            onClick={() => setDetalleKey("total-bitacoras")}
          />
        </StaggerItem>
        <StaggerItem className="h-40">
          <MetricCard
            label="% de cumplimiento"
            value={`${data.metricas.porcentajeEnviadas}%`}
            hint={`${data.metricas.enviadas} de ${data.metricas.totalBitacoras} enviadas`}
            icon={CheckCircle2}
            onClick={() => setDetalleKey("cumplimiento")}
          />
        </StaggerItem>
        <StaggerItem className="h-40">
          <MetricCard
            label="Puntaje IA promedio"
            value={puntajeIAPromedioGlobal(data)}
            icon={Sparkles}
            onClick={() => setDetalleKey("puntaje-ia")}
          />
        </StaggerItem>
        <StaggerItem className="h-40">
          <MetricCard
            label="Empleados activos"
            value={String(data.metricas.empleadosActivos)}
            icon={Users}
            onClick={() => setDetalleKey("empleados-activos")}
          />
        </StaggerItem>
        <StaggerItem className="h-40">
          <GaugeCumplimiento
            porcentaje={data.metricas.totalBitacoras === 0 ? null : data.metricas.porcentajeEnviadas}
            onClick={() => setDetalleKey("cumplimiento-equipo")}
          />
        </StaggerItem>
        <StaggerItem className="h-40">
          <GaugeCheckin
            porcentaje={data.metricas.empleadosActivos === 0 ? null : data.metricas.porcentajeCheckinHoy}
            onClick={() => setDetalleKey("checkin-equipo")}
          />
        </StaggerItem>
      </div>

      <StaggerItem>
        <div className="min-h-[24rem]">
          <RankingTalentos talentos={data.rankingTalentos} fondoGalaxia />
        </div>
      </StaggerItem>

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
            <div className="h-44">
              <ResumenHoyCard
                bitacorasHoy={data.metricas.bitacorasHoy}
                totalBitacoras={data.metricas.totalBitacoras}
                onClick={() => setDetalleKey("bitacoras-hoy")}
              />
            </div>
          </StaggerItem>
          <StaggerItem>
            <BitacoraDestacada worklog={bitacoraReciente} onClick={() => setVerBitacoraReciente(true)} />
          </StaggerItem>
        </div>
      </div>

      <DashboardDetalleModal detalleKey={detalleKey} data={data} onClose={() => setDetalleKey(null)} />
      <WorklogDetalleModal
        detalle={verBitacoraReciente && bitacoraReciente ? worklogRecienteADetalle(bitacoraReciente) : null}
        onClose={() => setVerBitacoraReciente(false)}
      />
    </StaggerGroup>
  );
}

/**
 * Cuando hay un departamento seleccionado empieza sin data (fetch propio);
 * sin filtro, arranca directo con el snapshot inicial del servidor — así
 * "Todos" nunca dispara un fetch de más. Se monta con key={departamento}
 * desde el padre para que cambiar el filtro reinicie este estado sin
 * necesidad de un setState síncrono dentro de un efecto.
 */
function DashboardResultado({
  slug,
  departamento,
  dashboardInicial,
}: {
  slug: string;
  departamento: string;
  dashboardInicial: DashboardData;
}) {
  const [data, setData] = useState<DashboardData | null>(departamento ? null : dashboardInicial);

  useEffect(() => {
    if (!departamento) return;
    let cancelado = false;
    fetchDashboard(slug, departamento)
      .then((datos) => {
        if (!cancelado) setData(datos);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [slug, departamento]);

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SkeletonStatCards count={6} />
      </div>
    );
  }
  return <DashboardContenido data={data} />;
}

export function DashboardResumen() {
  const { slug, dashboardInicial } = usePanel();
  const [departamento, setDepartamento] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FiltroDepartamento value={departamento} onChange={setDepartamento} />
      </div>
      <DashboardResultado key={departamento} slug={slug} departamento={departamento} dashboardInicial={dashboardInicial} />
    </div>
  );
}
