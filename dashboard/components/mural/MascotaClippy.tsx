"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { type MensajeMascota, chatMascota } from "@/lib/api";

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
const INTERVALO_ANIMACION_MS = 60000;
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
  // true mientras el globo todavía muestra el saludo inicial — si el
  // talento ya escribió antes de los 3s, el temporizador del saludo NO debe
  // ocultar el globo a la fuerza (le arrancaría la respuesta del chat que
  // ya está mostrándose ahí, ver enviar()).
  const saludoPendienteRef = useRef(true);

  // Carga el agente elegido y lo muestra con un saludo que se cierra solo a los 3s.
  useEffect(() => {
    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia todo al cambiar/quitar de personaje
    setListo(false);
    setChatAbierto(false);
    saludoPendienteRef.current = true;
    const cargador = mascotaId ? CARGADORES_MASCOTA[mascotaId] : undefined;
    if (!cargador) return;

    let temporizadorSaludo: ReturnType<typeof setTimeout> | undefined;

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
      agente.speak(MENSAJE_SALUDO, true);
      temporizadorSaludo = setTimeout(() => {
        // stopCurrent() siempre hay que llamarlo: desatasca la cola de
        // acciones (si no, ningún speak() posterior — ni el saludo ni una
        // respuesta ya encolada — llegaría a mostrarse). Pero el ocultado
        // forzado del globo solo aplica si el saludo sigue siendo lo que
        // se muestra — si el talento ya escribió, ahí ya está la
        // respuesta del chat y no hay que arrancarla de la pantalla.
        agenteRef.current?.stopCurrent();
        if (saludoPendienteRef.current) {
          agenteRef.current?._balloon?.hide(true);
        }
      }, DURACION_SALUDO_MS);
      setListo(true);
    }
    void cargar();

    return () => {
      cancelado = true;
      if (temporizadorSaludo) clearTimeout(temporizadorSaludo);
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

  async function enviar() {
    const texto = mensaje.trim();
    if (!texto || enviando || !agenteRef.current) return;
    saludoPendienteRef.current = false;
    setMensaje("");
    setEnviando(true);
    const historialActual = historial;
    try {
      const { respuesta } = await chatMascota(texto, historialActual);
      // hold:false — se cierra sola y libera la cola para el próximo mensaje.
      agenteRef.current.speak(respuesta, false);
      const nuevos: MensajeMascota[] = [
        ...historialActual,
        { rol: "usuario", texto },
        { rol: "mascota", texto: respuesta },
      ];
      setHistorial(nuevos.slice(-MAX_HISTORIAL));
    } catch {
      agenteRef.current.speak("Se me trabó algo por dentro — intenta de nuevo en un momento.", false);
    } finally {
      setEnviando(false);
    }
  }

  if (!listo || !chatAbierto || !posicionChat) return null;

  return (
    <div
      style={{ position: "fixed", top: posicionChat.top, left: posicionChat.left, zIndex: 10002 }}
      className="flex w-56 items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/95 p-1.5 shadow-elegant backdrop-blur-sm print:hidden"
    >
      <input
        autoFocus
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void enviar();
        }}
        placeholder="Pregúntale a tu mascota..."
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
