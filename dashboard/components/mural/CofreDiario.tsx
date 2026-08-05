"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { type EstadoCofre, abrirCofre, fetchCofreEstado } from "@/lib/api";
import { Modal } from "@/components/Modal";

/** Cofre diario (doc "Actualización Mural 2.0" #6) — flota junto al resto de badges del mural propio, se abre una vez al día. */
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
    if (abriendo) return;
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

  return (
    <>
      <motion.button
        onClick={() => setAbierto(true)}
        className="fixed right-4 bottom-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-xl backdrop-blur-sm print:hidden"
        title={estado.yaAbierto ? "Ya abriste tu cofre de hoy" : "¡Tienes un cofre por abrir!"}
        animate={estado.yaAbierto ? {} : { scale: [1, 1.12, 1] }}
        transition={estado.yaAbierto ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {estado.yaAbierto ? "🧰" : "🎁"}
      </motion.button>

      <Modal open={abierto} onClose={() => setAbierto(false)} title="Cofre diario">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          {premio || estado.yaAbierto ? (
            <>
              <motion.span
                initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
                className="text-6xl"
              >
                🎉
              </motion.span>
              <p className="text-sm text-muted-foreground">
                {premio ? "¡Ganaste!" : "Ya abriste tu cofre de hoy:"}
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                +{(premio ?? estado).xp} XP · +{(premio ?? estado).monedas} 🪙
              </p>
              {estado.yaAbierto && <p className="text-xs text-muted-foreground">Vuelve mañana por otro.</p>}
            </>
          ) : (
            <>
              <span className="text-6xl">🎁</span>
              <p className="text-sm text-muted-foreground">Tienes un cofre disponible — ábrelo para ganar XP y monedas.</p>
              <button
                onClick={() => void abrir()}
                disabled={abriendo}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {abriendo ? "Abriendo…" : "Abrir cofre"}
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
