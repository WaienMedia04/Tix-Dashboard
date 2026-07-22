"use client";

import { useEffect, useState } from "react";
import { type DepartamentoDefinicion, fetchDepartamentos } from "@/lib/api";
import { usePanel } from "./PanelContext";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

/**
 * Filtro por departamento para reportes/bitácoras. El catálogo depende del
 * rol: CEO/RRHH ven todos los departamentos de la empresa, Gerente General
 * solo los que tiene asignados. Manager y Talento ya están acotados a un
 * único departamento por talentoScopeWhere(), así que el filtro no aporta
 * nada ahí y el componente no renderiza.
 */
export function FiltroDepartamento({ value, onChange }: { value: string; onChange: (valor: string) => void }) {
  const { slug, rol, departamentosSupervisados } = usePanel();
  const [catalogo, setCatalogo] = useState<DepartamentoDefinicion[]>([]);

  useEffect(() => {
    if (rol !== "CEO" && rol !== "RRHH") return;
    let cancelado = false;
    fetchDepartamentos(slug)
      .then((deptos) => {
        if (!cancelado) setCatalogo(deptos);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [slug, rol]);

  if (rol === "CEO" || rol === "RRHH") {
    if (catalogo.length === 0) return null;
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Departamento</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={CAMPO_CLASES}>
          <option value="">Todos</option>
          {catalogo.map((d) => (
            <option key={d.id} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (rol === "GERENTE_GENERAL") {
    if (departamentosSupervisados.length <= 1) return null;
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Departamento</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={CAMPO_CLASES}>
          <option value="">Todos los míos</option>
          {departamentosSupervisados.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}
