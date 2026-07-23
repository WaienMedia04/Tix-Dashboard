import { Award } from "lucide-react";
import type { PizarraEstampaReciente } from "@/lib/api";
import { EnlaceTalento } from "@/components/EnlaceTalento";

export function WidgetEstampasRecientes({ estampas }: { estampas: PizarraEstampaReciente[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <Award className="h-3.5 w-3.5 text-fuchsia-500" />
        Estampas recientes
      </div>
      {estampas.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-500">Todavía no se han otorgado estampas.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {estampas.map((e) => (
            <div
              key={e.id}
              title={`${e.talento.nombreCompleto} — ${e.estampaNombre}`}
              className="flex flex-col items-center gap-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.estampaImagenUrl}
                alt={e.estampaNombre}
                className="h-9 w-9 rounded-full border border-zinc-200 bg-white object-contain p-0.5"
              />
              <span className="max-w-14 truncate text-[10px] text-zinc-500">
                <EnlaceTalento talentoId={e.talento.id}>{e.talento.nombreCompleto.split(" ")[0]}</EnlaceTalento>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
