"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { type PerfilMural, actualizarPerfilMural } from "@/lib/api";
import { ESTADOS_MURAL_PRESETS } from "@/lib/estados-mural";
import { Modal } from "@/components/Modal";

export function EstadoModal({
  open,
  estadoActual,
  onClose,
  onActualizado,
}: {
  open: boolean;
  estadoActual: string | null;
  onClose: () => void;
  onActualizado: (perfil: PerfilMural) => void;
}) {
  const [texto, setTexto] = useState(estadoActual ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTexto(estadoActual ?? "");
    setError(null);
  }, [open, estadoActual]);

  async function guardar(estado: string) {
    setError(null);
    setGuardando(true);
    try {
      const actualizado = await actualizarPerfilMural({ estado });
      onActualizado(actualizado);
      onClose();
    } catch {
      setError("No se pudo guardar tu estado. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tu estado" description="Cuéntale al equipo cómo estás ahorita.">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {ESTADOS_MURAL_PRESETS.map((preset) => (
            <button
              key={preset.texto}
              type="button"
              disabled={guardando}
              onClick={() => void guardar(preset.texto)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                estadoActual === preset.texto
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:bg-accent"
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: preset.color }} />
              {preset.texto}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (texto.trim()) void guardar(texto.trim());
          }}
          className="flex flex-col gap-1.5"
        >
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            O escribe el tuyo
          </label>
          <div className="flex items-center gap-2">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ej. Revisando reportes"
              maxLength={40}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={guardando || !texto.trim()}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </form>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {estadoActual && (
          <button
            type="button"
            disabled={guardando}
            onClick={() => void guardar("")}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Quitar estado
          </button>
        )}
      </div>
    </Modal>
  );
}
