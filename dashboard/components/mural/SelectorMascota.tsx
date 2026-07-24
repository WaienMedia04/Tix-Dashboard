"use client";

import { useState } from "react";
import { Check, Ban } from "lucide-react";
import { actualizarPerfilMural } from "@/lib/api";
import { MASCOTAS_MURAL } from "@/lib/mural-mascotas";

export function SelectorMascota({
  mascotaId,
  onCambiado,
}: {
  mascotaId: string | null;
  onCambiado: (mascotaId: string | null) => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);

  async function elegir(id: string | null) {
    if (id === mascotaId) return;
    setGuardando(id ?? "ninguna");
    try {
      await actualizarPerfilMural({ mascotaId: id });
      onCambiado(id);
    } catch {
      // sin cambios visibles si falla — la opción simplemente no cambia
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <button
        onClick={() => void elegir(null)}
        disabled={guardando !== null}
        className={`flex w-20 flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 text-center transition-transform disabled:cursor-not-allowed ${
          mascotaId === null ? "border-primary" : "border-border"
        }`}
        style={{ transform: guardando === "ninguna" ? "scale(0.96)" : undefined }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Ban className="h-4 w-4" />
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
          Ninguna
          {mascotaId === null && <Check className="h-3 w-3 text-primary" />}
        </span>
      </button>

      {MASCOTAS_MURAL.map((m) => {
        const activo = mascotaId === m.id;
        return (
          <button
            key={m.id}
            onClick={() => void elegir(m.id)}
            disabled={guardando !== null}
            className={`flex w-20 flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 text-center transition-transform disabled:cursor-not-allowed ${
              activo ? "border-primary" : "border-border"
            }`}
            style={{ transform: guardando === m.id ? "scale(0.96)" : undefined }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
              {m.label.charAt(0)}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
              {m.label}
              {activo && <Check className="h-3 w-3 text-primary" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
