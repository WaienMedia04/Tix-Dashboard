"use client";

import { usePathname } from "next/navigation";

function mesAnoActual(): string {
  const texto = new Date().toLocaleDateString("es-DO", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function Header({ empresaNombre, plan }: { empresaNombre: string; plan: string }) {
  const pathname = usePathname();
  const segmento = pathname.split("/").filter(Boolean)[1] ?? "dashboard";

  const SECCIONES: Record<string, { titulo: string; subtitulo: string }> = {
    dashboard: { titulo: "Dashboard", subtitulo: `Resumen general — ${mesAnoActual()}` },
    bitacoras: { titulo: "Bitácoras", subtitulo: "Historial de bitácoras enviadas" },
    empleados: { titulo: "Empleados", subtitulo: "Gestión y perfiles del equipo" },
    kpis: { titulo: "KPIs y Métricas", subtitulo: "Análisis de productividad del equipo" },
    reportes: { titulo: "Reportes", subtitulo: "Resúmenes ejecutivos por período" },
    configuracion: { titulo: "Configuración", subtitulo: "Datos y accesos de la empresa" },
  };

  const seccion = SECCIONES[segmento] ?? SECCIONES.dashboard;

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-background px-8 print:hidden">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{seccion.titulo}</h1>
        <p className="text-sm text-muted-foreground">{seccion.subtitulo}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{empresaNombre}</p>
        <p className="text-xs text-muted-foreground capitalize">Plan {plan}</p>
      </div>
    </header>
  );
}
