"use client";

import { useEffect, useState } from "react";
import { type EmpleadoResumen, fetchEmpleados } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { FiltroDepartamento } from "../FiltroDepartamento";
import { EstampasCatalogo } from "../empleados/EstampasCatalogo";
import { SkeletonCardGrid } from "@/components/motion/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; empleados: EmpleadoResumen[] };

export function EstampasView() {
  const { slug } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [departamento, setDepartamento] = useState("");

  useEffect(() => {
    let cancelado = false;
    fetchEmpleados(slug, departamento || undefined)
      .then((empleados) => {
        if (!cancelado) setEstado({ tipo: "listo", empleados });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug, departamento]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">Estampas</h1>
          <p className="text-sm text-muted-foreground">
            Crea, activa/desactiva y regala estampas de reconocimiento — aparecen en el mural de cada empleado.
          </p>
        </div>
        <FiltroDepartamento value={departamento} onChange={setDepartamento} />
      </div>

      {estado.tipo === "cargando" && <SkeletonCardGrid count={4} />}
      {estado.tipo === "error" && <p className="text-sm text-destructive">No se pudo cargar el listado de empleados.</p>}
      {estado.tipo === "listo" && <EstampasCatalogo slug={slug} empleados={estado.empleados} />}
    </div>
  );
}
