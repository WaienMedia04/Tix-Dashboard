"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { type ResumenSemanal, fetchResumenSemanal } from "@/lib/api";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

const ESTADISTICAS: { clave: keyof ResumenSemanal; etiqueta: string; emoji: string }[] = [
  { clave: "bitacoras", etiqueta: "Bitácoras", emoji: "📝" },
  { clave: "xpGanada", etiqueta: "XP ganada", emoji: "✨" },
  { clave: "monedasGanadas", etiqueta: "Monedas", emoji: "🪙" },
  { clave: "reconocimientosRecibidos", etiqueta: "Reconocimientos", emoji: "🏆" },
  { clave: "ideasCompartidas", etiqueta: "Ideas compartidas", emoji: "💡" },
  { clave: "comentarios", etiqueta: "Comentarios", emoji: "💬" },
];

export function WidgetResumenSemanal({ tema }: { tema: TemaWidgets }) {
  const [resumen, setResumen] = useState<ResumenSemanal | null>(null);
  const estilo = estiloWidget(tema, "cielo");

  useEffect(() => {
    fetchResumenSemanal()
      .then(setResumen)
      .catch(() => {});
  }, []);

  if (resumen === null) return null;

  return (
    <div className={`rounded-xl border p-3.5 sm:col-span-2 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <CalendarCheck className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">
          Tu semana — Nivel {resumen.nivel} · {resumen.nombreNivel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ESTADISTICAS.map((e) => (
          <div key={e.clave} className="rounded-lg bg-white/60 p-2.5 text-center">
            <p className="text-lg">{e.emoji}</p>
            <p className="font-display text-lg font-bold text-zinc-900">{resumen[e.clave] as number}</p>
            <p className="text-[11px] text-zinc-500">{e.etiqueta}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Objetivos de la semana</p>
        {resumen.objetivos.map((o) => (
          <div key={o.id}>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-medium text-zinc-700">
                {o.etiqueta}
                {o.completado && (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 14 }}
                  >
                    ✅
                  </motion.span>
                )}
              </span>
              <span className="tabular-nums text-zinc-500">
                {o.actual}/{o.meta}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-200/70">
              <motion.div
                className={`h-full rounded-full ${o.completado ? "bg-emerald-500" : "bg-primary"}`}
                initial={false}
                animate={{ width: `${Math.min(100, Math.round((o.actual / o.meta) * 100))}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
