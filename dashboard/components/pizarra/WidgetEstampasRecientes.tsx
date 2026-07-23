import { Award } from "lucide-react";
import type { PizarraEstampaReciente } from "@/lib/api";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

export function WidgetEstampasRecientes({
  estampas,
  tema,
}: {
  estampas: PizarraEstampaReciente[];
  tema: TemaWidgets;
}) {
  const estilo = estiloWidget(tema, "fucsia");

  return (
    <div className={`rounded-xl border p-3.5 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Award className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Estampas recientes</span>
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
                {e.talento.nombreCompleto.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
