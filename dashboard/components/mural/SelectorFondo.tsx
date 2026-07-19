"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { actualizarPerfilMural } from "@/lib/api";
import { FONDOS_MURAL } from "@/lib/mural-fondos";

export function SelectorFondo({
  fondoId,
  onCambiado,
}: {
  fondoId: string;
  onCambiado: (fondoId: string) => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);

  async function elegir(id: string) {
    if (id === fondoId) return;
    setGuardando(id);
    try {
      await actualizarPerfilMural({ fondoId: id });
      onCambiado(id);
    } catch {
      // sin cambios visibles si falla — el swatch simplemente no cambia
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Palette className="h-4 w-4" />
        </span>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Fondo del mural</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {FONDOS_MURAL.map((f) => (
          <button
            key={f.id}
            onClick={() => void elegir(f.id)}
            disabled={guardando !== null}
            title={f.label}
            aria-label={f.label}
            className="relative h-9 w-9 shrink-0 rounded-full border-2 transition-transform disabled:cursor-not-allowed"
            style={{
              background: f.css,
              borderColor: fondoId === f.id ? "var(--primary)" : "transparent",
              transform: guardando === f.id ? "scale(0.9)" : undefined,
            }}
          >
            {fondoId === f.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-white drop-shadow" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
