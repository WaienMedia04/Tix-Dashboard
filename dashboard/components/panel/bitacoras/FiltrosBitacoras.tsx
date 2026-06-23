"use client";

import type { EstadoFiltro } from "@/lib/api";

export interface FiltrosState {
  fechaInicio: string;
  fechaFin: string;
  talentoId: string;
  estado: EstadoFiltro | "";
}

const OPCIONES_ESTADO: { value: EstadoFiltro | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "enviada", label: "Enviada" },
  { value: "no_enviada", label: "No enviada" },
  { value: "pendiente", label: "Permiso autorizado" },
];

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

export function FiltrosBitacoras({
  talentos,
  valores,
  onChange,
  onLimpiar,
}: {
  talentos: { talentoId: string; nombreCompleto: string }[];
  valores: FiltrosState;
  onChange: (valores: FiltrosState) => void;
  onLimpiar: () => void;
}) {
  function set<K extends keyof FiltrosState>(campo: K, valor: FiltrosState[K]) {
    onChange({ ...valores, [campo]: valor });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Desde</label>
        <input
          type="date"
          value={valores.fechaInicio}
          onChange={(e) => set("fechaInicio", e.target.value)}
          className={CAMPO_CLASES}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Hasta</label>
        <input
          type="date"
          value={valores.fechaFin}
          onChange={(e) => set("fechaFin", e.target.value)}
          className={CAMPO_CLASES}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empleado</label>
        <select
          value={valores.talentoId}
          onChange={(e) => set("talentoId", e.target.value)}
          className={CAMPO_CLASES}
        >
          <option value="">Todos</option>
          {talentos.map((t) => (
            <option key={t.talentoId} value={t.talentoId}>
              {t.nombreCompleto}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Estado</label>
        <select
          value={valores.estado}
          onChange={(e) => set("estado", e.target.value as EstadoFiltro | "")}
          className={CAMPO_CLASES}
        >
          {OPCIONES_ESTADO.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onLimpiar}
        className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
