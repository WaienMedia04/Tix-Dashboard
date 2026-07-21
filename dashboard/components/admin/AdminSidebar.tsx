"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Building2, ChevronsLeft, ChevronsRight, LayoutDashboard, LifeBuoy, LogOut, Moon, Sun, X } from "lucide-react";
import { borrarTokenAdmin, leerTokenAdmin } from "@/lib/admin-auth";
import { fetchSolicitudesSoportePendientesAdmin } from "@/lib/admin-api";
import { useEsMobile } from "@/lib/use-es-mobile";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard global", icon: LayoutDashboard },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/soporte", label: "Soporte", icon: LifeBuoy },
];

const INTERVALO_PENDIENTES_MS = 45_000;

const CLAVE = "tix-admin-sidebar";

export function AdminSidebar({ abierto = false, onCerrar }: { abierto?: boolean; onCerrar?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const reducir = useReducedMotion();
  const { resolvedTheme, setTheme } = useTheme();
  const esMobile = useEsMobile();
  const [montado, setMontado] = useState(false);
  const [col, setCol] = useState(() => typeof window !== "undefined" && sessionStorage.getItem(CLAVE) === "1");
  const [pendientes, setPendientes] = useState(0);

  // Patrón oficial de next-themes: evita el mismatch de hidratación.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) return;
    let cancelado = false;
    function cargar() {
      fetchSolicitudesSoportePendientesAdmin(token!)
        .then((r) => {
          if (!cancelado) setPendientes(r.total);
        })
        .catch(() => {});
    }
    cargar();
    const id = setInterval(cargar, INTERVALO_PENDIENTES_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, []);

  const esOscuro = montado && resolvedTheme === "dark";
  const colVisual = esMobile ? false : col;

  function toggle() {
    setCol((p) => {
      const next = !p;
      sessionStorage.setItem(CLAVE, next ? "1" : "0");
      return next;
    });
  }

  function logout() {
    borrarTokenAdmin();
    router.push("/admin");
  }

  return (
    <>
      {esMobile && abierto && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCerrar} aria-hidden="true" />
      )}
      <motion.aside
        animate={esMobile ? undefined : { width: col ? 72 : 240 }}
        initial={false}
        transition={{ duration: reducir ? 0 : 0.22, ease: "easeOut" }}
        className={`bg-sidebar flex h-full shrink-0 select-none flex-col border-r border-sidebar-border text-sidebar-foreground print:hidden ${
          esMobile
            ? `pt-safe pb-safe fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200 ${
                abierto ? "translate-x-0" : "-translate-x-full"
              }`
            : ""
        }`}
      >
        <div className={`flex items-center gap-2 px-4 py-5 ${colVisual ? "justify-center px-0" : "justify-between"}`}>
          {!colVisual && (
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-foreground">
                TalentiX <span className="text-primary">RD</span>
                <sup className="ml-0.5 text-[10px] text-muted-foreground">™</sup>
              </p>
              <span className="mt-0.5 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                Admin
              </span>
            </div>
          )}
          {esMobile ? (
            <button
              onClick={onCerrar}
              aria-label="Cerrar menú"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={toggle}
              aria-label={col ? "Expandir" : "Colapsar"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              {col ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const activo = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={esMobile ? onCerrar : undefined}
                className={`group relative flex items-center gap-2.5 rounded-md py-2 text-sm font-medium transition-colors ${colVisual ? "justify-center px-0" : "px-3"} ${activo ? "text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}
              >
                {activo && (
                  <motion.span
                    layoutId="admin-sidebar-activo"
                    className="absolute inset-0 rounded-md bg-sidebar-accent"
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  />
                )}
                {activo && (
                  <motion.span
                    layoutId="admin-sidebar-barra"
                    className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full bg-primary"
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  />
                )}
                <span className="relative z-10 shrink-0">
                  <item.icon className="h-4 w-4" />
                  {item.href === "/admin/soporte" && pendientes > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-white">
                      {pendientes > 9 ? "9+" : pendientes}
                    </span>
                  )}
                </span>
                {!colVisual && <span className="relative z-10 truncate">{item.label}</span>}
                {colVisual && (
                  <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
          <button
            onClick={() => setTheme(esOscuro ? "light" : "dark")}
            aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className={`group relative flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground ${colVisual ? "justify-center px-0" : "px-3"}`}
          >
            {esOscuro ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!colVisual && <span className="truncate">{esOscuro ? "Modo claro" : "Modo oscuro"}</span>}
            {colVisual && (
              <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                {esOscuro ? "Modo claro" : "Modo oscuro"}
              </span>
            )}
          </button>
          <button
            onClick={logout}
            className={`group relative flex w-full items-center gap-2.5 rounded-md py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground ${colVisual ? "justify-center px-0" : "px-3"}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!colVisual && <span className="truncate">Cerrar sesión</span>}
            {colVisual && (
              <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                Cerrar sesión
              </span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
