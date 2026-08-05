"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cake, PartyPopper } from "lucide-react";
import { type CumpleanosResponse, enviarNotaAMural, fetchCumpleanos } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const CONFETI = ["🎉", "🎊", "🎈", "✨", "🎂"];

/** Ráfaga de confeti liviana (sin dependencias) — partículas que salen del centro y se desvanecen, una sola vez al montar. */
function RafagaConfeti() {
  const particulas = CONFETI.flatMap((emoji, i) =>
    Array.from({ length: 2 }, (_, j) => ({ id: `${i}-${j}`, emoji, angulo: (i * 2 + j) * (360 / 10) })),
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particulas.map((p) => {
        const rad = (p.angulo * Math.PI) / 180;
        const distancia = 46;
        return (
          <motion.span
            key={p.id}
            className="absolute top-1/2 left-1/2 text-base"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{
              x: Math.cos(rad) * distancia,
              y: Math.sin(rad) * distancia - 10,
              opacity: 0,
              scale: 1,
            }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            {p.emoji}
          </motion.span>
        );
      })}
    </div>
  );
}

function TarjetaCumpleHoy({ slug, talento }: { slug: string; talento: { id: string; nombreCompleto: string; fotoUrl: string | null } }) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "felicitado">("idle");

  async function felicitar() {
    if (estado !== "idle") return;
    setEstado("enviando");
    try {
      await enviarNotaAMural(slug, talento.id, { texto: "¡Feliz cumpleaños! 🎉🎂", color: "rosa" });
      setEstado("felicitado");
    } catch {
      setEstado("idle");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-rose-200 bg-gradient-to-br from-rose-50 to-amber-50 p-3">
      <RafagaConfeti />
      <div className="relative flex items-center gap-2.5">
        <Avatar nombreCompleto={talento.nombreCompleto} fotoUrl={talento.fotoUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900">{talento.nombreCompleto}</p>
          <p className="text-xs text-rose-600">🎂 ¡Está de cumpleaños hoy!</p>
        </div>
        <button
          onClick={() => void felicitar()}
          disabled={estado !== "idle"}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:cursor-default disabled:opacity-60"
        >
          <PartyPopper className="h-3.5 w-3.5" />
          {estado === "felicitado" ? "¡Felicitado!" : "Felicitar"}
        </button>
      </div>
    </div>
  );
}

export function WidgetCumpleanosProximos({ slug, tema }: { slug: string; tema: TemaWidgets }) {
  const [datos, setDatos] = useState<CumpleanosResponse | null>(null);

  useEffect(() => {
    fetchCumpleanos(slug)
      .then(setDatos)
      .catch(() => setDatos(null));
  }, [slug]);

  if (!datos || (datos.hoy.length === 0 && datos.esteMes.length === 0)) return null;

  const proximos = datos.esteMes.slice(0, 3);
  const estilo = estiloWidget(tema, "rosado");

  return (
    <div className={`rounded-xl border p-3.5 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Cake className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Cumpleaños</span>
      </div>

      {datos.hoy.length > 0 && (
        <div className="mt-2.5 space-y-2">
          {datos.hoy.map((t) => (
            <TarjetaCumpleHoy key={t.id} slug={slug} talento={t} />
          ))}
        </div>
      )}

      {proximos.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {proximos.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <Avatar nombreCompleto={t.nombreCompleto} fotoUrl={t.fotoUrl} size="sm" />
              <span className="min-w-0 flex-1 truncate text-zinc-900">{t.nombreCompleto}</span>
              <span className="shrink-0 text-xs text-zinc-500">
                {t.dia} de {MESES[new Date().getMonth()]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
