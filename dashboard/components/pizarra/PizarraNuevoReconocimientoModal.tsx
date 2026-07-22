"use client";

import { useEffect, useState } from "react";
import {
  type MuralDirectorioItem,
  type PizarraReconocimientoActivo,
  crearPizarraReconocimiento,
  fetchMuralDirectorio,
} from "@/lib/api";
import { Modal } from "@/components/Modal";

const TITULOS_SUGERIDOS = ["Empleado del mes", "Empleado de la semana", "Proyecto destacado"];

export function PizarraNuevoReconocimientoModal({
  slug,
  open,
  onClose,
  onCreado,
}: {
  slug: string;
  open: boolean;
  onClose: () => void;
  onCreado: (r: PizarraReconocimientoActivo) => void;
}) {
  const [directorio, setDirectorio] = useState<MuralDirectorioItem[] | null>(null);
  const [talentoId, setTalentoId] = useState("");
  const [titulo, setTitulo] = useState(TITULOS_SUGERIDOS[0]);
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchMuralDirectorio(slug)
      .then(setDirectorio)
      .catch(() => setDirectorio([]));
  }, [open, slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!talentoId || !titulo.trim()) return;
    setError(null);
    setEnviando(true);
    try {
      const creado = await crearPizarraReconocimiento(slug, {
        talentoId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
      });
      onCreado(creado);
      setTalentoId("");
      setDescripcion("");
      onClose();
    } catch {
      setError("No se pudo publicar el reconocimiento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fijar reconocimiento"
      description="Se muestra arriba de la pizarra hasta que fijes otro."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Talento</label>
          <select
            value={talentoId}
            onChange={(e) => setTalentoId(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Elige a alguien…</option>
            {directorio?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombreCompleto}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            list="titulos-reconocimiento"
            maxLength={80}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <datalist id="titulos-reconocimiento">
            {TITULOS_SUGERIDOS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Motivo (opcional)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={280}
            rows={3}
            className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={!talentoId || !titulo.trim() || enviando}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? "Publicando…" : "Publicar"}
        </button>
      </form>
    </Modal>
  );
}
