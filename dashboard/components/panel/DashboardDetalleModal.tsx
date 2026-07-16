"use client";

import type { DashboardData } from "@/lib/api";
import { Modal } from "@/components/Modal";

export type DashboardDetalleKey =
  | "total-bitacoras"
  | "cumplimiento"
  | "puntaje-ia"
  | "empleados-activos"
  | "cumplimiento-equipo"
  | "checkin-equipo"
  | "bitacoras-hoy";

const TITULOS: Record<DashboardDetalleKey, string> = {
  "total-bitacoras": "Total de bitácoras del mes",
  cumplimiento: "% de cumplimiento por empleado",
  "puntaje-ia": "Puntaje IA promedio por empleado",
  "empleados-activos": "Empleados activos",
  "cumplimiento-equipo": "Cumplimiento del equipo",
  "checkin-equipo": "Check-in del equipo — hoy",
  "bitacoras-hoy": "Bitácoras enviadas hoy",
};

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Sin bitácoras registradas";
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

interface Fila {
  nombre: string;
  rol: string;
  principal: string;
  secundario?: string;
}

function TablaDetalle({ filas }: { filas: Fila[] }) {
  if (filas.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin datos para mostrar.</p>;
  }
  return (
    <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <tbody>
          {filas.map((f, idx) => (
            <tr key={idx} className="border-b border-border last:border-0">
              <td className="px-3 py-2.5">
                <p className="font-medium text-foreground">{f.nombre}</p>
                <p className="text-xs text-muted-foreground">{f.rol}</p>
              </td>
              <td className="px-3 py-2.5 text-right">
                <p className="tabular-nums text-foreground">{f.principal}</p>
                {f.secundario && <p className="text-xs tabular-nums text-muted-foreground">{f.secundario}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function construirContenido(detalleKey: DashboardDetalleKey, data: DashboardData): React.ReactNode {
  if (detalleKey === "total-bitacoras" || detalleKey === "cumplimiento" || detalleKey === "cumplimiento-equipo") {
    return (
      <TablaDetalle
        filas={data.rankingTalentos.map((t) => ({
          nombre: t.nombreCompleto,
          rol: t.rol,
          principal: `${t.bitacorasEnviadas} / ${t.totalBitacoras} enviadas`,
          secundario:
            t.totalBitacoras === 0 ? undefined : `${Math.round((t.bitacorasEnviadas / t.totalBitacoras) * 1000) / 10}%`,
        }))}
      />
    );
  }

  if (detalleKey === "puntaje-ia") {
    return (
      <TablaDetalle
        filas={[...data.rankingTalentos]
          .sort((a, b) => (b.puntajeIAPromedio ?? -1) - (a.puntajeIAPromedio ?? -1))
          .map((t) => ({
            nombre: t.nombreCompleto,
            rol: t.rol,
            principal: t.puntajeIAPromedio === null ? "—" : `${t.puntajeIAPromedio.toFixed(1)} / 10`,
          }))}
      />
    );
  }

  if (detalleKey === "empleados-activos") {
    const activos = data.actividadEquipo.filter((e) => e.estado === "activo");
    return (
      <TablaDetalle
        filas={activos.map((e) => ({
          nombre: e.nombreCompleto,
          rol: e.rol,
          principal: formatearFecha(e.fecha),
        }))}
      />
    );
  }

  if (detalleKey === "checkin-equipo") {
    const hoy = hoyIso();
    return (
      <TablaDetalle
        filas={data.actividadEquipo.map((e) => ({
          nombre: e.nombreCompleto,
          rol: e.rol,
          principal: e.fecha?.slice(0, 10) === hoy ? "Check-in enviado hoy" : "Sin check-in hoy",
        }))}
      />
    );
  }

  // bitacoras-hoy
  const hoy = hoyIso();
  return (
    <TablaDetalle
      filas={data.actividadEquipo
        .filter((e) => e.fecha?.slice(0, 10) === hoy)
        .map((e) => ({
          nombre: e.nombreCompleto,
          rol: e.rol,
          principal: e.estadoEnvio ?? "—",
        }))}
    />
  );
}

export function DashboardDetalleModal({
  detalleKey,
  data,
  onClose,
}: {
  detalleKey: DashboardDetalleKey | null;
  data: DashboardData;
  onClose: () => void;
}) {
  return (
    <Modal open={detalleKey !== null} onClose={onClose} title={detalleKey ? TITULOS[detalleKey] : ""} size="lg">
      {detalleKey && construirContenido(detalleKey, data)}
    </Modal>
  );
}
