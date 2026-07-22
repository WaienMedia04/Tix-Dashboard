"use client";

import { useEffect, useState } from "react";
import { type EmpleadoResumen, fetchEmpleados } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { FiltroDepartamento } from "../FiltroDepartamento";
import { EmpleadoCard } from "./EmpleadoCard";
import { EstampasCatalogo } from "./EstampasCatalogo";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonCardGrid } from "@/components/motion/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; empleados: EmpleadoResumen[] };

export function EmpleadosView() {
  const { slug, rol } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [departamento, setDepartamento] = useState("");
  const puedeGestionarEstampas = rol === "CEO" || rol === "RRHH";

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

  const filtro = (
    <div className="flex justify-end">
      <FiltroDepartamento value={departamento} onChange={setDepartamento} />
    </div>
  );

  if (estado.tipo === "cargando") {
    return (
      <div className="space-y-4">
        {filtro}
        <SkeletonCardGrid count={8} />
      </div>
    );
  }
  if (estado.tipo === "error") {
    return (
      <div className="space-y-4">
        {filtro}
        <p className="text-sm text-destructive">No se pudo cargar el listado de empleados.</p>
      </div>
    );
  }

  const primerLugarId = estado.empleados
    .filter((e) => e.estado === "activo" && e.puntajeIAPromedio !== null)
    .sort((a, b) => (b.puntajeIAPromedio ?? 0) - (a.puntajeIAPromedio ?? 0))[0]?.id;

  return (
    <div className="space-y-4">
      {filtro}
      {puedeGestionarEstampas && <EstampasCatalogo slug={slug} empleados={estado.empleados} />}

      {estado.empleados.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay empleados registrados.</p>
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {estado.empleados.map((empleado) => (
            <StaggerItem key={empleado.id}>
              <EmpleadoCard slug={slug} empleado={empleado} esPrimero={empleado.id === primerLugarId} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
