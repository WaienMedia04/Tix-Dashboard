"use client";

import type { PeriodoReporte } from "@/lib/api";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

export interface FiltroReporteState {
  periodo: PeriodoReporte;
  valor: string;
  fechaInicio: string;
  fechaFin: string;
}

export function FiltroPeriodoReporte({
  filtro,
  onCambiarPeriodo,
  onCambiarValor,
  onCambiarFechaInicio,
  onCambiarFechaFin,
}: {
  filtro: FiltroReporteState;
  onCambiarPeriodo: (periodo: PeriodoReporte) => void;
  onCambiarValor: (valor: string) => void;
  onCambiarFechaInicio: (fecha: string) => void;
  onCambiarFechaFin: (fecha: string) => void;
}) {
  return (
    <div className="print:hidden flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tipo</label>
        <select
          value={filtro.periodo}
          onChange={(e) => onCambiarPeriodo(e.target.value as PeriodoReporte)}
          className={CAMPO_CLASES}
        >
          <option value="mensual">Mensual</option>
          <option value="semanal">Semanal</option>
          <option value="anual">Anual</option>
          <option value="personalizado">Rango personalizado</option>
        </select>
      </div>

      {filtro.periodo === "personalizado" ? (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Desde</label>
            <input
              type="date"
              value={filtro.fechaInicio}
              onChange={(e) => onCambiarFechaInicio(e.target.value)}
              className={CAMPO_CLASES}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Hasta</label>
            <input
              type="date"
              value={filtro.fechaFin}
              onChange={(e) => onCambiarFechaFin(e.target.value)}
              className={CAMPO_CLASES}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Período</label>
          {filtro.periodo === "mensual" && (
            <input
              type="month"
              value={filtro.valor}
              onChange={(e) => onCambiarValor(e.target.value)}
              className={CAMPO_CLASES}
            />
          )}
          {filtro.periodo === "semanal" && (
            <input
              type="week"
              value={filtro.valor}
              onChange={(e) => onCambiarValor(e.target.value)}
              className={CAMPO_CLASES}
            />
          )}
          {filtro.periodo === "anual" && (
            <input
              type="number"
              min="2020"
              max="2100"
              value={filtro.valor}
              onChange={(e) => onCambiarValor(e.target.value)}
              className={`${CAMPO_CLASES} w-28`}
            />
          )}
        </div>
      )}
    </div>
  );
}
