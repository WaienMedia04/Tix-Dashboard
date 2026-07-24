"use client";

import { useEffect, useRef } from "react";

/** Forma mínima que necesitamos de la instancia — el resto de la API de clippyjs no se usa aquí. */
interface AgenteClippy {
  show(): unknown;
  speak(texto: string, opts?: { tts?: boolean; hold?: boolean }): unknown;
  dispose(): void;
}

type CargadorMascota = () => Promise<{ default: unknown }>;

const CARGADORES_MASCOTA: Record<string, CargadorMascota> = {
  clippy: () => import("clippyjs/agents/clippy"),
  bonzi: () => import("clippyjs/agents/bonzi"),
  f1: () => import("clippyjs/agents/f1"),
  genie: () => import("clippyjs/agents/genie"),
  genius: () => import("clippyjs/agents/genius"),
  links: () => import("clippyjs/agents/links"),
  merlin: () => import("clippyjs/agents/merlin"),
  peedy: () => import("clippyjs/agents/peedy"),
  rocky: () => import("clippyjs/agents/rocky"),
  rover: () => import("clippyjs/agents/rover"),
};

const SALUDOS = [
  "¡Hola! Soy tu mascota del mural.",
  "¿En qué te puedo acompañar hoy?",
  "¡Aquí estoy si me necesitas!",
];

/** Mascota animada tipo Clippy — solo vive en el mural propio (editable). */
export function MascotaClippy({ mascotaId }: { mascotaId: string | null }) {
  const agenteRef = useRef<AgenteClippy | null>(null);

  useEffect(() => {
    let cancelado = false;
    const cargador = mascotaId ? CARGADORES_MASCOTA[mascotaId] : undefined;
    if (!cargador) return;

    async function cargar() {
      const [{ initAgent }, mod] = await Promise.all([import("clippyjs"), cargador!()]);
      if (cancelado) return;
      const agente = (await initAgent(mod.default as never)) as unknown as AgenteClippy;
      if (cancelado) {
        agente.dispose();
        return;
      }
      agenteRef.current = agente;
      agente.show();
      agente.speak(SALUDOS[Math.floor(Math.random() * SALUDOS.length)]);
    }
    void cargar();

    return () => {
      cancelado = true;
      agenteRef.current?.dispose();
      agenteRef.current = null;
    };
  }, [mascotaId]);

  return null;
}
