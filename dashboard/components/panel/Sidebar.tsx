"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { borrarCodigo } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "dashboard", label: "Dashboard" },
  { href: "bitacoras", label: "Bitácoras" },
  { href: "empleados", label: "Empleados" },
  { href: "kpis", label: "KPIs" },
  { href: "reportes", label: "Reportes" },
  { href: "configuracion", label: "Configuración" },
];

export function Sidebar({ slug, empresaNombre }: { slug: string; empresaNombre: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    borrarCodigo(slug);
    router.push(`/${slug}`);
  }

  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-sidebar-bg text-sidebar-foreground">
      <div className="px-6 py-6">
        <p className="text-base font-semibold tracking-tight">
          TalentiX RD<sup className="ml-0.5 text-[10px] text-sidebar-muted">™</sup>
        </p>
        <p className="mt-2 truncate text-sm text-sidebar-muted">{empresaNombre}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const href = `/${slug}/${item.href}`;
          const activo = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activo ? "bg-white/10 text-white" : "text-sidebar-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/docs"
          className="block rounded-md px-3 py-2 text-sm text-sidebar-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          Documentación
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full rounded-md px-3 py-2 text-left text-sm text-sidebar-muted transition-colors hover:bg-white/5 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
