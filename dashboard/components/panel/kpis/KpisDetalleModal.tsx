"use client";

import type { KpiEmpleado } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/Avatar";
import { TablaKpisEmpleado } from "./TablaKpisEmpleado";

export type KpisDetalleKey = "puntaje-ia" | "cumplimiento" | "empleado-destacado" | "empleados-en-riesgo";

const TITULOS: Record<KpisDetalleKey, string> = {
  "puntaje-ia": "Puntaje IA promedio — por empleado",
  cumplimiento: "% de cumplimiento — por empleado",
  "empleado-destacado": "Empleado destacado",
  "empleados-en-riesgo": "Empleados en riesgo",
};

function FilaEmpleado({ kpi, motivo }: { kpi: KpiEmpleado; motivo: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <Avatar nombreCompleto={kpi.nombre} fotoUrl={kpi.fotoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{kpi.nombre}</p>
        <p className="text-xs text-muted-foreground">{motivo}</p>
      </div>
    </div>
  );
}

function construirContenido(detalleKey: KpisDetalleKey, kpisPorEmpleado: KpiEmpleado[]): React.ReactNode {
  if (detalleKey === "puntaje-ia" || detalleKey === "cumplimiento") {
    return <TablaKpisEmpleado datos={kpisPorEmpleado} />;
  }

  if (detalleKey === "empleado-destacado") {
    const destacado = kpisPorEmpleado[0];
    if (!destacado) return <p className="text-sm text-muted-foreground">Sin datos suficientes este período.</p>;
    return (
      <FilaEmpleado
        kpi={destacado}
        motivo={`Puntaje IA ${destacado.puntajeProm === null ? "—" : destacado.puntajeProm.toFixed(1)} / 10${
          destacado.cumplimiento === null ? "" : ` · ${destacado.cumplimiento}% cumplimiento`
        }`}
      />
    );
  }

  // empleados-en-riesgo
  const enRiesgo = kpisPorEmpleado.filter((k) => k.puntajeProm !== null && k.puntajeProm < 5);
  if (enRiesgo.length === 0) {
    return <p className="text-sm text-muted-foreground">Nadie está en riesgo este período.</p>;
  }
  return (
    <div className="space-y-2">
      {enRiesgo.map((k) => (
        <FilaEmpleado
          key={k.talentoId}
          kpi={k}
          motivo={`Puntaje IA ${k.puntajeProm!.toFixed(1)} / 10${
            k.cumplimiento === null ? "" : ` · ${k.cumplimiento}% cumplimiento`
          }`}
        />
      ))}
    </div>
  );
}

export function KpisDetalleModal({
  detalleKey,
  kpisPorEmpleado,
  onClose,
}: {
  detalleKey: KpisDetalleKey | null;
  kpisPorEmpleado: KpiEmpleado[];
  onClose: () => void;
}) {
  return (
    <Modal open={detalleKey !== null} onClose={onClose} title={detalleKey ? TITULOS[detalleKey] : ""} size="lg">
      {detalleKey && construirContenido(detalleKey, kpisPorEmpleado)}
    </Modal>
  );
}
