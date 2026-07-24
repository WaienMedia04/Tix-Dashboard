"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { type MensajeMascota, chatMascota } from "@/lib/api";

/** Forma mínima que necesitamos de la instancia — el resto de la API de clippyjs no se usa aquí. */
interface AgenteClippy {
  show(fast?: boolean): boolean;
  speak(texto: string, hold?: boolean): void;
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
  "¡Hola! Soy tu mascota del mural. Pregúntame algo o pídeme una mano.",
  "¿En qué te puedo ayudar hoy?",
  "¡Aquí estoy! Escríbeme abajo si me necesitas.",
];

const MAX_HISTORIAL = 6;

/** Mascota animada tipo Clippy — solo vive en el mural propio (editable). */
export function MascotaClippy({ mascotaId }: { mascotaId: string | null }) {
  const agenteRef = useRef<AgenteClippy | null>(null);
  const [listo, setListo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [historial, setHistorial] = useState<MensajeMascota[]>([]);

  useEffect(() => {
    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- oculta el chat mientras se carga/cambia de personaje
    setListo(false);
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
      agente.speak(SALUDOS[Math.floor(Math.random() * SALUDOS.length)], true);
      setListo(true);
    }
    void cargar();

    return () => {
      cancelado = true;
      agenteRef.current?.dispose();
      agenteRef.current = null;
      setListo(false);
    };
  }, [mascotaId]);

  async function enviar() {
    const texto = mensaje.trim();
    if (!texto || enviando || !agenteRef.current) return;
    setMensaje("");
    setEnviando(true);
    const historialActual = historial;
    try {
      const { respuesta } = await chatMascota(texto, historialActual);
      agenteRef.current.speak(respuesta, true);
      const nuevos: MensajeMascota[] = [
        ...historialActual,
        { rol: "usuario", texto },
        { rol: "mascota", texto: respuesta },
      ];
      setHistorial(nuevos.slice(-MAX_HISTORIAL));
    } catch {
      agenteRef.current.speak("Se me trabó algo por dentro — intenta de nuevo en un momento.", true);
    } finally {
      setEnviando(false);
    }
  }

  if (!listo) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[10002] flex w-56 items-center gap-1.5 rounded-full border border-border bg-card/95 p-1.5 shadow-elegant backdrop-blur-sm print:hidden">
      <input
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void enviar();
        }}
        placeholder="Pregúntale a tu mascota..."
        maxLength={500}
        disabled={enviando}
        className="min-w-0 flex-1 bg-transparent px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
      />
      <button
        onClick={() => void enviar()}
        disabled={enviando || !mensaje.trim()}
        aria-label="Enviar"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
