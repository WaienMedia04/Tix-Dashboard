import { Target } from "lucide-react";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

export function WidgetMisionDelDia({ mision, tema }: { mision: string; tema: TemaWidgets }) {
  const estilo = estiloWidget(tema, "rosa");

  return (
    <div className={`rounded-xl border p-3.5 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Target className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Misión del día</span>
      </div>
      <p className="mt-1.5 text-sm font-medium text-zinc-900">{mision}</p>
    </div>
  );
}
