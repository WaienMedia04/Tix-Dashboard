import { Flame } from "lucide-react";
import type { PizarraRachaPropia } from "@/lib/api";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

/** Racha propia del usuario logueado — no cambia según de quién sea el mural que se esté viendo. */
export function WidgetRacha({ racha, tema }: { racha: PizarraRachaPropia | null; tema: TemaWidgets }) {
  if (racha === null) return null;
  const estilo = estiloWidget(tema, "naranja");

  return (
    <div className={`rounded-xl border p-3.5 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Flame className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Racha actual</span>
      </div>
      <p className="font-display mt-1.5 text-2xl font-bold text-zinc-900">
        {racha.actual} {racha.actual === 1 ? "día" : "días"}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500">Mejor racha: {racha.mejor} días</p>
    </div>
  );
}
