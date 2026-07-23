"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, LogOut } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { BrandMark } from "@/components/BrandMark";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

/** Menú "estilo Windows/macOS" arriba a la izquierda — volver y cerrar sesión. */
export function MenuEscritorio({
  volver,
  volverLabel,
  nombre,
  fotoUrl,
}: {
  volver: string;
  volverLabel: string;
  nombre: string;
  fotoUrl: string | null;
}) {
  const router = useRouter();
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
        aria-label="Menú"
        className="flex h-8 items-center gap-2 rounded-md px-2 text-foreground transition-colors hover:bg-accent"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">
          <BrandMark />
        </span>
      </button>

      {abierto && (
        <div className="absolute top-full left-0 z-20 mt-2 w-64 max-w-[90vw] overflow-hidden rounded-md border border-border bg-popover shadow-elegant">
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-3">
            <Avatar nombreCompleto={nombre} fotoUrl={fotoUrl} size="sm" />
            <p className="truncate text-sm font-medium text-foreground">{nombre}</p>
          </div>
          <Link
            href={volver}
            onClick={() => setAbierto(false)}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
          >
            <LayoutGrid className="h-4 w-4 shrink-0 text-muted-foreground" />
            {volverLabel}
          </Link>
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
