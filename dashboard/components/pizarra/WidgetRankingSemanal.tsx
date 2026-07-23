import { Trophy } from "lucide-react";
import type { PizarraRankingSemanalItem } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

export function WidgetRankingSemanal({
  ranking,
  tema,
}: {
  ranking: PizarraRankingSemanalItem[];
  tema: TemaWidgets;
}) {
  const estilo = estiloWidget(tema, "amarillo");

  return (
    <div className={`rounded-xl border p-3.5 sm:col-span-2 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Trophy className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Ranking semanal</span>
      </div>
      {ranking.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-500">Todavía no hay suficientes bitácoras esta semana.</p>
      ) : (
        <div className="mt-2 space-y-1.5">
          {ranking.map((t, i) => (
            <div key={t.talentoId} className="flex items-center gap-2 text-sm">
              <span className="w-4 shrink-0 text-xs text-zinc-500">{i + 1}.</span>
              <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="sm" />
              <span className="min-w-0 flex-1 truncate text-zinc-900">{t.nombreCompleto}</span>
              <span className="shrink-0 text-xs font-medium text-zinc-500">{t.puntaje.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
