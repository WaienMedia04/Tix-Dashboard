"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import {
  type CategoriaTopGamificacion,
  type ItemTopGamificacion,
  type PeriodoTopGamificacion,
  fetchTopGamificacion,
} from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

const CATEGORIAS: { valor: CategoriaTopGamificacion; etiqueta: string; unidad: string }[] = [
  { valor: "xp", etiqueta: "XP", unidad: "XP" },
  { valor: "actividad", etiqueta: "Más activos", unidad: "acciones" },
  { valor: "bitacoras", etiqueta: "Bitácoras", unidad: "bitácoras" },
  { valor: "reconocimientos", etiqueta: "Reconocimientos", unidad: "reconoc." },
  { valor: "comentarios", etiqueta: "Comentarios", unidad: "comentarios" },
  { valor: "racha", etiqueta: "Racha", unidad: "días" },
];

const PERIODOS: { valor: PeriodoTopGamificacion; etiqueta: string }[] = [
  { valor: "semanal", etiqueta: "Semana" },
  { valor: "mensual", etiqueta: "Mes" },
  { valor: "historico", etiqueta: "Histórico" },
];

export function WidgetTopEmpresa({ slug, tema }: { slug: string; tema: TemaWidgets }) {
  const [categoria, setCategoria] = useState<CategoriaTopGamificacion>("xp");
  const [periodo, setPeriodo] = useState<PeriodoTopGamificacion>("semanal");
  const [items, setItems] = useState<ItemTopGamificacion[] | null>(null);
  const estilo = estiloWidget(tema, "amarillo");
  const unidad = CATEGORIAS.find((c) => c.valor === categoria)?.unidad ?? "";
  const deshabilitaPeriodo = categoria === "racha";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia el resultado anterior mientras carga la nueva categoría/período
    setItems(null);
    fetchTopGamificacion(slug, categoria, periodo)
      .then(setItems)
      .catch(() => setItems([]));
  }, [slug, categoria, periodo]);

  return (
    <div className={`rounded-xl border p-3.5 sm:col-span-2 ${estilo.card}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
            <Crown className={`h-3.5 w-3.5 ${estilo.icon}`} />
          </span>
          <span className="text-xs font-semibold text-zinc-500">Top de la empresa</span>
        </div>
        {!deshabilitaPeriodo && (
          <div className="flex gap-1">
            {PERIODOS.map((p) => (
              <button
                key={p.valor}
                onClick={() => setPeriodo(p.valor)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  periodo === p.valor ? "bg-primary text-white" : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {CATEGORIAS.map((c) => (
          <button
            key={c.valor}
            onClick={() => setCategoria(c.valor)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              categoria === c.valor
                ? "border-primary bg-primary text-white"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {c.etiqueta}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="mt-3 h-24 animate-pulse rounded-lg bg-zinc-100" />
      ) : items.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-500">Todavía no hay suficiente actividad en esta categoría.</p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {items.map((t, i) => (
            <div key={t.talentoId} className="flex items-center gap-2 text-sm">
              <span className="w-4 shrink-0 text-xs text-zinc-500">{i + 1}.</span>
              <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="sm" />
              <span className="min-w-0 flex-1 truncate text-zinc-900">{t.nombreCompleto}</span>
              <span className="shrink-0 text-xs font-medium text-zinc-500">
                {t.valor} {unidad}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
