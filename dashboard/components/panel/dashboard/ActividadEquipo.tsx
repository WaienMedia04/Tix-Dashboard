"use client";

import type { ActividadEmpleado } from "@/lib/api";
import { EstadoBadge } from "@/components/EstadoBadge";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export function ActividadEquipo({ empleados }: { empleados: ActividadEmpleado[] }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold text-foreground">Actividad del equipo</h2>
        <p className="text-xs text-muted-foreground">Última bitácora registrada por cada empleado</p>
      </div>
      <StaggerGroup className="divide-y divide-border">
        {empleados.map((e) => (
          <StaggerItem key={e.talentoId}>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {iniciales(e.nombreCompleto)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{e.nombreCompleto}</p>
                <p className="truncate text-xs text-muted-foreground" title={e.rol}>
                  {e.rol}
                </p>
              </div>
              {e.fecha === null ? (
                <span className="text-xs text-muted-foreground">Sin bitácoras</span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{formatearFecha(e.fecha)}</span>
                  {e.estadoEnvio && <EstadoBadge estado={e.estadoEnvio} />}
                </div>
              )}
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
