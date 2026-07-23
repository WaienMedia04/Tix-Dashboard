"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { type ActualizarBitacoraDatos, type BitacoraItem, type WorklogReciente, actualizarBitacora } from "@/lib/api";
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

const ESTADOS_EDITABLES = ["✅ Enviada", "❌ No enviada", "⏳ Pendiente"];

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

const CAMPO_CLASES =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring";

function CampoEditable({
  etiqueta,
  valor,
  onChange,
  multilinea = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  multilinea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{etiqueta}</span>
      {multilinea ? (
        <textarea value={valor} onChange={(e) => onChange(e.target.value)} rows={3} className={CAMPO_CLASES} />
      ) : (
        <input value={valor} onChange={(e) => onChange(e.target.value)} className={CAMPO_CLASES} />
      )}
    </label>
  );
}

interface FormValores {
  tareasPlanificadas: string;
  actividadesRealizadas: string;
  capacitacion: string;
  queSeEjecuto: string;
  detallesRelevantes: string;
  informeAvances: string;
  objetivoDia: string;
  notasTix: string;
  calificacionCeo: string;
  estadoEnvio: string;
  puntajeIA: string;
  cumplimientoTareas: string;
}

function valoresDesde(detalle: WorklogDetalle): FormValores {
  return {
    tareasPlanificadas: detalle.tareasPlanificadas ?? "",
    actividadesRealizadas: detalle.actividadesRealizadas ?? "",
    capacitacion: detalle.capacitacion ?? "",
    queSeEjecuto: detalle.queSeEjecuto ?? "",
    detallesRelevantes: detalle.detallesRelevantes ?? "",
    informeAvances: detalle.informeAvances ?? "",
    objetivoDia: detalle.objetivoDia ?? "",
    notasTix: detalle.notasTix ?? "",
    calificacionCeo: detalle.calificacionCeo ?? "",
    estadoEnvio: detalle.estadoEnvio,
    puntajeIA: detalle.puntajeIA === null ? "" : String(detalle.puntajeIA),
    cumplimientoTareas: detalle.cumplimientoTareas === null ? "" : String(detalle.cumplimientoTareas),
  };
}

export function WorklogDetalleModal({
  detalle,
  onClose,
  slug,
  puedeEditar = false,
  onActualizado,
}: {
  detalle: WorklogDetalle | null;
  onClose: () => void;
  /** Requeridos para habilitar edición — sin ellos el modal queda solo-lectura. */
  slug?: string;
  puedeEditar?: boolean;
  onActualizado?: (detalle: WorklogDetalle) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState<FormValores | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia el form al cambiar de bitácora seleccionada
    setEditando(false);
    setError(null);
    setValores(detalle ? valoresDesde(detalle) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reiniciar cuando cambia el id, no en cada cambio de referencia de `detalle`
  }, [detalle?.id]);

  async function guardar() {
    if (!detalle || !valores || !slug) return;
    setGuardando(true);
    setError(null);
    try {
      const datos: ActualizarBitacoraDatos = {
        tareasPlanificadas: valores.tareasPlanificadas,
        actividadesRealizadas: valores.actividadesRealizadas,
        capacitacion: valores.capacitacion,
        queSeEjecuto: valores.queSeEjecuto,
        detallesRelevantes: valores.detallesRelevantes,
        informeAvances: valores.informeAvances,
        objetivoDia: valores.objetivoDia,
        notasTix: valores.notasTix,
        calificacionCeo: valores.calificacionCeo,
        estadoEnvio: valores.estadoEnvio,
        puntajeIA: valores.puntajeIA === "" ? undefined : Number(valores.puntajeIA),
        cumplimientoTareas: valores.cumplimientoTareas === "" ? undefined : Number(valores.cumplimientoTareas),
      };
      const actualizado = await actualizarBitacora(slug, detalle.id, datos);
      const nuevoDetalle: WorklogDetalle = {
        ...detalle,
        ...actualizado,
        talentoNombre: detalle.talentoNombre,
        talentoRol: detalle.talentoRol,
        talentoId: detalle.talentoId,
      };
      onActualizado?.(nuevoDetalle);
      setEditando(false);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

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
      {detalle && valores && (
        <div className="space-y-5">
          {puedeEditar && slug && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {editando ? "Corrigiendo un error del agente de IA." : "Solo lectura."}
              </p>
              {editando ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(false);
                      setValores(valoresDesde(detalle));
                      setError(null);
                    }}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void guardar()}
                    disabled={guardando}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
              )}
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}

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
              {editando ? (
                <select
                  value={valores.estadoEnvio}
                  onChange={(e) => setValores((v) => (v ? { ...v, estadoEnvio: e.target.value } : v))}
                  className={`mt-1 ${CAMPO_CLASES}`}
                >
                  {ESTADOS_EDITABLES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1">
                  <EstadoBadge estado={detalle.estadoEnvio} />
                </div>
              )}
            </div>
          </div>

          {editando ? (
            <CampoEditable
              etiqueta="Tareas planificadas (check-in)"
              valor={valores.tareasPlanificadas}
              onChange={(v) => setValores((prev) => (prev ? { ...prev, tareasPlanificadas: v } : prev))}
              multilinea
            />
          ) : (
            <Campo etiqueta="Tareas planificadas (check-in)" valor={detalle.tareasPlanificadas} />
          )}

          <div className="grid grid-cols-2 gap-4">
            {editando ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Puntaje IA (0-10)
                </span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={valores.puntajeIA}
                  onChange={(e) => setValores((v) => (v ? { ...v, puntajeIA: e.target.value } : v))}
                  className={CAMPO_CLASES}
                />
              </label>
            ) : (
              <Campo etiqueta="Puntaje IA" valor={detalle.puntajeIA === null ? null : `${detalle.puntajeIA} / 10`} />
            )}
            {editando ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Cumplimiento de tareas (0-100)
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={valores.cumplimientoTareas}
                  onChange={(e) => setValores((v) => (v ? { ...v, cumplimientoTareas: e.target.value } : v))}
                  className={CAMPO_CLASES}
                />
              </label>
            ) : (
              <Campo
                etiqueta="Cumplimiento de tareas"
                valor={detalle.cumplimientoTareas === null ? null : `${detalle.cumplimientoTareas}%`}
              />
            )}
          </div>

          {editando ? (
            <CampoEditable
              etiqueta="Calificación CEO"
              valor={valores.calificacionCeo}
              onChange={(v) => setValores((prev) => (prev ? { ...prev, calificacionCeo: v } : prev))}
            />
          ) : (
            <Campo etiqueta="Calificación CEO" valor={detalle.calificacionCeo} />
          )}

          {(
            [
              ["actividadesRealizadas", "Actividades realizadas"],
              ["capacitacion", "Capacitación"],
              ["queSeEjecuto", "Qué se ejecutó"],
              ["detallesRelevantes", "Detalles relevantes"],
              ["informeAvances", "Informe de avances"],
              ["objetivoDia", "Objetivo del día"],
              ["notasTix", "Notas TIX"],
            ] as const
          ).map(([campo, etiqueta]) =>
            editando ? (
              <CampoEditable
                key={campo}
                etiqueta={etiqueta}
                valor={valores[campo]}
                onChange={(v) => setValores((prev) => (prev ? { ...prev, [campo]: v } : prev))}
                multilinea
              />
            ) : (
              <Campo key={campo} etiqueta={etiqueta} valor={detalle[campo]} />
            ),
          )}
        </div>
      )}
    </Modal>
  );
}
