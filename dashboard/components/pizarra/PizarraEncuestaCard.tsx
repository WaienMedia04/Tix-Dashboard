"use client";

import { useState } from "react";
import { BarChart3, Plus } from "lucide-react";
import { type PizarraEncuestaActiva, votarPizarraEncuesta } from "@/lib/api";

export function PizarraEncuestaCard({
  slug,
  encuesta,
  puedeCrear,
  onActualizada,
  onCrear,
}: {
  slug: string;
  encuesta: PizarraEncuestaActiva | null;
  puedeCrear: boolean;
  onActualizada: (e: PizarraEncuestaActiva) => void;
  onCrear: () => void;
}) {
  const [votando, setVotando] = useState(false);

  async function votar(opcionIndex: number) {
    if (!encuesta || votando) return;
    setVotando(true);
    try {
      const actualizada = await votarPizarraEncuesta(slug, encuesta.id, opcionIndex);
      onActualizada(actualizada);
    } catch {
      // el usuario puede reintentar
    } finally {
      setVotando(false);
    }
  }

  if (!encuesta && !puedeCrear) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
          <BarChart3 className="h-3.5 w-3.5" />
          Encuesta
        </div>
        {puedeCrear && (
          <button
            onClick={onCrear}
            className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
          >
            <Plus className="h-3 w-3" />
            Nueva
          </button>
        )}
      </div>

      {!encuesta ? (
        <p className="mt-2 text-xs text-zinc-500">Todavía no hay ninguna encuesta activa.</p>
      ) : (
        <div className="mt-2 space-y-1.5">
          <p className="text-sm font-medium text-zinc-900">{encuesta.pregunta}</p>
          {encuesta.opciones.map((opcion, i) => {
            const votos = encuesta.conteos[i] ?? 0;
            const pct = encuesta.total > 0 ? Math.round((votos / encuesta.total) * 100) : 0;
            const esMiVoto = encuesta.miVoto === i;
            return (
              <button
                key={i}
                onClick={() => void votar(i)}
                disabled={votando}
                className={`relative w-full overflow-hidden rounded-md border bg-white px-2.5 py-1.5 text-left text-xs transition-colors disabled:opacity-70 ${
                  esMiVoto ? "border-primary" : "border-zinc-200"
                }`}
              >
                <div className="absolute inset-y-0 left-0 bg-primary/15" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between gap-2">
                  <span className={esMiVoto ? "font-semibold text-primary" : "text-zinc-900"}>{opcion}</span>
                  <span className="shrink-0 text-[11px] text-zinc-500">
                    {pct}% ({votos})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
