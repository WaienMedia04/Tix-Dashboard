"use client";

import type { PeriodoReporte } from "@/lib/api";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

export function FiltroPeriodoReporte({
  periodo,
  valor,
  onCambiarPeriodo,
  onCambiarValor,
}: {
  periodo: PeriodoReporte;
  valor: string;
  onCambiarPeriodo: (periodo: PeriodoReporte) => void;
  onCambiarValor: (valor: string) => void;
}) {
  return (
    <div className="print:hidden flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tipo</label>
        <select
          value={periodo}
          onChange={(e) => onCambiarPeriodo(e.target.value as PeriodoReporte)}
          className={CAMPO_CLASES}
        >
          <option value="mensual">Mensual</option>
          <option value="semanal">Semanal</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Período</label>
        {periodo === "mensual" ? (
          <input
            type="month"
            value={valor}
            onChange={(e) => onCambiarValor(e.target.value)}
            className={CAMPO_CLASES}
          />
        ) : (
          <input
            type="week"
            value={valor}
            onChange={(e) => onCambiarValor(e.target.value)}
            className={CAMPO_CLASES}
          />
        )}
      </div>
    </div>
  );
}
