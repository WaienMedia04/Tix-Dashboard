"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { actualizarPerfilMural } from "@/lib/api";
import { COLORES_NOMBRE_MURAL } from "@/lib/mural-colores-nombre";

export function SelectorColorNombre({
  colorNombreId,
  onCambiado,
}: {
  colorNombreId: string;
  onCambiado: (colorNombreId: string) => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);

  async function elegir(id: string) {
    if (id === colorNombreId) return;
    setGuardando(id);
    try {
      await actualizarPerfilMural({ colorNombreId: id });
      onCambiado(id);
    } catch {
      // sin cambios visibles si falla — el swatch simplemente no cambia
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {COLORES_NOMBRE_MURAL.map((c) => (
        <button
          key={c.id}
          onClick={() => void elegir(c.id)}
          disabled={guardando !== null}
          title={c.label}
          aria-label={c.label}
          className="relative h-10 w-10 shrink-0 rounded-full border-2 transition-transform disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${c.colors.join(", ")})`,
            borderColor: colorNombreId === c.id ? "var(--primary)" : "transparent",
            transform: guardando === c.id ? "scale(0.9)" : undefined,
          }}
        >
          {colorNombreId === c.id && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Check className="h-4 w-4 text-white drop-shadow" />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
