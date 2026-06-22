"use client";

import { usePathname } from "next/navigation";

const TITULOS: Record<string, string> = {
  dashboard: "Dashboard",
  bitacoras: "Bitácoras",
  empleados: "Empleados",
  kpis: "KPIs",
  reportes: "Reportes",
  configuracion: "Configuración",
};

export function Header({ empresaNombre, plan }: { empresaNombre: string; plan: string }) {
  const pathname = usePathname();
  const segmento = pathname.split("/").filter(Boolean)[1] ?? "dashboard";
  const titulo = TITULOS[segmento] ?? "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-border bg-background px-8">
      <h1 className="text-lg font-semibold text-foreground">{titulo}</h1>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{empresaNombre}</p>
        <p className="text-xs text-muted capitalize">Plan {plan}</p>
      </div>
    </header>
  );
}
