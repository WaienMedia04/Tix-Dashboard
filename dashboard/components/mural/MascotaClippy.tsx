"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import { type MensajeMascota, chatMascota } from "@/lib/api";

/** Web Speech API — no todos los navegadores la exponen igual (Chrome/Edge sí, Firefox no la soporta, Safari es inconsistente). */
interface ReconocimientoVoz extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
}
interface ResultadoReconocimientoVoz extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } } & { length: number };
}
declare global {
  interface Window {
    SpeechRecognition?: new () => ReconocimientoVoz;
    webkitSpeechRecognition?: new () => ReconocimientoVoz;
  }
}

/** Forma mínima que necesitamos de la instancia — el resto de la API de clippyjs no se usa aquí. */
interface AgenteClippy {
  show(fast?: boolean): boolean;
  speak(texto: string, hold?: boolean): void;
  /** Desatasca la cola de acciones tras un speak con hold:true — pero NO oculta el globo (closeBalloon() tampoco solo, y encima demora 2s más). Hay que combinarlo con ocultar _balloon directamente para que desaparezca ya. */
  stopCurrent(): void;
  animate(): void;
  dispose(): void;
  /** Estos dos campos no están en los tipos públicos del paquete, pero son campos de clase normales (no privados de verdad). */
  _el?: HTMLElement;
  _balloon?: { hide(fast?: boolean): void };
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

const MENSAJE_SALUDO = "¿En qué te puedo ayudar?";
const DURACION_SALUDO_MS = 3000;
const DURACION_RESPUESTA_MS = 8000;
const INTERVALO_ANIMACION_MS = 30000;
const VENTANA_DOBLE_CLICK_MS = 250;
const UMBRAL_ARRASTRE_PX = 5;
const ANCHO_CHAT_PX = 224;
const MAX_HISTORIAL = 6;

/** Mascota animada tipo Clippy — solo vive en el mural propio (editable). */
export function MascotaClippy({ mascotaId }: { mascotaId: string | null }) {
  const agenteRef = useRef<AgenteClippy | null>(null);
  const [listo, setListo] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [posicionChat, setPosicionChat] = useState<{ top: number; left: number } | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [historial, setHistorial] = useState<MensajeMascota[]>([]);
  const [escuchando, setEscuchando] = useState(false);
  const reconocimientoRef = useRef<ReconocimientoVoz | null>(null);
  // Identifica cuál es el mensaje (saludo o respuesta) más reciente que se
  // mandó a mostrar — así, cuando el temporizador de UN mensaje se cumple,
  // solo oculta el globo si nadie mandó uno más nuevo mientras tanto (si no,
  // le arrancaría de la pantalla la respuesta que recién estaba apareciendo).
  const turnoMensajeRef = useRef(0);

  /** speak() con hold:true + cierre automático propio a los `duracionMs` — así se controla cuánto dura visible, en vez de los 2s fijos que trae la librería. */
  function mostrarConTiempo(agente: AgenteClippy, texto: string, duracionMs: number) {
    const miTurno = ++turnoMensajeRef.current;
    agente.speak(texto, true);
    setTimeout(() => {
      if (turnoMensajeRef.current !== miTurno) return;
      // stopCurrent() desatasca la cola (necesario para que el próximo
      // mensaje se pueda mostrar) — pero no oculta el globo, hay que
      // hacerlo aparte y de inmediato (closeBalloon() del API público
      // demora 2s más).
      agenteRef.current?.stopCurrent();
      agenteRef.current?._balloon?.hide(true);
    }, duracionMs);
  }

  // Carga el agente elegido y lo muestra con un saludo que se cierra solo a los 3s.
  useEffect(() => {
    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia todo al cambiar/quitar de personaje
    setListo(false);
    setChatAbierto(false);
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
      mostrarConTiempo(agente, MENSAJE_SALUDO, DURACION_SALUDO_MS);
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

  // Cada 10s hace una animación aleatoria para no quedarse fija.
  useEffect(() => {
    if (!listo) return;
    const id = setInterval(() => {
      agenteRef.current?.animate();
    }, INTERVALO_ANIMACION_MS);
    return () => clearInterval(id);
  }, [listo]);

  function calcularPosicionChat(el: HTMLElement): { top: number; left: number } {
    const rect = el.getBoundingClientRect();
    let left = rect.left;
    if (left + ANCHO_CHAT_PX > window.innerWidth - 8) left = window.innerWidth - ANCHO_CHAT_PX - 8;
    if (left < 8) left = 8;
    let top = rect.bottom + 8;
    if (top + 56 > window.innerHeight - 8) top = Math.max(8, rect.top - 56 - 8);
    return { top, left };
  }

  // Un solo click abre/cierra el chat justo debajo de la mascota. El doble
  // click ya lo maneja la librería sola (juega una animación) — aquí solo
  // hay que evitar que un click de más dispare el chat, y que un arrastre
  // (mousedown + mover + soltar) se confunda con un click real.
  useEffect(() => {
    if (!listo) return;
    const el = agenteRef.current?._el;
    if (!el) return;

    let bajando = false;
    let seMovio = false;
    let bajadaX = 0;
    let bajadaY = 0;
    let temporizadorClick: ReturnType<typeof setTimeout> | null = null;

    function onMouseDown(e: MouseEvent) {
      bajando = true;
      seMovio = false;
      bajadaX = e.clientX;
      bajadaY = e.clientY;
    }
    function onMouseMove(e: MouseEvent) {
      if (!bajando) return;
      if (Math.abs(e.clientX - bajadaX) > UMBRAL_ARRASTRE_PX || Math.abs(e.clientY - bajadaY) > UMBRAL_ARRASTRE_PX) {
        seMovio = true;
      }
    }
    function onMouseUp() {
      bajando = false;
    }
    function onClick() {
      if (seMovio) return;
      if (temporizadorClick) {
        // Es el segundo click de un doble click — lo maneja la librería sola.
        clearTimeout(temporizadorClick);
        temporizadorClick = null;
        return;
      }
      temporizadorClick = setTimeout(() => {
        temporizadorClick = null;
        setChatAbierto((abierto) => {
          const siguiente = !abierto;
          if (siguiente && agenteRef.current?._el) {
            setPosicionChat(calcularPosicionChat(agenteRef.current._el));
          }
          return siguiente;
        });
      }, VENTANA_DOBLE_CLICK_MS);
    }

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("click", onClick);
    return () => {
      if (temporizadorClick) clearTimeout(temporizadorClick);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("click", onClick);
    };
  }, [listo]);

  // Si se cierra el chat, no dejar el micrófono escuchando de fondo.
  useEffect(() => {
    if (!chatAbierto) {
      reconocimientoRef.current?.stop();
    }
  }, [chatAbierto]);

  function alternarEscucha() {
    if (escuchando) {
      reconocimientoRef.current?.stop();
      return;
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    const reconocimiento = new Ctor();
    reconocimiento.lang = "es-DO";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;
    reconocimiento.addEventListener("result", (e) => {
      const evento = e as ResultadoReconocimientoVoz;
      const texto = evento.results[evento.results.length - 1]?.[0]?.transcript?.trim();
      if (texto) void enviar(texto);
    });
    reconocimiento.addEventListener("end", () => {
      setEscuchando(false);
      reconocimientoRef.current = null;
    });
    reconocimiento.addEventListener("error", () => {
      setEscuchando(false);
      reconocimientoRef.current = null;
    });
    reconocimientoRef.current = reconocimiento;
    reconocimiento.start();
    setEscuchando(true);
  }

  async function enviar(textoVoz?: string) {
    const texto = (textoVoz ?? mensaje).trim();
    if (!texto || enviando || !agenteRef.current) return;
    setMensaje("");
    setEnviando(true);
    const historialActual = historial;
    try {
      const { respuesta } = await chatMascota(texto, historialActual);
      mostrarConTiempo(agenteRef.current, respuesta, DURACION_RESPUESTA_MS);
      const nuevos: MensajeMascota[] = [
        ...historialActual,
        { rol: "usuario", texto },
        { rol: "mascota", texto: respuesta },
      ];
      setHistorial(nuevos.slice(-MAX_HISTORIAL));
    } catch {
      mostrarConTiempo(agenteRef.current, "Se me trabó algo por dentro — intenta de nuevo en un momento.", DURACION_RESPUESTA_MS);
    } finally {
      setEnviando(false);
    }
  }

  if (!listo || !chatAbierto || !posicionChat) return null;

  const soportaVoz = typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  return (
    <div
      style={{ position: "fixed", top: posicionChat.top, left: posicionChat.left, zIndex: 10002 }}
      className="flex w-56 items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/95 p-1.5 shadow-elegant backdrop-blur-sm print:hidden"
    >
      {soportaVoz && (
        <button
          onClick={alternarEscucha}
          disabled={enviando}
          aria-label={escuchando ? "Detener dictado por voz" : "Hablarle por voz"}
          title={escuchando ? "Detener dictado por voz" : "Hablarle por voz"}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            escuchando ? "animate-pulse bg-destructive text-white" : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          <Mic className="h-3.5 w-3.5" />
        </button>
      )}
      <input
        autoFocus
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void enviar();
        }}
        placeholder={escuchando ? "Escuchando..." : "Pregúntale a tu mascota..."}
        maxLength={500}
        disabled={enviando}
        className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
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
