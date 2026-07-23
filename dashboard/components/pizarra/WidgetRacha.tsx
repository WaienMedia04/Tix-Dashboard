import { Flame } from "lucide-react";
import type { PizarraRachaPropia } from "@/lib/api";

/** Racha propia del usuario logueado — no cambia según de quién sea el mural que se esté viendo. */
export function WidgetRacha({ racha }: { racha: PizarraRachaPropia | null }) {
  if (racha === null) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <Flame className="h-3.5 w-3.5 text-orange-500" />
        Racha actual
      </div>
      <p className="font-display mt-1.5 text-2xl font-bold text-zinc-900">
        {racha.actual} {racha.actual === 1 ? "día" : "días"}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500">Mejor racha: {racha.mejor} días</p>
    </div>
  );
}
