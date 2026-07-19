"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Cake,
  ChevronsLeft,
  ChevronsRight,
  FileBarChart,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Moon,
  NotebookPen,
  Settings,
  Sun,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type Rol } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useEsMobile } from "@/lib/use-es-mobile";

interface ItemGrupo {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Clase Tailwind de color aplicada directamente al ícono. */
  color: string;
  /** Si se omite, el item es visible para todos los roles. */
  rolesPermitidos?: Rol[];
}

const GRUPOS: { titulo: string; items: ItemGrupo[] }[] = [
  {
    titulo: "Operación",
    items: [
      { href: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-violet-400" },
      { href: "bitacoras", label: "Bitácoras", icon: NotebookPen, color: "text-cyan-400" },
      { href: "empleados", label: "Empleados", icon: Users, color: "text-emerald-400" },
      {
        href: "murales",
        label: "Murales",
        icon: Images,
        color: "text-fuchsia-400",
        rolesPermitidos: ["CEO", "RRHH", "MANAGER"],
      },
      { href: "cumpleanos", label: "Cumpleaños", icon: Cake, color: "text-rose-400" },
    ],
  },
  {
    titulo: "Administración",
    items: [
      { href: "kpis", label: "KPIs", icon: BarChart3, color: "text-blue-400" },
      { href: "reportes", label: "Reportes", icon: FileBarChart, color: "text-amber-400" },
      {
        href: "configuracion",
        label: "Configuración",
        icon: Settings,
        color: "text-slate-400",
        rolesPermitidos: ["CEO", "RRHH"],
      },
    ],
  },
  {
    titulo: "Inteligencia",
    items: [
      {
        href: "rankings",
        label: "Rankings",
        icon: Trophy,
        color: "text-yellow-400",
        rolesPermitidos: ["CEO", "RRHH", "MANAGER"],
      },
      {
        href: "alertas",
        label: "Alertas",
        icon: AlertTriangle,
        color: "text-red-400",
        rolesPermitidos: ["CEO", "RRHH", "MANAGER"],
      },
      {
        href: "novedades",
        label: "Novedades",
        icon: Megaphone,
        color: "text-sky-400",
        rolesPermitidos: ["CEO", "RRHH"],
      },
      {
        href: "reportes-ejecutivos",
        label: "Reportes Ejecutivos",
        icon: BrainCircuit,
        color: "text-purple-400",
        rolesPermitidos: ["CEO", "RRHH"],
      },
    ],
  },
];

const CLAVE_SESION = "tix-sidebar-colapsado";

function ItemNav({
  href,
  label,
  Icon,
  color,
  activo,
  colapsado,
  onNavegar,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  activo: boolean;
  colapsado: boolean;
  onNavegar?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavegar}
      className={`group relative flex items-center gap-2.5 rounded-md py-2 text-sm font-medium transition-colors ${
        colapsado ? "justify-center px-0" : "px-3"
      } ${activo ? "text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}
    >
      {activo && (
        <motion.span
          layoutId="sidebar-activo"
          className="absolute inset-0 rounded-md bg-sidebar-accent"
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      )}
      {activo && (
        <motion.span
          layoutId="sidebar-activo-barra"
          className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full bg-primary"
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      )}
      <Icon className={`relative z-10 h-4 w-4 shrink-0 ${color}`} />
      {!colapsado && <span className="relative z-10 truncate">{label}</span>}
      {colapsado && (
        <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
          {label}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({
  slug,
  empresaNombre,
  rol,
  abierto = false,
  onCerrar,
}: {
  slug: string;
  empresaNombre: string;
  rol: Rol;
  /** Estado del drawer en móvil/tablet — sin efecto en escritorio. */
  abierto?: boolean;
  onCerrar?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reducirMovimiento = useReducedMotion();
  const { resolvedTheme, setTheme } = useTheme();
  const esMobile = useEsMobile();
  const [montado, setMontado] = useState(false);
  const [colapsado, setColapsado] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(CLAVE_SESION) === "1",
  );

  // Evita el mismatch de hidratación: resolvedTheme es undefined en el
  // primer render del servidor/cliente hasta que next-themes lee la cookie.
  // Patrón oficial de next-themes para toggles de tema.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);

  // En móvil el drawer siempre muestra las etiquetas completas — el modo
  // "solo íconos" no tiene sentido en un panel que ya se cierra solo.
  const colapsadoVisual = esMobile ? false : colapsado;

  function alternarColapso() {
    setColapsado((prev) => {
      const siguiente = !prev;
      sessionStorage.setItem(CLAVE_SESION, siguiente ? "1" : "0");
      return siguiente;
    });
  }

  async function handleLogout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.push("/");
  }

  const esOscuro = montado && resolvedTheme === "dark";

  return (
    <>
      {esMobile && abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}
      <motion.aside
        animate={esMobile ? undefined : { width: colapsado ? 72 : 240 }}
        initial={false}
        transition={{ duration: reducirMovimiento ? 0 : 0.22, ease: "easeOut" }}
        className={`bg-sidebar flex h-full shrink-0 select-none flex-col border-r border-sidebar-border text-sidebar-foreground print:hidden ${
          esMobile
            ? `pt-safe pb-safe fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200 ${
                abierto ? "translate-x-0" : "-translate-x-full"
              }`
            : ""
        }`}
      >
        <div
          className={`flex items-center gap-2 px-4 py-5 ${colapsadoVisual ? "justify-center px-0" : "justify-between"}`}
        >
          {!colapsadoVisual && (
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-foreground">
                TalentiX <span className="text-primary">RD</span>
                <sup className="ml-0.5 text-[10px] text-muted-foreground">™</sup>
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{empresaNombre}</p>
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
              onClick={alternarColapso}
              aria-label={colapsado ? "Expandir menú" : "Colapsar menú"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              {colapsado ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3">
          {GRUPOS.map((grupo, idx) => {
            const items = grupo.items.filter(
              (item) => !item.rolesPermitidos || item.rolesPermitidos.includes(rol),
            );
            if (items.length === 0) return null;
            return (
              <div key={grupo.titulo}>
                {!colapsadoVisual ? (
                  <p className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                    {grupo.titulo}
                  </p>
                ) : (
                  idx > 0 && <div className="mx-2 mb-2 border-t border-sidebar-border" />
                )}
                <div className="mt-2 space-y-1">
                  {items.map((item) => {
                    const href = `/${slug}/${item.href}`;
                    const activo = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <ItemNav
                        key={item.href}
                        href={href}
                        label={item.label}
                        Icon={item.icon}
                        color={item.color}
                        activo={activo}
                        colapsado={colapsadoVisual}
                        onNavegar={esMobile ? onCerrar : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
          <ItemNav
            href="/docs"
            label="Documentación"
            Icon={BookOpen}
            color="text-teal-400"
            activo={false}
            colapsado={colapsadoVisual}
          />
          <button
            onClick={() => setTheme(esOscuro ? "light" : "dark")}
            aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className={`group relative flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground ${
              colapsadoVisual ? "justify-center px-0" : "px-3"
            }`}
          >
            {esOscuro ? (
              <Sun className="h-4 w-4 shrink-0 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 shrink-0 text-indigo-400" />
            )}
            {!colapsadoVisual && <span className="truncate">{esOscuro ? "Modo claro" : "Modo oscuro"}</span>}
            {colapsadoVisual && (
              <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                {esOscuro ? "Modo claro" : "Modo oscuro"}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`group relative flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground ${
              colapsadoVisual ? "justify-center px-0" : "px-3"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-400" />
            {!colapsadoVisual && <span className="truncate">Cerrar sesión</span>}
            {colapsadoVisual && (
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
