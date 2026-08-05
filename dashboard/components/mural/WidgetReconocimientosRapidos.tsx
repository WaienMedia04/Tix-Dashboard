"use client";

import { useState } from "react";
import { type ReconocimientoRapidoMural, type TipoReconocimientoRapido, enviarReconocimientoRapido } from "@/lib/api";
import { CATALOGO_RECONOCIMIENTOS_RAPIDOS } from "@/lib/reconocimientos-rapidos";

function tiempoRelativo(iso: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return "ahora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

/**
 * Recibidos por este talento + (si se ve el mural de OTRO compañero) los
 * botones para mandarle uno rápido, sin texto libre y sin límite de envíos.
 */
export function WidgetReconocimientosRapidos({
  reconocimientos,
  slug,
  talentoId,
  onEnviado,
}: {
  reconocimientos: ReconocimientoRapidoMural[];
  slug: string;
  /** Id del talento cuyo mural se ve — solo se pasa cuando NO es el propio, para poder reconocerlo. */
  talentoId?: string;
  onEnviado?: (reconocimiento: ReconocimientoRapidoMural) => void;
}) {
  const [enviando, setEnviando] = useState<TipoReconocimientoRapido | null>(null);

  async function reconocer(tipo: TipoReconocimientoRapido) {
    if (!talentoId || enviando) return;
    setEnviando(tipo);
    try {
      const nuevo = await enviarReconocimientoRapido(slug, talentoId, tipo);
      onEnviado?.(nuevo);
    } catch {
      // el botón vuelve a estar disponible para reintentar
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div className="space-y-4">
      {talentoId && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Reconócelo/a</p>
          <div className="flex flex-wrap gap-2">
            {CATALOGO_RECONOCIMIENTOS_RAPIDOS.map((r) => (
              <button
                key={r.tipo}
                onClick={() => void reconocer(r.tipo)}
                disabled={enviando !== null}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{r.emoji}</span>
                {r.etiqueta}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Reconocimientos recibidos {reconocimientos.length > 0 && `(${reconocimientos.length})`}
        </p>
        {reconocimientos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Todavía no ha recibido ninguno.</p>
        ) : (
          <ul className="space-y-1.5">
            {reconocimientos.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-xs">
                <span className="text-base">{r.emoji}</span>
                <span className="flex-1 text-foreground">
                  <span className="font-medium">{r.etiqueta}</span> — de {r.remitenteNombre}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">{tiempoRelativo(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
