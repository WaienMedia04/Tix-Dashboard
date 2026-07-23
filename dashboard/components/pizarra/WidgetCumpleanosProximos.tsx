"use client";

import { useEffect, useState } from "react";
import { Cake } from "lucide-react";
import { type CumpleanosResponse, fetchCumpleanos } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { EnlaceTalento } from "@/components/EnlaceTalento";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function WidgetCumpleanosProximos({ slug }: { slug: string }) {
  const [datos, setDatos] = useState<CumpleanosResponse | null>(null);

  useEffect(() => {
    fetchCumpleanos(slug)
      .then(setDatos)
      .catch(() => setDatos(null));
  }, [slug]);

  if (!datos || (datos.hoy.length === 0 && datos.esteMes.length === 0)) return null;

  const proximos = datos.esteMes.slice(0, 3);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <Cake className="h-3.5 w-3.5 text-rose-500" />
        Cumpleaños
      </div>
      <div className="mt-2 space-y-1.5">
        {datos.hoy.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm">
            <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="sm" />
            <span className="min-w-0 flex-1 truncate text-zinc-900">
              <EnlaceTalento talentoId={t.id}>{t.nombreCompleto}</EnlaceTalento>
            </span>
            <span className="shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
              Hoy 🎂
            </span>
          </div>
        ))}
        {proximos.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm">
            <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="sm" />
            <span className="min-w-0 flex-1 truncate text-zinc-900">
              <EnlaceTalento talentoId={t.id}>{t.nombreCompleto}</EnlaceTalento>
            </span>
            <span className="shrink-0 text-xs text-zinc-500">
              {t.dia} de {MESES[new Date().getMonth()]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
