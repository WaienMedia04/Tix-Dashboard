"use client";

import { Crown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { TalentoRanking } from "@/lib/api";
import { Avatar } from "./Avatar";
import { useCountUp } from "@/hooks/useCountUp";
import { StaggerGroup, StaggerItem } from "./motion/Stagger";

const ANILLO_GRADIENTE = "conic-gradient(from 0deg, #00F2FF, #BC00FF, #00F2FF)";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 6) return "text-warning";
  return "text-destructive";
}

function PuntajeAnimado({ puntaje, className }: { puntaje: number | null; className: string }) {
  const texto = puntaje === null ? "—" : puntaje.toFixed(1);
  const animado = useCountUp(texto, 1.1);
  return <span className={className}>{animado}</span>;
}

/** El primer lugar recibe un tratamiento distinto: corona, anillo con degradado
 * de marca en rotación continua y su puntaje animado con el gradiente insignia. */
function PodioPrimero({ talento }: { talento: TalentoRanking }) {
  const reducirMovimiento = useReducedMotion();

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={reducirMovimiento ? undefined : { y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
      >
        <Crown className="h-7 w-7 text-warning" fill="currentColor" style={{ filter: "drop-shadow(0 0 8px rgba(234,179,8,0.55))" }} />
      </motion.div>

      <div className="relative mt-1">
        <motion.div
          className="absolute -inset-2 rounded-full opacity-70 blur-lg"
          style={{ background: ANILLO_GRADIENTE }}
          animate={reducirMovimiento ? undefined : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-1 rounded-full"
          style={{ background: ANILLO_GRADIENTE }}
          animate={reducirMovimiento ? undefined : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        />
        <Avatar
          nombreCompleto={talento.nombreCompleto}
          fotoUrl={talento.fotoUrl}
          size="xl"
          className="relative ring-4 ring-background"
        />
      </div>

      <p className="mt-3 max-w-[9rem] truncate text-sm font-semibold text-foreground">{talento.nombreCompleto}</p>
      <p className="max-w-[9rem] truncate text-xs text-muted-foreground" title={talento.rol}>
        {talento.rol}
      </p>
      <PuntajeAnimado
        puntaje={talento.puntajeIAPromedio}
        className="bg-gradient-primary font-display mt-1 bg-clip-text text-3xl font-bold text-transparent tabular-nums"
      />
      <div className="bg-gradient-primary mt-3 h-16 w-28 rounded-t-xl shadow-elegant" />
    </div>
  );
}

function PodioSecundario({ talento, posicion }: { talento: TalentoRanking; posicion: 2 | 3 }) {
  return (
    <div className="flex flex-col items-center">
      <Avatar nombreCompleto={talento.nombreCompleto} fotoUrl={talento.fotoUrl} size="lg" className="ring-2 ring-border" />
      <p className="mt-2 max-w-[7rem] truncate text-xs font-semibold text-foreground">{talento.nombreCompleto}</p>
      <p className="max-w-[7rem] truncate text-[11px] text-muted-foreground" title={talento.rol}>
        {talento.rol}
      </p>
      <span className={`mt-1 text-lg font-bold tabular-nums ${colorPuntaje(talento.puntajeIAPromedio)}`}>
        {talento.puntajeIAPromedio === null ? "—" : talento.puntajeIAPromedio.toFixed(1)}
      </span>
      <div className={`mt-3 flex w-20 items-start justify-center rounded-t-lg bg-muted ${posicion === 2 ? "h-11" : "h-7"}`}>
        <p className="pt-1 text-xs font-bold text-muted-foreground">{posicion}</p>
      </div>
    </div>
  );
}

export function RankingTalentos({
  talentos,
  titulo = "Ranking de talentos",
  subtitulo = "Ordenado por puntaje IA promedio",
}: {
  talentos: TalentoRanking[];
  titulo?: string;
  subtitulo?: string;
}) {
  const [primero, segundo, tercero, ...resto] = talentos;

  return (
    <div className="flex h-full select-none flex-col rounded-xl border border-border bg-card shadow-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold text-foreground">{titulo}</h2>
        <p className="text-xs text-muted-foreground">{subtitulo}</p>
      </div>

      {talentos.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
          Todavía no hay bitácoras para armar el ranking.
        </div>
      ) : (
        <>
          <div className="flex items-end justify-center gap-3 px-4 pt-6 pb-2 sm:gap-6">
            {segundo && <PodioSecundario talento={segundo} posicion={2} />}
            <PodioPrimero talento={primero} />
            {tercero && <PodioSecundario talento={tercero} posicion={3} />}
          </div>

          {resto.length > 0 && (
            <StaggerGroup className="flex-1 divide-y divide-border overflow-y-auto border-t border-border">
              {resto.map((t, idx) => (
                <StaggerItem key={t.talentoId}>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">{idx + 4}</span>
                    <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{t.nombreCompleto}</p>
                      <p className="truncate text-xs text-muted-foreground" title={t.rol}>
                        {t.rol}
                      </p>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${colorPuntaje(t.puntajeIAPromedio)}`}>
                      {t.puntajeIAPromedio === null ? "—" : t.puntajeIAPromedio.toFixed(1)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </>
      )}
    </div>
  );
}
