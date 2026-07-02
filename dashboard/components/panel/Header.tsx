"use client";

import { usePathname } from "next/navigation";

export function Header({ empresaNombre, plan }: { empresaNombre: string; plan: string }) {
  const pathname = usePathname();
  const segmento = pathname.split("/").filter(Boolean)[1] ?? "dashboard";

  const SECCIONES: Record<string, { titulo: string; subtitulo: string }> = {
    dashboard: {
      titulo: "Dashboard",
      subtitulo: "Planifica, prioriza y da seguimiento al equipo con claridad.",
    },
    bitacoras: { titulo: "Bitácoras", subtitulo: "Historial de bitácoras enviadas" },
    empleados: { titulo: "Empleados", subtitulo: "Gestión y perfiles del equipo" },
    kpis: { titulo: "KPIs y Métricas", subtitulo: "Análisis de productividad del equipo" },
    reportes: { titulo: "Reportes", subtitulo: "Resúmenes ejecutivos por período" },
    configuracion: { titulo: "Configuración", subtitulo: "Datos y accesos de la empresa" },
  };

  const seccion = SECCIONES[segmento] ?? SECCIONES.dashboard;

  return (
    <header className="bg-gradient-mesh relative flex h-20 select-none items-center justify-between border-b border-border bg-background px-8 print:hidden">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{seccion.titulo}</h1>
        <p className="text-sm text-muted-foreground">{seccion.subtitulo}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{empresaNombre}</p>
        <p className="text-xs text-muted-foreground capitalize">Plan {plan}</p>
      </div>
    </header>
  );
}
