"use client";

import type { BitacoraItem, WorklogReciente } from "@/lib/api";
import { Modal } from "@/components/Modal";
import { EstadoBadge } from "@/components/EstadoBadge";
import { CheckinBadge } from "@/components/CheckinBadge";
import { EnlaceTalento } from "@/components/EnlaceTalento";
import { formatearHora12 } from "@/lib/formato-hora";

export interface WorklogDetalle {
  id: string;
  fecha: string;
  dia: string | null;
  semana: number | null;
  tareasPlanificadas: string | null;
  horaCheckin: string | null;
  checkinEnviado: boolean;
  cumplimientoTareas: number | null;
  estadoEnvio: string;
  horaEnvio: string | null;
  puntajeIA: number | null;
  calificacionCeo: string | null;
  actividadesRealizadas: string | null;
  capacitacion?: string | null;
  queSeEjecuto: string | null;
  detallesRelevantes: string | null;
  informeAvances: string | null;
  objetivoDia: string | null;
  notasTix: string | null;
  talentoNombre: string;
  talentoRol?: string;
  /** Solo disponible cuando el origen es un BitacoraItem — habilita el link a la ficha. */
  talentoId?: string;
}

export function bitacoraItemADetalle(item: BitacoraItem): WorklogDetalle {
  return {
    ...item,
    talentoNombre: item.talento.nombreCompleto,
    talentoRol: item.talento.rol,
    talentoId: item.talento.id,
  };
}

export function worklogRecienteADetalle(w: WorklogReciente): WorklogDetalle {
  return { ...w, talentoNombre: w.talento, capacitacion: undefined, dia: null, semana: null };
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{etiqueta}</p>
      <p className="mt-1 text-sm text-foreground">
        {valor === null || valor === undefined || valor === "" ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          valor
        )}
      </p>
    </div>
  );
}

export function WorklogDetalleModal({
  detalle,
  onClose,
}: {
  detalle: WorklogDetalle | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={detalle !== null}
      onClose={onClose}
      title={
        detalle?.talentoId ? (
          <EnlaceTalento talentoId={detalle.talentoId}>{detalle.talentoNombre}</EnlaceTalento>
        ) : (
          (detalle?.talentoNombre ?? "")
        )
      }
      description={detalle?.talentoRol}
      size="lg"
    >
      {detalle && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Campo
              etiqueta="Fecha"
              valor={new Date(detalle.fecha).toLocaleDateString("es-DO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            />
            <Campo etiqueta="Día" valor={detalle.dia} />
            <Campo etiqueta="Semana" valor={detalle.semana} />
            <Campo etiqueta="Hora de envío" valor={formatearHora12(detalle.horaEnvio)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Check-in</p>
              <div className="mt-1">
                <CheckinBadge checkinEnviado={detalle.checkinEnviado} horaCheckin={detalle.horaCheckin} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Estado (check-out)
              </p>
              <div className="mt-1">
                <EstadoBadge estado={detalle.estadoEnvio} />
              </div>
            </div>
          </div>

          <Campo etiqueta="Tareas planificadas (check-in)" valor={detalle.tareasPlanificadas} />

          <div className="grid grid-cols-2 gap-4">
            <Campo etiqueta="Puntaje IA" valor={detalle.puntajeIA === null ? null : `${detalle.puntajeIA} / 10`} />
            <Campo
              etiqueta="Cumplimiento de tareas"
              valor={detalle.cumplimientoTareas === null ? null : `${detalle.cumplimientoTareas}%`}
            />
          </div>
          <Campo etiqueta="Calificación CEO" valor={detalle.calificacionCeo} />

          <Campo etiqueta="Actividades realizadas" valor={detalle.actividadesRealizadas} />
          <Campo etiqueta="Capacitación" valor={detalle.capacitacion} />
          <Campo etiqueta="Qué se ejecutó" valor={detalle.queSeEjecuto} />
          <Campo etiqueta="Detalles relevantes" valor={detalle.detallesRelevantes} />
          <Campo etiqueta="Informe de avances" valor={detalle.informeAvances} />
          <Campo etiqueta="Objetivo del día" valor={detalle.objetivoDia} />
          <Campo etiqueta="Notas TIX" valor={detalle.notasTix} />
        </div>
      )}
    </Modal>
  );
}
