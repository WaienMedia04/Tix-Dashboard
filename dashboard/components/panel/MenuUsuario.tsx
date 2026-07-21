"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { usePanel } from "./PanelContext";
import { Avatar } from "@/components/Avatar";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Rol } from "@/lib/api";

const ROL_LABEL: Record<Rol, string> = {
  CEO: "CEO",
  RRHH: "RRHH",
  MANAGER: "Gerente",
  TALENTO: "Empleado",
};

export function MenuUsuario() {
  const router = useRouter();
  const { usuarioNombre, usuarioEmail, usuarioFotoUrl, rol } = usePanel();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickFuera);
      document.removeEventListener("keydown", onEscape);
    };
  }, [abierto]);

  async function handleLogout() {
    setCerrandoSesion(true);
    await getSupabaseBrowserClient().auth.signOut();
    router.push("/");
  }

  return (
    <div ref={contenedorRef} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Menú de usuario"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
      >
        <Avatar nombreCompleto={usuarioNombre} fotoUrl={usuarioFotoUrl} size="sm" />
      </button>

      {abierto && (
        <div className="absolute top-full right-0 z-20 mt-2 w-64 max-w-[90vw] overflow-hidden rounded-md border border-border bg-popover shadow-elegant">
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-3">
            <Avatar nombreCompleto={usuarioNombre} fotoUrl={usuarioFotoUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{usuarioNombre}</p>
              <p className="truncate text-xs text-muted-foreground">{usuarioEmail}</p>
            </div>
          </div>
          <div className="px-3 py-2">
            <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {ROL_LABEL[rol]}
            </span>
          </div>
          <button
            onClick={() => void handleLogout()}
            disabled={cerrandoSesion}
            className="flex w-full items-center gap-2.5 border-t border-border px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-400" />
            {cerrandoSesion ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}
