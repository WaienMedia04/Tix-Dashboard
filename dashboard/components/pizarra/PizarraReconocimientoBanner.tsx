"use client";

import { Plus, Trophy } from "lucide-react";
import { type PizarraReconocimientoActivo } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

export function PizarraReconocimientoBanner({
  reconocimiento,
  puedeFijar,
  onFijar,
}: {
  reconocimiento: PizarraReconocimientoActivo | null;
  puedeFijar: boolean;
  onFijar: () => void;
}) {
  if (!reconocimiento && !puedeFijar) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 p-3">
      {reconocimiento ? (
        <>
          <Trophy className="h-5 w-5 shrink-0 text-gold" />
          <Avatar
            nombreCompleto={reconocimiento.talento.nombreCompleto}
            fotoUrl={reconocimiento.talento.fotoUrl}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900">
              {reconocimiento.titulo}: {reconocimiento.talento.nombreCompleto}
            </p>
            {reconocimiento.descripcion && (
              <p className="truncate text-xs text-zinc-600">{reconocimiento.descripcion}</p>
            )}
          </div>
        </>
      ) : (
        <p className="flex-1 text-xs text-zinc-500">Todavía no hay ningún reconocimiento fijado.</p>
      )}
      {puedeFijar && (
        <button
          onClick={onFijar}
          className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <Plus className="h-3 w-3" />
          {reconocimiento ? "Cambiar" : "Fijar"}
        </button>
      )}
    </div>
  );
}
