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
  ChevronsLeft,
  ChevronsRight,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Moon,
  NotebookPen,
  Settings,
  Sun,
  Trophy,
  Users,
} from "lucide-react";
import { logout, type Rol } from "@/lib/api";

interface ItemGrupo {
  href: string;
  label: string;
  icon: React.ElementType;
  /** Si se omite, el item es visible para todos los roles. */
  rolesPermitidos?: Rol[];
}

const GRUPOS: { titulo: string; items: ItemGrupo[] }[] = [
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
      { href: "configuracion", label: "Configuración", icon: Settings, rolesPermitidos: ["CEO", "RRHH"] },
    ],
  },
  {
    titulo: "Inteligencia",
    items: [
      { href: "rankings", label: "Rankings", icon: Trophy, rolesPermitidos: ["CEO", "RRHH", "MANAGER"] },
      { href: "alertas", label: "Alertas", icon: AlertTriangle, rolesPermitidos: ["CEO", "RRHH", "MANAGER"] },
      { href: "novedades", label: "Novedades", icon: Megaphone, rolesPermitidos: ["CEO", "RRHH"] },
      {
        href: "reportes-ejecutivos",
        label: "Reportes Ejecutivos",
        icon: BrainCircuit,
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
  activo,
  colapsado,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  activo: boolean;
  colapsado: boolean;
}) {
  return (
    <Link
      href={href}
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
      <Icon className="relative z-10 h-4 w-4 shrink-0" />
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
}: {
  slug: string;
  empresaNombre: string;
  rol: Rol;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const reducirMovimiento = useReducedMotion();
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  const [colapsado, setColapsado] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(CLAVE_SESION) === "1",
  );

  // Evita el mismatch de hidratación: resolvedTheme es undefined en el
  // primer render del servidor/cliente hasta que next-themes lee la cookie.
  // Patrón oficial de next-themes para toggles de tema.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);

  function alternarColapso() {
    setColapsado((prev) => {
      const siguiente = !prev;
      sessionStorage.setItem(CLAVE_SESION, siguiente ? "1" : "0");
      return siguiente;
    });
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const esOscuro = montado && resolvedTheme === "dark";

  return (
    <motion.aside
      animate={{ width: colapsado ? 72 : 240 }}
      transition={{ duration: reducirMovimiento ? 0 : 0.22, ease: "easeOut" }}
      className="bg-sidebar flex h-full shrink-0 select-none flex-col border-r border-sidebar-border text-sidebar-foreground print:hidden"
    >
      <div className={`flex items-center gap-2 px-4 py-5 ${colapsado ? "justify-center px-0" : "justify-between"}`}>
        {!colapsado && (
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-foreground">
              TalentiX <span className="text-primary">RD</span>
              <sup className="ml-0.5 text-[10px] text-muted-foreground">™</sup>
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{empresaNombre}</p>
          </div>
        )}
        <button
          onClick={alternarColapso}
          aria-label={colapsado ? "Expandir menú" : "Colapsar menú"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          {colapsado ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-6 px-3">
        {GRUPOS.map((grupo, idx) => {
          const items = grupo.items.filter(
            (item) => !item.rolesPermitidos || item.rolesPermitidos.includes(rol),
          );
          if (items.length === 0) return null;
          return (
            <div key={grupo.titulo}>
              {!colapsado ? (
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
                      activo={activo}
                      colapsado={colapsado}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
        <ItemNav href="/docs" label="Documentación" Icon={BookOpen} activo={false} colapsado={colapsado} />
        <button
          onClick={() => setTheme(esOscuro ? "light" : "dark")}
          aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className={`group relative flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground ${
            colapsado ? "justify-center px-0" : "px-3"
          }`}
        >
          {esOscuro ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!colapsado && <span className="truncate">{esOscuro ? "Modo claro" : "Modo oscuro"}</span>}
          {colapsado && (
            <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
              {esOscuro ? "Modo claro" : "Modo oscuro"}
            </span>
          )}
        </button>
        <button
          onClick={handleLogout}
          className={`group relative flex w-full items-center gap-2.5 rounded-md py-2 text-left text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground ${
            colapsado ? "justify-center px-0" : "px-3"
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!colapsado && <span className="truncate">Cerrar sesión</span>}
          {colapsado && (
            <span className="pointer-events-none absolute left-full z-20 ml-2 -translate-x-1 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-elegant transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
              Cerrar sesión
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
