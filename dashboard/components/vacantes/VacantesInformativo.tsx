"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { type VacanteItem, fetchVacantes } from "@/lib/api";

const INTERVALO_POLLING_MS = 60_000;

function TarjetaVacante({ item }: { item: VacanteItem }) {
  const [expandido, setExpandido] = useState(false);
  const esLarga = item.descripcion.length > 220;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-600">
          <Briefcase className="h-3 w-3" />
          Vacante
        </span>
        {item.departamento && <span className="text-[11px] text-zinc-400">{item.departamento}</span>}
      </div>
      <p className="mt-2 text-sm font-semibold text-zinc-900">{item.titulo}</p>
      <p className={`mt-1 text-sm whitespace-pre-wrap text-zinc-700 ${expandido ? "" : "line-clamp-3"}`}>{item.descripcion}</p>
      {esLarga && (
        <button onClick={() => setExpandido((v) => !v)} className="mt-1 text-xs font-medium text-primary hover:underline">
          {expandido ? "Ver menos" : "Leer más"}
        </button>
      )}
    </div>
  );
}

/** Vacantes abiertas de solo lectura — visibles junto al Mural informativo para toda la empresa. */
export function VacantesInformativo({ slug }: { slug: string }) {
  const [items, setItems] = useState<VacanteItem[] | null>(null);

  useEffect(() => {
    let cancelado = false;
    function cargar() {
      fetchVacantes(slug)
        .then((data) => {
          if (!cancelado) setItems(data.filter((v) => v.estado === "ABIERTA"));
        })
        .catch(() => {
          if (!cancelado) setItems((prev) => prev ?? []);
        });
    }
    cargar();
    const id = setInterval(cargar, INTERVALO_POLLING_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [slug]);

  if (items !== null && items.length === 0) return null;

  return (
    <div className="w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 lg:max-w-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 sm:px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
          <Briefcase className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-zinc-900">Vacantes abiertas</h2>
          <p className="text-xs text-zinc-500">Oportunidades disponibles dentro de la empresa</p>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {items === null && <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />}
        {items?.map((item) => (
          <TarjetaVacante key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
