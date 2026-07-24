"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

/** Búsqueda con autocompletado por nombre — resuelve a un talentoId exacto. */
export function BuscadorEmpleado({
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
