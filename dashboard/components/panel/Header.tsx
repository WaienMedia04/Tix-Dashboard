"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PenSquare } from "lucide-react";
import { usePanel } from "./PanelContext";
import { CampanaNotificaciones } from "@/components/notificaciones/CampanaNotificaciones";
import { MenuUsuario } from "./MenuUsuario";

export function Header({
  empresaNombre,
  plan,
  onAbrirMenu,
}: {
  empresaNombre: string;
  plan: string;
  onAbrirMenu?: () => void;
}) {
  const { slug } = usePanel();
  const pathname = usePathname();
  const segmento = pathname.split("/").filter(Boolean)[1] ?? "dashboard";

  const SECCIONES: Record<string, { titulo: string; subtitulo: string }> = {
    dashboard: {
      titulo: "Dashboard",
      subtitulo: "Planifica, prioriza y da seguimiento al equipo con claridad.",
    },
    bitacoras: { titulo: "Bitácoras", subtitulo: "Historial de bitácoras enviadas" },
    empleados: { titulo: "Empleados", subtitulo: "Gestión y perfiles del equipo" },
    murales: { titulo: "Murales", subtitulo: "El mural personal de cada talento" },
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
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href={`/${slug}/mi-mural`}
          aria-label="Mi Mural"
          title="Mi Mural"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <PenSquare className="h-4.5 w-4.5" />
        </Link>
        <CampanaNotificaciones slug={slug} />
        <div className="hidden text-right sm:block">
          <p className="max-w-[40vw] truncate text-sm font-medium text-foreground">{empresaNombre}</p>
          <p className="text-xs text-muted-foreground capitalize">Plan {plan}</p>
        </div>
        <div className="h-6 w-px shrink-0 bg-border" />
        <MenuUsuario />
      </div>
    </header>
  );
}
