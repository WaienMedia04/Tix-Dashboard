"use client";

import { useState } from "react";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { type TipoSoporte, crearSolicitudSoporte } from "@/lib/api";
import { usePanel } from "./PanelContext";
import { Modal } from "@/components/Modal";

const TIPOS: { valor: TipoSoporte; label: string; icon: typeof AlertTriangle }[] = [
  { valor: "AVERIA", label: "Reportar una avería", icon: AlertTriangle },
  { valor: "SUGERENCIA", label: "Dar una sugerencia", icon: Lightbulb },
];

export function SoporteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { slug } = usePanel();
  const [tipo, setTipo] = useState<TipoSoporte>("AVERIA");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  function cerrar() {
    onClose();
    // Se limpia después de la animación de cierre, no de inmediato.
    setTimeout(() => {
      setTipo("AVERIA");
      setMensaje("");
      setError(null);
      setEnviado(false);
    }, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      await crearSolicitudSoporte(slug, { tipo, mensaje: mensaje.trim() });
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal open={open} onClose={cerrar} title="Contactar a soporte" description="Le llega directo al equipo de Talentix.">
      {enviado ? (
        <div className="space-y-3">
          <p className="text-sm text-success">¡Recibido! El equipo de Talentix ya puede verlo.</p>
          <button onClick={cerrar} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
            Cerrar
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Motivo</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => setTipo(t.valor)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    tipo === t.valor
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Mensaje</label>
            <textarea
              autoFocus
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder={
                tipo === "AVERIA"
                  ? "Cuéntanos qué pasó — mientras más detalle, mejor."
                  : "Cuéntanos tu idea para mejorar la plataforma."
              }
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={enviando || !mensaje.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>
            <button
              type="button"
              onClick={cerrar}
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
