"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coins, Sparkles } from "lucide-react";
import type { PizarraProgresoPropio } from "@/lib/api";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

/** Motor de progreso del talento: nivel, barra de XP y monedas. `xpGanada` (si no es null) dispara la animación de "+N XP" tras detectar un aumento entre pollings del panel. */
export function WidgetProgreso({
  progreso,
  tema,
  xpGanada,
}: {
  progreso: PizarraProgresoPropio | null;
  tema: TemaWidgets;
  xpGanada: number | null;
}) {
  if (progreso === null) return null;
  const estilo = estiloWidget(tema, "violeta");

  return (
    <div className={`relative overflow-visible rounded-xl border p-3.5 ${estilo.card}`}>
      <AnimatePresence>
        {xpGanada !== null && xpGanada > 0 && (
          <motion.span
            key={xpGanada}
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -14, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute -top-2 right-3 rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
          >
            +{xpGanada} XP
          </motion.span>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
            <Sparkles className={`h-3.5 w-3.5 ${estilo.icon}`} />
          </span>
          <p className="text-xs font-semibold text-zinc-500">
            Nivel {progreso.nivel} · {progreso.nombreNivel}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-600">
          <Coins className="h-3.5 w-3.5 text-amber-500" />
          {progreso.monedas}
        </span>
      </div>

      <div className="mt-2.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/70">
          <motion.div
            className="h-full rounded-full bg-violet-500"
            initial={false}
            animate={{ width: `${progreso.porcentaje}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          {progreso.esNivelMaximo
            ? `${progreso.xpTotal} XP · Nivel máximo`
            : `${progreso.xpNivelActual} / ${progreso.xpParaSiguienteNivel} XP para el siguiente nivel`}
        </p>
      </div>
    </div>
  );
}
