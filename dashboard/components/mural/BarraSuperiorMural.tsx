"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { MenuEscritorio } from "./MenuEscritorio";
import { RelojBarra } from "./RelojBarra";
import { CampanaNotificaciones } from "@/components/notificaciones/CampanaNotificaciones";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- solo se sabe el tema real del lado del cliente
  useEffect(() => setMontado(true), []);
  const esOscuro = montado && resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {esOscuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

/**
 * Barra superior delgada tipo escritorio (Windows/macOS) — menú a la
 * izquierda, reloj+fecha y accesos rápidos a la derecha. Compartida entre
 * el mural propio y el de un compañero.
 */
export function BarraSuperiorMural({
  slug,
  volver,
  volverLabel,
  nombre,
  fotoUrl,
  volverAMiMural,
}: {
  slug: string;
  volver: string;
  volverLabel: string;
  nombre: string;
  fotoUrl: string | null;
  /** Solo se pasa al ver el mural de OTRO talento — enlace de vuelta al propio. */
  volverAMiMural?: string;
}) {
  return (
    <header className="pt-safe sticky top-0 z-30 flex h-10 items-center justify-between border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <div className="flex min-w-0 items-center gap-1.5">
        <MenuEscritorio volver={volver} volverLabel={volverLabel} nombre={nombre} fotoUrl={fotoUrl} />
        {volverAMiMural && (
          <Link
            href={volverAMiMural}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Mi mural</span>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <RelojBarra />
        <CampanaNotificaciones slug={slug} />
        <ThemeToggle />
      </div>
    </header>
  );
}
