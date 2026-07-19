"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenSquare } from "lucide-react";
import { type MuralDirectorioItem, fetchMuralDirectorio } from "@/lib/api";
import { usePanel } from "../PanelContext";
import { Avatar } from "@/components/Avatar";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { SkeletonCardGrid } from "@/components/motion/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error" }
  | { tipo: "listo"; talentos: MuralDirectorioItem[] };

export function MuralesView() {
  const { slug } = usePanel();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;
    fetchMuralDirectorio(slug)
      .then((talentos) => {
        if (!cancelado) setEstado({ tipo: "listo", talentos });
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
    return <p className="text-sm text-destructive">No se pudieron cargar los murales.</p>;
  }
  if (estado.talentos.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay empleados activos todavía.</p>;
  }

  return (
    <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {estado.talentos.map((talento) => (
        <StaggerItem key={talento.id}>
          <Link
            href={`/${slug}/mi-mural/${talento.id}`}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center shadow-card transition-colors hover:border-primary/40"
          >
            <Avatar nombreCompleto={talento.nombreCompleto} fotoUrl={talento.fotoUrl} size="lg" />
            <div className="w-full min-w-0">
              <p className="font-display truncate text-sm font-semibold text-foreground">
                {talento.nombreCompleto}
              </p>
              <p className="truncate text-xs text-muted-foreground" title={talento.rol}>
                {talento.rol}
              </p>
            </div>
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <PenSquare className="h-3 w-3" />
              Ver mural
            </span>
          </Link>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
