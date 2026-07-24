"use client";

import { useEffect, useState } from "react";
import { type EmpleadoResumen, fetchEmpleados } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { EstampasCatalogo } from "../empleados/EstampasCatalogo";
import { SkeletonCardGrid } from "@/components/motion/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; empleados: EmpleadoResumen[] };

export function EstampasView() {
  const { slug } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;
    fetchEmpleados(slug)
      .then((empleados) => {
        if (!cancelado) setEstado({ tipo: "listo", empleados });
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: "error" });
      });
    return () => {
      cancelado = true;
    };
  }, [slug]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">Estampas</h1>
        <p className="text-sm text-muted-foreground">
          Crea, activa/desactiva y regala estampas de reconocimiento — aparecen en el mural de cada empleado.
        </p>
      </div>

      {estado.tipo === "cargando" && <SkeletonCardGrid count={4} />}
      {estado.tipo === "error" && <p className="text-sm text-destructive">No se pudo cargar el listado de empleados.</p>}
      {estado.tipo === "listo" && <EstampasCatalogo slug={slug} empleados={estado.empleados} />}
    </div>
  );
}
