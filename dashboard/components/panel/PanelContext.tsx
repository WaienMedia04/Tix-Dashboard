"use client";

import { createContext, useContext } from "react";
import type { DashboardData, EmpresaDisponible, Rol } from "@/lib/api";

export interface PanelContextValue {
  slug: string;
  rol: Rol;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioFotoUrl: string | null;
  departamentosSupervisados: string[];
  empresa: { nombre: string; slug: string; plan: string; logoUrl: string | null };
  /** Sucursales: empresa propia + cualquiera vinculada (solo CEO/RRHH puede tener más de una). */
  empresasDisponibles: EmpresaDisponible[];
  dashboardInicial: DashboardData;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export function PanelProvider({
  value,
  children,
}: {
  value: PanelContextValue;
  children: React.ReactNode;
}) {
  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

export function usePanel(): PanelContextValue {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("usePanel debe usarse dentro de un PanelProvider");
  }
  return ctx;
}
