"use client";

import { X } from "lucide-react";
import type { BitacoraItem } from "@/lib/api";
import { EstadoBadge } from "@/components/EstadoBadge";

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{etiqueta}</p>
      <p className="mt-1 text-sm text-foreground">
        {valor === null || valor === "" ? <span className="text-muted-foreground">—</span> : valor}
      </p>
    </div>
  );
}

export function BitacoraDrawer({
  bitacora,
  onClose,
}: {
  bitacora: BitacoraItem | null;
  onClose: () => void;
}) {
  const abierto = bitacora !== null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card shadow-elegant transition-transform ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {bitacora && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">{bitacora.talento.nombreCompleto}</h2>
                <p className="text-sm text-muted-foreground">{bitacora.talento.rol}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <Campo
                  etiqueta="Fecha"
                  valor={new Date(bitacora.fecha).toLocaleDateString("es-DO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                />
                <Campo etiqueta="Día" valor={bitacora.dia} />
                <Campo etiqueta="Semana" valor={bitacora.semana} />
                <Campo etiqueta="Hora de envío" valor={bitacora.horaEnvio} />
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Estado</p>
                <div className="mt-1">
                  <EstadoBadge estado={bitacora.estadoEnvio} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Campo
                  etiqueta="Puntaje IA"
                  valor={bitacora.puntajeIA === null ? null : `${bitacora.puntajeIA} / 10`}
                />
                <Campo etiqueta="Calificación CEO" valor={bitacora.calificacionCeo} />
              </div>

              <Campo etiqueta="Actividades realizadas" valor={bitacora.actividadesRealizadas} />
              <Campo etiqueta="Capacitación" valor={bitacora.capacitacion} />
              <Campo etiqueta="Qué se ejecutó" valor={bitacora.queSeEjecuto} />
              <Campo etiqueta="Detalles relevantes" valor={bitacora.detallesRelevantes} />
              <Campo etiqueta="Informe de avances" valor={bitacora.informeAvances} />
              <Campo etiqueta="Objetivo del día" valor={bitacora.objetivoDia} />
              <Campo etiqueta="Notas TIX" valor={bitacora.notasTix} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
