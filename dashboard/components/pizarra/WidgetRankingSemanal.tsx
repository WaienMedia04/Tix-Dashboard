import { Trophy } from "lucide-react";
import type { PizarraRankingSemanalItem } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

export function WidgetRankingSemanal({ ranking }: { ranking: PizarraRankingSemanalItem[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 sm:col-span-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <Trophy className="h-3.5 w-3.5 text-yellow-500" />
        Ranking semanal
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
