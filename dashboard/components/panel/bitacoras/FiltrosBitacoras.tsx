"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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
  { value: "permiso", label: "Permiso autorizado" },
];

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

type PeriodoPreset = "semanal" | "mensual" | "anual";

const PRESETS: { value: PeriodoPreset; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
];

function aISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function calcularRangoPreset(preset: PeriodoPreset): { fechaInicio: string; fechaFin: string } {
  const hoy = new Date();
  if (preset === "semanal") {
    const dia = hoy.getDay() || 7; // 1=lunes .. 7=domingo
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dia + 1);
    const fin = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
    return { fechaInicio: aISO(inicio), fechaFin: aISO(fin) };
  }
  if (preset === "mensual") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return { fechaInicio: aISO(inicio), fechaFin: aISO(fin) };
  }
  const inicio = new Date(hoy.getFullYear(), 0, 1);
  const fin = new Date(hoy.getFullYear(), 11, 31);
  return { fechaInicio: aISO(inicio), fechaFin: aISO(fin) };
}

/** Búsqueda con autocompletado por nombre — resuelve a un talentoId exacto. */
function BuscadorEmpleado({
  talentos,
  valor,
  onChange,
}: {
  talentos: { talentoId: string; nombreCompleto: string }[];
  valor: string;
  onChange: (talentoId: string) => void;
}) {
  const seleccionado = talentos.find((t) => t.talentoId === valor);
  const [texto, setTexto] = useState(seleccionado?.nombreCompleto ?? "");
  const [abierto, setAbierto] = useState(false);

  // Mantiene el texto sincronizado si el filtro se limpia desde afuera
  // (p.ej. el botón "Limpiar filtros").
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTexto(seleccionado?.nombreCompleto ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  const coincidencias = texto.trim()
    ? talentos.filter((t) => t.nombreCompleto.toLowerCase().includes(texto.trim().toLowerCase()))
    : talentos;

  return (
    <div className="relative flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empleado</label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={texto}
          placeholder="Buscar por nombre..."
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            if (e.target.value.trim() === "" && valor !== "") onChange("");
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 120)}
          className={`${CAMPO_CLASES} w-48 pl-8`}
        />
      </div>
      {abierto && (
        <ul className="absolute top-full left-0 z-20 mt-1 max-h-56 w-48 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-elegant">
          <li>
            <button
              type="button"
              onMouseDown={() => {
                onChange("");
                setTexto("");
                setAbierto(false);
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
            >
              Todos
            </button>
          </li>
          {coincidencias.length === 0 ? (
            <li className="px-3 py-1.5 text-sm text-muted-foreground">Sin coincidencias</li>
          ) : (
            coincidencias.map((t) => (
              <li key={t.talentoId}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onChange(t.talentoId);
                    setTexto(t.nombreCompleto);
                    setAbierto(false);
                  }}
                  className="w-full truncate px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted"
                >
                  {t.nombreCompleto}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

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
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const rango = calcularRangoPreset(p.value);
          const activo = valores.fechaInicio === rango.fechaInicio && valores.fechaFin === rango.fechaFin;
          return (
            <button
              key={p.value}
              onClick={() => onChange({ ...valores, ...rango })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                activo
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
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
        <BuscadorEmpleado talentos={talentos} valor={valores.talentoId} onChange={(id) => set("talentoId", id)} />
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
    </div>
  );
}
