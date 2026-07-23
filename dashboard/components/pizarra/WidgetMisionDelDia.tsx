import { Target } from "lucide-react";

export function WidgetMisionDelDia({ mision }: { mision: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <Target className="h-3.5 w-3.5 text-rose-500" />
        Misión del día
      </div>
      <p className="mt-1.5 text-sm font-medium text-zinc-900">{mision}</p>
    </div>
  );
}
