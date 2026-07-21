"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, LifeBuoy, LogOut, Moon, PenSquare, Settings, Sun } from "lucide-react";
import { usePanel } from "./PanelContext";
import { SoporteModal } from "./SoporteModal";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import Dock from "@/components/vendor/Dock/Dock";

/** Dock de accesos rápidos al fondo del panel — CEO, RRHH y Gerente. */
export function PanelDock() {
  const { slug, rol } = usePanel();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mostrarSoporte, setMostrarSoporte] = useState(false);
  const [montado, setMontado] = useState(false);
  // Patrón oficial de next-themes: evita el mismatch de hidratación.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);
  const esOscuro = montado && resolvedTheme === "dark";

  async function cerrarSesion() {
    await getSupabaseBrowserClient().auth.signOut();
    router.push("/");
  }

  const items = [
    {
      icon: <LayoutDashboard className="h-5 w-5 text-violet-400" />,
      label: "Dashboard",
      onClick: () => router.push(`/${slug}/dashboard`),
    },
    ...(rol === "CEO" || rol === "RRHH"
      ? [
          {
            icon: <Settings className="h-5 w-5 text-slate-400" />,
            label: "Configuración",
            onClick: () => router.push(`/${slug}/configuracion`),
          },
        ]
      : []),
    {
      icon: <PenSquare className="h-5 w-5 text-fuchsia-400" />,
      label: "Mi Mural",
      onClick: () => router.push(`/${slug}/mi-mural`),
    },
    {
      icon: <LifeBuoy className="h-5 w-5 text-emerald-400" />,
      label: "Soporte",
      onClick: () => setMostrarSoporte(true),
    },
    {
      icon: esOscuro ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />,
      label: esOscuro ? "Modo claro" : "Modo oscuro",
      onClick: () => setTheme(esOscuro ? "light" : "dark"),
    },
    {
      icon: <LogOut className="h-5 w-5 text-red-400" />,
      label: "Cerrar sesión",
      onClick: () => void cerrarSesion(),
    },
  ];

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40 print:hidden">
        <Dock items={items} className="pointer-events-auto" panelHeight={64} baseItemSize={46} magnification={62} />
      </div>
      <SoporteModal open={mostrarSoporte} onClose={() => setMostrarSoporte(false)} />
    </>
  );
}
