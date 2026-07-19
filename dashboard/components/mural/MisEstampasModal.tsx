"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { type EstampaOtorgadaMural, actualizarPosicionEstampa, fetchMisEstampas } from "@/lib/api";
import { claseFormaEstampa } from "@/lib/estampa-forma";
import { Modal } from "@/components/Modal";

export function MisEstampasModal({
  open,
  onClose,
  onCambio,
}: {
  open: boolean;
  onClose: () => void;
  /** Se dispara cuando una estampa cambia de estado, para refrescar el lienzo del mural. */
  onCambio: (estampa: EstampaOtorgadaMural) => void;
}) {
  const [estampas, setEstampas] = useState<EstampaOtorgadaMural[] | null>(null);
  const [actualizando, setActualizando] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    fetchMisEstampas()
      .then((data) => {
        if (!cancelado) setEstampas(data);
      })
      .catch(() => {
        if (!cancelado) setEstampas([]);
      });
    return () => {
      cancelado = true;
    };
  }, [open]);

  async function alternar(estampa: EstampaOtorgadaMural) {
    setActualizando(estampa.id);
    try {
      const actualizada = await actualizarPosicionEstampa(estampa.id, { enMural: !estampa.enMural });
      setEstampas((prev) => prev?.map((e) => (e.id === estampa.id ? actualizada : e)) ?? prev);
      onCambio(actualizada);
    } catch {
      // sin cambios visibles si falla
    } finally {
      setActualizando(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Mis estampas" description="Elige cuáles se muestran en tu mural.">
      {estampas === null && <div className="h-24 animate-pulse rounded-md bg-muted" />}

      {estampas !== null && estampas.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">Todavía no te han regalado estampas.</p>
      )}

      {estampas !== null && estampas.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {estampas.map((e) => (
            <div key={e.id} className="flex flex-col items-center gap-1.5 rounded-md border border-border p-2.5 text-center">
              <div
                className={`h-16 w-16 overflow-hidden ${e.forma === "LIBRE" ? "" : "border border-border bg-muted"} ${claseFormaEstampa(e.forma)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.imagenUrl}
                  alt={e.nombre}
                  className={`h-full w-full ${e.forma === "LIBRE" ? "object-contain" : "object-cover"}`}
                />
              </div>
              <p className="line-clamp-1 text-xs font-medium text-foreground">{e.nombre}</p>
              <button
                onClick={() => void alternar(e)}
                disabled={actualizando === e.id}
                className={`inline-flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                  e.enMural
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {e.enMural ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {actualizando === e.id ? "..." : e.enMural ? "En el mural" : "Agregar al mural"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
