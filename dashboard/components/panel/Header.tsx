"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export function Header({
  empresaNombre,
  plan,
  onAbrirMenu,
}: {
  empresaNombre: string;
  plan: string;
  onAbrirMenu?: () => void;
}) {
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
    <header className="bg-gradient-mesh pt-safe relative flex h-auto min-h-16 select-none items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:h-20 sm:px-8 sm:py-0 print:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onAbrirMenu}
          aria-label="Abrir menú"
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display truncate text-lg font-semibold text-foreground sm:text-2xl">
            {seccion.titulo}
          </h1>
          <p className="hidden truncate text-sm text-muted-foreground sm:block">{seccion.subtitulo}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="max-w-[40vw] truncate text-sm font-medium text-foreground">{empresaNombre}</p>
        <p className="text-xs text-muted-foreground capitalize">Plan {plan}</p>
      </div>
    </header>
  );
}
