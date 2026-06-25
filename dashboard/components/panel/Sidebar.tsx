"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Settings,
  Users,
} from "lucide-react";
import { borrarCodigo } from "@/lib/auth";

const GRUPOS = [
  {
    titulo: "Operación",
    items: [
      { href: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "bitacoras", label: "Bitácoras", icon: NotebookPen },
      { href: "empleados", label: "Empleados", icon: Users },
    ],
  },
  {
    titulo: "Administración",
    items: [
      { href: "kpis", label: "KPIs", icon: BarChart3 },
      { href: "reportes", label: "Reportes", icon: FileBarChart },
      { href: "configuracion", label: "Configuración", icon: Settings },
    ],
  },
];

export function Sidebar({ slug, empresaNombre }: { slug: string; empresaNombre: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    borrarCodigo(slug);
    router.push(`/${slug}`);
  }

  return (
    <aside className="bg-gradient-sidebar fixed inset-y-0 left-0 flex w-60 flex-col text-sidebar-foreground print:hidden">
      <div className="px-6 py-6">
        <p className="text-base font-semibold tracking-tight">
          TalentiX RD<sup className="ml-0.5 text-[10px] text-sidebar-foreground/60">™</sup>
        </p>
        <p className="mt-2 truncate text-sm text-sidebar-foreground/60">{empresaNombre}</p>
      </div>

      <nav className="flex-1 space-y-6 px-3">
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase">
              {grupo.titulo}
            </p>
            <div className="mt-2 space-y-1">
              {grupo.items.map((item) => {
                const href = `/${slug}/${item.href}`;
                const activo = pathname === href || pathname.startsWith(`${href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      activo
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
        <Link
          href="/docs"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Documentación
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
