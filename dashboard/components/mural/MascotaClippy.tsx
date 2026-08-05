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
  /** Estos campos no están en los tipos públicos del paquete, pero son campos de clase normales (no privados de verdad). */
  _el?: HTMLElement;
  _balloon?: { hide(fast?: boolean): void };
  /** El listener que arma el arrastre — se le puede quitar para que la mascota se quede fija en su sitio. */
  _mouseDownHandle?: (e: MouseEvent) => void;
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

const DURACION_SALUDO_MS = 10000;
const DURACION_RESPUESTA_MS = 8000;
const INTERVALO_ANIMACION_MS = 30000;
const VENTANA_DOBLE_CLICK_MS = 250;
const ANCHO_CHAT_PX = 224;
const ALTO_CHAT_PX = 44;
const MARGEN_DOCK_PX = 48;
const MAX_HISTORIAL = 6;

/** Chips de acceso rápido a las funciones nuevas de la mascota — solo se muestran antes del primer mensaje, para que se descubran sin tener que adivinar qué preguntar. */
const SUGERENCIAS_RAPIDAS = [
  { emoji: "💡", etiqueta: "Consejo", texto: "Dame un consejo para mejorar mi desempeño" },
  { emoji: "😄", etiqueta: "Chiste", texto: "Cuéntame un chiste" },
  { emoji: "📊", etiqueta: "¿Cómo voy?", texto: "¿Cómo voy esta semana con mis bitácoras?" },
];

function mensajeSaludo(nombreTalento: string, mascotaNombre: string | null): string {
  if (!mascotaNombre) return "¿En qué te puedo ayudar?";
  const primerNombre = nombreTalento.trim().split(/\s+/)[0] || "";
  return `¡Hola ${primerNombre}! Soy ${mascotaNombre}, tu mascota. ¿En qué te puedo ayudar hoy?`;
}

/** Mascota animada tipo Clippy — solo vive en el mural propio (editable). */
export function MascotaClippy({
  mascotaId,
  mascotaNombre,
  nombreTalento,
}: {
  mascotaId: string | null;
  mascotaNombre: string | null;
  nombreTalento: string;
}) {
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

  // Ancla la mascota pegada al lado derecho del Dock (mismo elemento .dock-panel
  // que ya usa la barra de iconos abajo), alineando su base con la del Dock.
  // Justo después de show() el Dock o la propia mascota a veces todavía no
  // tienen layout real (rect en 0,0,0,0) — medir eso daba una posición
  // fuera de pantalla (mascota "invisible"). Reintenta por unos frames
  // hasta tener medidas reales, y de todos modos deja todo dentro del
  // viewport por si acaso.
  function posicionarJuntoAlDock(el: HTMLElement, intentosRestantes = 15) {
    const dock = document.querySelector<HTMLElement>(".dock-panel");
    const dockRect = dock?.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (!dockRect || dockRect.width === 0 || elRect.width === 0) {
      if (intentosRestantes > 0) {
        requestAnimationFrame(() => posicionarJuntoAlDock(el, intentosRestantes - 1));
      }
      return;
    }
    let left = dockRect.right + MARGEN_DOCK_PX;
    if (left + elRect.width > window.innerWidth - 8) left = window.innerWidth - elRect.width - 8;
    left = Math.max(8, left);
    const top = Math.min(Math.max(8, dockRect.bottom - elRect.height), window.innerHeight - elRect.height - 8);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
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
      // Se quiere fija junto al Dock, no arrastrable por el talento.
      if (agente._el && agente._mouseDownHandle) {
        agente._el.removeEventListener("mousedown", agente._mouseDownHandle);
      }
      agente.show();
      if (agente._el) posicionarJuntoAlDock(agente._el);
      mostrarConTiempo(agente, mensajeSaludo(nombreTalento, mascotaNombre), DURACION_SALUDO_MS);
      setListo(true);
    }
    void cargar();

    return () => {
      cancelado = true;
      agenteRef.current?.dispose();
      agenteRef.current = null;
      setListo(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mostrarConTiempo/posicionarJuntoAlDock se recrean cada render pero no dependen de nada que deba reiniciar este efecto
  }, [mascotaId]);

  // Si cambia el tamaño de ventana, la vuelve a pegar al Dock (que también se recentra).
  useEffect(() => {
    if (!listo) return;
    function onResize() {
      if (agenteRef.current?._el) posicionarJuntoAlDock(agenteRef.current._el);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- posicionarJuntoAlDock se recrea cada render
  }, [listo]);

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
    // A la derecha de la mascota — si no cabe (pantalla angosta), a la izquierda.
    let left = rect.right + 8;
    if (left + ANCHO_CHAT_PX > window.innerWidth - 8) left = rect.left - ANCHO_CHAT_PX - 8;
    if (left < 8) left = 8;
    // Centrado verticalmente con la mascota.
    let top = rect.top + rect.height / 2 - ALTO_CHAT_PX / 2;
    if (top < 8) top = 8;
    if (top + ALTO_CHAT_PX > window.innerHeight - 8) top = window.innerHeight - ALTO_CHAT_PX - 8;
    return { top, left };
  }

  // Un solo click abre/cierra el chat a la derecha de la mascota. El doble
  // click ya lo maneja la librería sola (juega una animación) — aquí solo
  // hay que esperar un poco antes de reaccionar al primer click, para no
  // dispararlo también cuando en realidad era el inicio de un doble click.
  // (No hace falta distinguir de un arrastre: la mascota ya no es arrastrable.)
  useEffect(() => {
    if (!listo) return;
    const el = agenteRef.current?._el;
    if (!el) return;

    let temporizadorClick: ReturnType<typeof setTimeout> | null = null;

    function onClick() {
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

    el.addEventListener("click", onClick);
    return () => {
      if (temporizadorClick) clearTimeout(temporizadorClick);
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
      className="flex w-56 flex-col gap-1.5 print:hidden"
    >
      {historial.length === 0 && (
        <div className="flex flex-wrap gap-1.5">
          {SUGERENCIAS_RAPIDAS.map((s) => (
            <button
              key={s.etiqueta}
              onClick={() => void enviar(s.texto)}
              disabled={enviando}
              className="rounded-full border border-white/10 bg-zinc-900/95 px-2.5 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {s.emoji} {s.etiqueta}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/95 p-1.5 shadow-elegant backdrop-blur-sm">
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
    </div>
  );
}
