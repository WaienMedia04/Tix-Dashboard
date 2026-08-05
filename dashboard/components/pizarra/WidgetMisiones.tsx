"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Coins, Sparkles, Target } from "lucide-react";
import { type MisionConEstado, type PeriodoMision, fetchMisiones, reclamarMision } from "@/lib/api";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";
import { IconoCatalogo } from "@/lib/iconos-catalogo";

const ETIQUETAS_PERIODO: Record<PeriodoMision, string> = {
  diaria: "Diarias",
  semanal: "Semanales",
  mensual: "Mensuales",
};

const ORDEN_PERIODO: PeriodoMision[] = ["diaria", "semanal", "mensual"];
const DURACION_EFECTO_MS = 1500;

/** Ráfaga de chispas + insignia "+XP +monedas" flotando — se dispara al reclamar una misión con éxito. */
function EfectoReclamo({ xp, monedas }: { xp: number; monedas: number }) {
  const particulas = Array.from({ length: 6 }, (_, i) => ({ id: i, angulo: i * 60 }));

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {particulas.map((p) => {
        const rad = (p.angulo * Math.PI) / 180;
        const distancia = 30;
        return (
          <motion.span
            key={p.id}
            className="absolute top-1/2 left-8 text-amber-500"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{
              x: Math.cos(rad) * distancia,
              y: Math.sin(rad) * distancia,
              opacity: 0,
              scale: 1,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Sparkles className="h-3 w-3" />
          </motion.span>
        );
      })}
      <motion.div
        initial={{ opacity: 0, y: 0, scale: 0.8 }}
        animate={{ opacity: 1, y: -22, scale: 1 }}
        exit={{ opacity: 0, y: -34 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-white shadow-lg"
      >
        +{xp} XP · +{monedas} <Coins className="h-3 w-3" />
      </motion.div>
    </div>
  );
}

function FilaMision({
  mision,
  onReclamar,
  cargando,
  mostrandoEfecto,
}: {
  mision: MisionConEstado;
  onReclamar: () => void;
  cargando: boolean;
  mostrandoEfecto: boolean;
}) {
  return (
    <div className="relative flex items-center gap-2.5 overflow-visible rounded-lg bg-white/60 p-2.5">
      <AnimatePresence>
        {mostrandoEfecto && <EfectoReclamo xp={mision.recompensaXp} monedas={mision.recompensaMonedas} />}
      </AnimatePresence>
      <motion.span
        animate={mostrandoEfecto ? { scale: [1, 1.25, 1] } : {}}
        transition={{ duration: 0.5 }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"
      >
        <IconoCatalogo id={mision.icono} className="h-4 w-4" />
      </motion.span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-zinc-900">{mision.nombre}</p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/70">
          <motion.div
            className={`h-full rounded-full ${mision.reclamada ? "bg-emerald-500" : "bg-primary"}`}
            initial={false}
            animate={{ width: `${Math.min(100, Math.round((mision.progreso / mision.meta) * 100))}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
          {mision.progreso}/{mision.meta} · +{mision.recompensaXp} XP · +{mision.recompensaMonedas}
          <Coins className="h-2.5 w-2.5" />
        </p>
      </div>
      {mision.reclamada ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Lista
        </span>
      ) : mision.completada ? (
        <button
          onClick={onReclamar}
          disabled={cargando}
          className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cargando ? "…" : "Reclamar"}
        </button>
      ) : null}
    </div>
  );
}

export function WidgetMisiones({ tema }: { tema: TemaWidgets }) {
  const [misiones, setMisiones] = useState<MisionConEstado[] | null>(null);
  const [reclamando, setReclamando] = useState<string | null>(null);
  const [efectoActivo, setEfectoActivo] = useState<string | null>(null);
  const estilo = estiloWidget(tema, "indigo");

  useEffect(() => {
    fetchMisiones()
      .then(setMisiones)
      .catch(() => {});
  }, []);

  async function reclamar(misionId: string) {
    if (reclamando) return;
    setReclamando(misionId);
    try {
      setMisiones(await reclamarMision(misionId));
      setEfectoActivo(misionId);
      setTimeout(() => setEfectoActivo(null), DURACION_EFECTO_MS);
    } catch {
      // el usuario puede reintentar
    } finally {
      setReclamando(null);
    }
  }

  if (misiones === null) return null;

  return (
    <div className={`rounded-xl border p-3.5 sm:col-span-2 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Target className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Misiones</span>
      </div>

      <div className="mt-3 space-y-4">
        {ORDEN_PERIODO.map((periodo) => {
          const delPeriodo = misiones.filter((m) => m.periodo === periodo);
          if (delPeriodo.length === 0) return null;
          return (
            <div key={periodo}>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
                {ETIQUETAS_PERIODO[periodo]}
              </p>
              <div className="space-y-1.5">
                {delPeriodo.map((m) => (
                  <FilaMision
                    key={m.id}
                    mision={m}
                    onReclamar={() => void reclamar(m.id)}
                    cargando={reclamando === m.id}
                    mostrandoEfecto={efectoActivo === m.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
