"use client";

import { useState } from "react";
import { type TipoNovedad, crearNovedad } from "@/lib/api";
import { TIPOS_NOVEDAD } from "@/lib/novedades-tipos";
import { usePanel } from "./PanelContext";
import { Modal } from "@/components/Modal";

const CAMPO_CLASES =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

function hoyIso(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString().slice(0, 10);
}

export function NuevaNovedadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { slug, dashboardInicial } = usePanel();
  const talentos = dashboardInicial.rankingTalentos;
  const [talentoId, setTalentoId] = useState("");
  const [tipo, setTipo] = useState<TipoNovedad>("LOGRO");
  const [fecha, setFecha] = useState(hoyIso);
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  function limpiarYCerrar() {
    setTalentoId("");
    setTipo("LOGRO");
    setFecha(hoyIso());
    setDescripcion("");
    setError(null);
    setExito(false);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!talentoId || !descripcion.trim()) return;
    setEnviando(true);
    setError(null);
    crearNovedad(slug, { talentoId, tipo, fecha, descripcion: descripcion.trim() })
      .then(() => {
        setExito(true);
        setDescripcion("");
      })
      .catch(() => setError("No se pudo registrar la novedad."))
      .finally(() => setEnviando(false));
  }

  return (
    <Modal open={open} onClose={limpiarYCerrar} title="Registrar novedad" description="Queda visible en la sección Novedades de la empresa.">
      {exito ? (
        <div className="space-y-3">
          <p className="text-sm text-success">Novedad registrada.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExito(false)}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Registrar otra
            </button>
            <button
              onClick={limpiarYCerrar}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empleado</label>
            <select value={talentoId} onChange={(e) => setTalentoId(e.target.value)} className={CAMPO_CLASES} required>
              <option value="">Selecciona un empleado</option>
              {talentos.map((t) => (
                <option key={t.talentoId} value={t.talentoId}>
                  {t.nombreCompleto}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoNovedad)} className={CAMPO_CLASES}>
                {TIPOS_NOVEDAD.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={CAMPO_CLASES} required />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className={CAMPO_CLASES}
              placeholder="¿Qué pasó?"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={enviando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? "Guardando..." : "Guardar"}
            </button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </form>
      )}
    </Modal>
  );
}
