"use client";

import { createContext, useContext } from "react";
import type { DashboardData } from "@/lib/api";

export interface PanelContextValue {
  slug: string;
  codigoAcceso: string;
  empresa: { nombre: string; slug: string; plan: string };
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
