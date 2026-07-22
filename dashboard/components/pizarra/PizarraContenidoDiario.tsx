"use client";

import { HelpCircle, Quote } from "lucide-react";
import { type PizarraContenidoDiario } from "@/lib/api";

export function PizarraContenidoDiarioBanner({
  contenido,
  onResponder,
}: {
  contenido: PizarraContenidoDiario | null;
  onResponder: (pregunta: string) => void;
}) {
  if (!contenido) return null;

  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-start gap-1.5 text-sm text-zinc-900">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-semibold">Pregunta del día: </span>
            {contenido.pregunta}
          </span>
        </p>
        <button
          onClick={() => onResponder(contenido.pregunta)}
          className="shrink-0 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Responder
        </button>
      </div>
      <p className="flex items-start gap-1.5 text-xs text-zinc-500 italic">
        <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {contenido.frase}
      </p>
    </div>
  );
}
