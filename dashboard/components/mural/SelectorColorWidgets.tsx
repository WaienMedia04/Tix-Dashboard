"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { actualizarPerfilMural } from "@/lib/api";

const OPCIONES: { id: string; label: string; descripcion: string; muestra: string[] }[] = [
  {
    id: "vibrante",
    label: "Vibrante",
    descripcion: "Cada tarjeta con su propio color",
    muestra: ["#fed7aa", "#fde68a", "#fecdd3", "#bae6fd"],
  },
  {
    id: "solido",
    label: "Sólido",
    descripcion: "Todas las tarjetas en gris",
    muestra: ["#e4e4e7", "#e4e4e7", "#e4e4e7", "#e4e4e7"],
  },
];

export function SelectorColorWidgets({
  colorWidgetsId,
  onCambiado,
}: {
  colorWidgetsId: string;
  onCambiado: (colorWidgetsId: string) => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);

  async function elegir(id: string) {
    if (id === colorWidgetsId) return;
    setGuardando(id);
    try {
      await actualizarPerfilMural({ colorWidgetsId: id });
      onCambiado(id);
    } catch {
      // sin cambios visibles si falla — la opción simplemente no cambia
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {OPCIONES.map((o) => {
        const activo = colorWidgetsId === o.id;
        return (
          <button
            key={o.id}
            onClick={() => void elegir(o.id)}
            disabled={guardando !== null}
            className={`flex w-36 flex-col gap-2 rounded-lg border-2 p-2.5 text-left transition-transform disabled:cursor-not-allowed ${
              activo ? "border-primary" : "border-border"
            }`}
            style={{ transform: guardando === o.id ? "scale(0.96)" : undefined }}
          >
            <div className="flex gap-1">
              {o.muestra.map((color, i) => (
                <span key={i} className="h-4 w-4 rounded-full" style={{ background: color }} />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-foreground">{o.label}</span>
              {activo && <Check className="h-3 w-3 text-primary" />}
            </div>
            <p className="text-[11px] text-muted-foreground">{o.descripcion}</p>
          </button>
        );
      })}
    </div>
  );
}
