"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Building2, ChevronsLeft, ChevronsRight, LayoutDashboard, LogOut } from "lucide-react";
import { borrarTokenAdmin } from "@/lib/admin-auth";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard global", icon: LayoutDashboard },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
];

const CLAVE = "tix-admin-sidebar";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const reducir = useReducedMotion();
  const [col, setCol] = useState(() => typeof window !== "undefined" && sessionStorage.getItem(CLAVE) === "1");

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
    <motion.aside
      animate={{ width: col ? 72 : 240 }}
      transition={{ duration: reducir ? 0 : 0.22, ease: "easeOut" }}
      className="bg-sidebar flex h-full shrink-0 select-none flex-col border-r border-sidebar-border text-sidebar-foreground print:hidden"
    >
      <div className={`flex items-center gap-2 px-4 py-5 ${col ? "justify-center px-0" : "justify-between"}`}>
        {!col && (
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
        <button
          onClick={toggle}
          aria-label={col ? "Expandir" : "Colapsar"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          {col ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const activo = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-2.5 rounded-md py-2 text-sm font-medium transition-colors ${col ? "justify-center px-0" : "px-3"} ${activo ? "text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}
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
              <item.icon className="relative z-10 h-4 w-4 shrink-0" />
              {!col && <span className="relative z-10 truncate">{item.label}</span>}
              {col && (
                <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <button
          onClick={logout}
          className={`group relative flex w-full items-center gap-2.5 rounded-md py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground ${col ? "justify-center px-0" : "px-3"}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!col && <span className="truncate">Cerrar sesión</span>}
          {col && (
            <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
              Cerrar sesión
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
