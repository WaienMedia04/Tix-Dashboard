import { CalendarDays } from "lucide-react";
import type { PizarraEventoProximo } from "@/lib/api";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "long" });
}

export function WidgetEventosProximos({
  eventos,
  tema,
}: {
  eventos: PizarraEventoProximo[];
  tema: TemaWidgets;
}) {
  if (eventos.length === 0) return null;
  const estilo = estiloWidget(tema, "cielo");

  return (
    <div className={`rounded-xl border p-3.5 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <CalendarDays className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Eventos próximos</span>
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
