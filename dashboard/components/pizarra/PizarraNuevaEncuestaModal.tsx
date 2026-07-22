"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { type PizarraEncuestaActiva, crearPizarraEncuesta } from "@/lib/api";
import { Modal } from "@/components/Modal";

export function PizarraNuevaEncuestaModal({
  slug,
  open,
  onClose,
  onCreada,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
  onCreada: (e: PizarraEncuestaActiva) => void;
}) {
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState(["", ""]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizarOpcion(i: number, valor: string) {
    setOpciones((prev) => prev.map((o, idx) => (idx === i ? valor : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const limpias = opciones.map((o) => o.trim()).filter(Boolean);
    if (!pregunta.trim() || limpias.length < 2) {
      setError("Escribe la pregunta y al menos 2 opciones.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const creada = await crearPizarraEncuesta(slug, { pregunta: pregunta.trim(), opciones: limpias });
      onCreada(creada);
      setPregunta("");
      setOpciones(["", ""]);
      onClose();
    } catch {
      setError("No se pudo crear la encuesta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva encuesta"
      description="Reemplaza a la anterior como la encuesta activa de la pizarra."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Pregunta</label>
          <input
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            maxLength={200}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Opciones</label>
          {opciones.map((o, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={o}
                onChange={(e) => actualizarOpcion(i, e.target.value)}
                placeholder={`Opción ${i + 1}`}
                maxLength={80}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {opciones.length > 2 && (
                <button
                  type="button"
                  onClick={() => setOpciones((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Quitar opción"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {opciones.length < 6 && (
            <button
              type="button"
              onClick={() => setOpciones((prev) => [...prev, ""])}
              className="inline-flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar opción
            </button>
          )}
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Publicando…" : "Publicar encuesta"}
        </button>
      </form>
    </Modal>
  );
}
