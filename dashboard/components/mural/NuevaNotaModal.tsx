"use client";

import { useEffect, useState } from "react";
import { Send, StickyNote } from "lucide-react";
import {
  type MuralDirectorioItem,
  type NotaMural,
  crearNotaMural,
  enviarNotaAMural,
  fetchMuralDirectorio,
} from "@/lib/api";
import { Modal } from "@/components/Modal";

const COLORES_ALEATORIOS = ["amarillo", "rosa", "celeste", "verde", "lila", "naranja", "menta", "gris"];
const PARA_MI = "mio";

export function NuevaNotaModal({
  open,
  slug,
  miTalentoId,
  onClose,
  onCreada,
}: {
  open: boolean;
  slug: string;
  miTalentoId: string;
  onClose: () => void;
  /** Solo se llama cuando la nota va al mural propio — las enviadas a otros no tocan el lienzo actual. */
  onCreada: (nota: NotaMural) => void;
}) {
  const [destino, setDestino] = useState(PARA_MI);
  const [companeros, setCompaneros] = useState<MuralDirectorioItem[] | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviadoAOtro, setEnviadoAOtro] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDestino(PARA_MI);
    setTexto("");
    setError(null);
    setEnviadoAOtro(false);
    let cancelado = false;
    fetchMuralDirectorio(slug)
      .then((data) => {
        if (!cancelado) setCompaneros(data.filter((c) => c.id !== miTalentoId));
      })
      .catch(() => {
        if (!cancelado) setCompaneros([]);
      });
    return () => {
      cancelado = true;
    };
  }, [open, slug, miTalentoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setError(null);
    setEnviando(true);
    const color = COLORES_ALEATORIOS[Math.floor(Math.random() * COLORES_ALEATORIOS.length)];
    const posX = 10 + Math.random() * 70;
    const posY = 30 + Math.random() * 55;
    try {
      if (destino === PARA_MI) {
        const nota = await crearNotaMural({ texto: texto.trim(), color, posX, posY });
        onCreada(nota);
        onClose();
      } else {
        await enviarNotaAMural(slug, destino, { texto: texto.trim(), color, posX, posY });
        setEnviadoAOtro(true);
      }
    } catch {
      setError("No se pudo enviar la nota. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const nombreDestino = companeros?.find((c) => c.id === destino)?.nombreCompleto;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva nota"
      description="Escribe una nota para tu mural o para un compañero."
    >
      {enviadoAOtro ? (
        <div className="space-y-3">
          <p className="text-sm text-success">¡Nota enviada{nombreDestino ? ` a ${nombreDestino}` : ""}!</p>
          <button
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              ¿Para quién?
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value={PARA_MI}>Mi mural</option>
              {companeros && companeros.length > 0 && (
                <optgroup label="Enviar a un compañero">
                  {companeros.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreCompleto}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Nota</label>
            <textarea
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={280}
              rows={4}
              placeholder={destino === PARA_MI ? "Escribe algo aquí..." : "Escribe un mensaje para tu compañero..."}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {destino === PARA_MI ? (
                <StickyNote className="h-3.5 w-3.5" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {enviando ? "Enviando..." : destino === PARA_MI ? "Agregar nota" : "Enviar nota"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
