"use client";

import { useEffect, useState } from "react";
import { type EmpleadoResumen, fetchEmpleados } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { EmpleadoCard } from "./EmpleadoCard";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonCardGrid } from "@/components/motion/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; empleados: EmpleadoResumen[] };

export function EmpleadosView() {
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

  if (estado.tipo === "cargando") {
    return <SkeletonCardGrid count={8} />;
  }
  if (estado.tipo === "error") {
    return <p className="text-sm text-destructive">No se pudo cargar el listado de empleados.</p>;
  }
  if (estado.empleados.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay empleados registrados.</p>;
  }

  return (
    <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {estado.empleados.map((empleado) => (
        <StaggerItem key={empleado.id}>
          <EmpleadoCard slug={slug} empleado={empleado} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
