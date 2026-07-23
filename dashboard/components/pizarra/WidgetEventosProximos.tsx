import { CalendarDays } from "lucide-react";
import type { PizarraEventoProximo } from "@/lib/api";

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "long" });
}

export function WidgetEventosProximos({ eventos }: { eventos: PizarraEventoProximo[] }) {
  if (eventos.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <CalendarDays className="h-3.5 w-3.5 text-sky-500" />
        Eventos próximos
      </div>
      <div className="mt-2 space-y-1.5">
        {eventos.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate text-zinc-900">{e.titulo}</span>
            <span className="shrink-0 text-xs text-zinc-500">{formatearFecha(e.fechaEvento)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
