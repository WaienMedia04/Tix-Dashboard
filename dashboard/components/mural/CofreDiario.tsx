"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Archive, Coins, Gift, PartyPopper } from "lucide-react";
import { type EstadoCofre, abrirCofre, fetchCofreEstado } from "@/lib/api";
import { Modal } from "@/components/Modal";

/** Anillo SVG que se va llenando según `progreso/meta` — mismo componente para el botón flotante y el ícono grande del modal. */
function AnilloProgreso({
  progreso,
  meta,
  tamano,
  grosor,
  pista,
}: {
  progreso: number;
  meta: number;
  tamano: number;
  grosor: number;
  pista: string;
}) {
  const radio = tamano / 2 - grosor;
  const circunferencia = 2 * Math.PI * radio;
  const fraccion = meta > 0 ? Math.min(1, progreso / meta) : 0;
  const centro = tamano / 2;

  return (
    <svg
      className="pointer-events-none absolute inset-0 -rotate-90"
      viewBox={`0 0 ${tamano} ${tamano}`}
      aria-hidden
    >
      <circle cx={centro} cy={centro} r={radio} fill="none" stroke={pista} strokeWidth={grosor} />
      <circle
        cx={centro}
        cy={centro}
        r={radio}
        fill="none"
        stroke="currentColor"
        strokeWidth={grosor}
        strokeDasharray={circunferencia}
        strokeDashoffset={circunferencia * (1 - fraccion)}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-500 ease-out"
      />
    </svg>
  );
}

/**
 * Cofre diario — a diferencia de estar disponible de una vez, la barra se
 * llena con la actividad de hoy en la pizarra y las bitácoras; al llenarse
 * se desbloquea y se puede abrir una sola vez, y se resetea al día
 * siguiente (ver META_ACTIVIDADES en src/cofre/cofre.service.ts).
 */
export function CofreDiario() {
  const [estado, setEstado] = useState<EstadoCofre | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [abriendo, setAbriendo] = useState(false);
  const [premio, setPremio] = useState<{ xp: number; monedas: number } | null>(null);

  useEffect(() => {
    fetchCofreEstado()
      .then(setEstado)
      .catch(() => {});
  }, []);

  async function abrir() {
    if (abriendo || !estado?.desbloqueado || estado.yaAbierto) return;
    setAbriendo(true);
    try {
      const r = await abrirCofre();
      setEstado(r);
      setPremio({ xp: r.xp, monedas: r.monedas });
    } catch {
      // el botón sigue disponible para reintentar
    } finally {
      setAbriendo(false);
    }
  }

  if (estado === null) return null;

  const listoParaAbrir = estado.desbloqueado && !estado.yaAbierto;
  const enProgreso = !estado.yaAbierto && !listoParaAbrir;

  return (
    <>
      <motion.button
        onClick={() => setAbierto(true)}
        className="fixed right-4 bottom-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm print:hidden"
        title={
          estado.yaAbierto
            ? "Ya abriste tu cofre de hoy"
            : listoParaAbrir
              ? "¡Tienes un cofre por abrir!"
              : `Actividad de hoy: ${estado.progreso}/${estado.meta}`
        }
        animate={listoParaAbrir ? { scale: [1, 1.12, 1] } : {}}
        transition={listoParaAbrir ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        {enProgreso && (
          <span className="absolute inset-0 text-amber-400">
            <AnilloProgreso progreso={estado.progreso} meta={estado.meta} tamano={44} grosor={3} pista="rgba(255,255,255,0.25)" />
          </span>
        )}
        {estado.yaAbierto ? <Archive className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
      </motion.button>

      <Modal open={abierto} onClose={() => setAbierto(false)} title="Cofre diario">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {premio || estado.yaAbierto ? (
            <>
              <motion.span
                initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <PartyPopper className="h-9 w-9" />
              </motion.span>
              <p className="text-sm text-muted-foreground">
                {premio ? "¡Ganaste!" : "Ya abriste tu cofre de hoy:"}
              </p>
              <p className="font-display flex items-center gap-1.5 text-2xl font-bold text-foreground">
                +{(premio ?? estado).xp} XP · +{(premio ?? estado).monedas} <Coins className="h-5 w-5 text-amber-500" />
              </p>
              {estado.yaAbierto && <p className="text-xs text-muted-foreground">Vuelve mañana por otro.</p>}
            </>
          ) : listoParaAbrir ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Gift className="h-9 w-9" />
              </span>
              <p className="text-sm text-muted-foreground">¡Llenaste la barra de hoy! Ábrelo para ganar XP y monedas.</p>
              <button
                onClick={() => void abrir()}
                disabled={abriendo}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {abriendo ? "Abriendo…" : "Abrir cofre"}
              </button>
            </>
          ) : (
            <>
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <AnilloProgreso progreso={estado.progreso} meta={estado.meta} tamano={64} grosor={4} pista="rgba(0,0,0,0.08)" />
                <Gift className="h-9 w-9" />
              </span>
              <p className="text-sm text-muted-foreground">Se llena con tu actividad de hoy en la pizarra y las bitácoras.</p>
              <p className="font-display text-lg font-bold text-foreground">
                {estado.progreso}/{estado.meta}
              </p>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
