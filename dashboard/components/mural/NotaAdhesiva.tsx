"use client";

import { useRef, useState } from "react";
import { Bold, Expand, Italic, Maximize2, Smile, X } from "lucide-react";
import { type NotaMural, actualizarNotaMural, borrarNotaMural } from "@/lib/api";
import { COLORES_NOTA, colorNotaEstilo } from "@/lib/mural-fondos";
import { EMOJIS_NOTA } from "@/lib/emojis-nota.constant";
import { renderizarTextoNota } from "@/lib/nota-texto";
import { Modal } from "@/components/Modal";

const ESCALA_MIN = 0.7;
const ESCALA_MAX = 1.8;

/** Envuelve la selección actual del textarea con un marcador (negrita/cursiva) o inserta un emoji en el cursor. */
function BarraFormato({
  valor,
  onCambiar,
  textareaRef,
}: {
  valor: string;
  onCambiar: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [mostrarEmoji, setMostrarEmoji] = useState(false);

  function envolverSeleccion(marcador: string, relleno: string) {
    const el = textareaRef.current;
    if (!el) return;
    const inicio = el.selectionStart;
    const fin = el.selectionEnd;
    const seleccionado = valor.slice(inicio, fin) || relleno;
    const nuevo = `${valor.slice(0, inicio)}${marcador}${seleccionado}${marcador}${valor.slice(fin)}`;
    onCambiar(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(inicio + marcador.length, inicio + marcador.length + seleccionado.length);
    });
  }

  function insertarEmoji(emoji: string) {
    setMostrarEmoji(false);
    const el = textareaRef.current;
    if (!el) {
      onCambiar(valor + emoji);
      return;
    }
    const inicio = el.selectionStart;
    const fin = el.selectionEnd;
    const nuevo = `${valor.slice(0, inicio)}${emoji}${valor.slice(fin)}`;
    onCambiar(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(inicio + emoji.length, inicio + emoji.length);
    });
  }

  return (
    <div className="relative flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => envolverSeleccion("**", "negrita")}
        title="Negrita"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/10"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => envolverSeleccion("_", "cursiva")}
        title="Cursiva"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/10"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setMostrarEmoji((v) => !v)}
        title="Insertar emoji"
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/10"
      >
        <Smile className="h-3.5 w-3.5" />
      </button>

      {mostrarEmoji && (
        <div className="absolute top-7 left-0 z-20 grid w-48 grid-cols-8 gap-0.5 rounded-md bg-white/95 p-1.5 text-base shadow-elegant">
          {EMOJIS_NOTA.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertarEmoji(emoji)}
              className="rounded hover:bg-black/10"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NotaAdhesiva({
  nota,
  arrastrable,
  editable,
  contenedorRef,
  onActualizada,
  onBorrada,
}: {
  nota: NotaMural;
  arrastrable: boolean;
  /** false cuando se está visitando el mural de otro empleado — solo lectura. */
  editable: boolean;
  contenedorRef: React.RefObject<HTMLDivElement | null>;
  onActualizada: (nota: NotaMural) => void;
  onBorrada: (id: string) => void;
}) {
  const notaRef = useRef<HTMLDivElement>(null);
  const arrastrandoRef = useRef(false);
  const redimensionandoRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaModalRef = useRef<HTMLTextAreaElement>(null);
  const [texto, setTexto] = useState(nota.texto);
  const [editando, setEditando] = useState(false);
  const [mostrarColores, setMostrarColores] = useState(false);
  const [mostrarExpandir, setMostrarExpandir] = useState(false);
  const [borrador, setBorrador] = useState(nota.texto);
  const estilo = colorNotaEstilo(nota.color);

  function handlePointerDown(e: React.PointerEvent) {
    // El modal "Expandir" se renderiza en un portal fuera del DOM de la nota,
    // pero React sigue burbujeando el evento por el árbol de componentes —
    // sin este guard, un pointerdown dentro del modal termina disparando el
    // arrastre de la nota de abajo y le roba la captura del puntero al modal
    // (el usuario deja de poder interactuar con él, incl. escribir).
    if (!arrastrable || editando || mostrarExpandir) return;
    const contenedor = contenedorRef.current;
    const el = notaRef.current;
    if (!contenedor || !el) return;

    e.preventDefault();
    arrastrandoRef.current = true;
    el.setPointerCapture(e.pointerId);
    const contenedorRect = contenedor.getBoundingClientRect();

    function mover(ev: PointerEvent) {
      if (!arrastrandoRef.current) return;
      const x = ((ev.clientX - contenedorRect.left) / contenedorRect.width) * 100;
      const y = ((ev.clientY - contenedorRect.top) / contenedorRect.height) * 100;
      const posX = Math.min(96, Math.max(0, x));
      const posY = Math.min(96, Math.max(0, y));
      if (el) {
        el.style.left = `${posX}%`;
        el.style.top = `${posY}%`;
      }
    }

    function soltar(ev: PointerEvent) {
      arrastrandoRef.current = false;
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      if (!contenedor) return;
      const x = ((ev.clientX - contenedorRect.left) / contenedorRect.width) * 100;
      const y = ((ev.clientY - contenedorRect.top) / contenedorRect.height) * 100;
      const posX = Math.min(96, Math.max(0, x));
      const posY = Math.min(96, Math.max(0, y));
      onActualizada({ ...nota, posX, posY });
      actualizarNotaMural(nota.id, { posX, posY }).catch(() => {
        // la posición visual ya se movió; si falla, se corrige en el próximo fetch
      });
    }

    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
  }

  function handleResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const el = notaRef.current;
    if (!el) return;

    redimensionandoRef.current = true;
    const inicioX = e.clientX;
    const inicioY = e.clientY;
    const escalaInicial = nota.escala;

    function mover(ev: PointerEvent) {
      if (!redimensionandoRef.current) return;
      const delta = (ev.clientX - inicioX + (ev.clientY - inicioY)) / 200;
      const escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escalaInicial + delta));
      if (el) el.style.setProperty("--nota-escala", String(escala));
    }

    function soltar(ev: PointerEvent) {
      redimensionandoRef.current = false;
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
      const delta = (ev.clientX - inicioX + (ev.clientY - inicioY)) / 200;
      const escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escalaInicial + delta));
      onActualizada({ ...nota, escala });
      actualizarNotaMural(nota.id, { escala }).catch(() => {});
    }

    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
  }

  function guardarTexto() {
    setEditando(false);
    if (texto.trim() === nota.texto) return;
    const textoFinal = texto.trim() || nota.texto;
    setTexto(textoFinal);
    onActualizada({ ...nota, texto: textoFinal });
    actualizarNotaMural(nota.id, { texto: textoFinal }).catch(() => {});
  }

  function guardarBorrador() {
    const textoFinal = borrador.trim() || nota.texto;
    setTexto(textoFinal);
    setBorrador(textoFinal);
    setMostrarExpandir(false);
    if (textoFinal === nota.texto) return;
    onActualizada({ ...nota, texto: textoFinal });
    actualizarNotaMural(nota.id, { texto: textoFinal }).catch(() => {});
  }

  async function cambiarColor(color: string) {
    setMostrarColores(false);
    onActualizada({ ...nota, color });
    try {
      await actualizarNotaMural(nota.id, { color });
    } catch {
      // sin cambios visibles si falla
    }
  }

  async function eliminar() {
    onBorrada(nota.id);
    try {
      await borrarNotaMural(nota.id);
    } catch {
      // ya se quitó del estado local; no revertimos para no confundir al usuario
    }
  }

  const fondoNota = `linear-gradient(165deg, ${estilo.bg} 0%, color-mix(in srgb, ${estilo.bg} 82%, black) 100%)`;

  return (
    <div
      ref={notaRef}
      onPointerDown={handlePointerDown}
      className={`group flex w-36 flex-col gap-1.5 rounded-[3px] p-3 text-xs shadow-[0_12px_20px_-10px_rgba(0,0,0,0.45),0_2px_4px_rgba(0,0,0,0.2)] ${
        arrastrable ? "absolute" : "relative"
      } ${arrastrable ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={
        arrastrable
          ? ({
              left: `${nota.posX}%`,
              top: `${nota.posY}%`,
              background: fondoNota,
              color: estilo.texto,
              "--nota-escala": nota.escala,
              transform: `rotate(${nota.rotacion}deg) scale(var(--nota-escala))`,
              transformOrigin: "top left",
              zIndex: nota.zIndex,
            } as React.CSSProperties)
          : { background: fondoNota, color: estilo.texto }
      }
    >
      <div className="flex items-start justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center gap-1">
          {editable && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setMostrarColores((v) => !v);
              }}
              className="h-3.5 w-3.5 rounded-full border border-black/10"
              style={{ background: estilo.bg }}
              aria-label="Cambiar color"
            />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setBorrador(texto);
              setMostrarExpandir(true);
            }}
            aria-label="Expandir nota"
            className="opacity-60 hover:opacity-100"
          >
            <Expand className="h-3.5 w-3.5" />
          </button>
          {editable && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                void eliminar();
              }}
              aria-label="Borrar nota"
              className="opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {editable && mostrarColores && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-6 left-2 z-10 flex flex-wrap items-center gap-1 rounded-md bg-white/90 p-1.5 shadow-elegant"
        >
          {COLORES_NOTA.map((c) => (
            <button
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                void cambiarColor(c.id);
              }}
              className="h-4 w-4 rounded-full border border-black/10"
              style={{ background: c.bg }}
              aria-label={c.label}
            />
          ))}
          <label
            className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-dashed border-black/30 text-[8px] text-black/60"
            title="Color libre"
          >
            +
            <input
              type="color"
              value={nota.color.startsWith("#") ? nota.color : "#ffffff"}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => void cambiarColor(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      )}

      {editable && editando ? (
        <div className="flex flex-col gap-1">
          <BarraFormato valor={texto} onCambiar={setTexto} textareaRef={textareaRef} />
          <textarea
            ref={textareaRef}
            autoFocus
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={guardarTexto}
            onPointerDown={(e) => e.stopPropagation()}
            maxLength={280}
            rows={4}
            className="w-full resize-none bg-transparent text-xs outline-none"
          />
        </div>
      ) : (
        <p
          onClick={(e) => {
            if (!editable) return;
            e.stopPropagation();
            setEditando(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={`min-h-16 whitespace-pre-wrap break-words ${editable ? "cursor-text" : ""}`}
        >
          {renderizarTextoNota(texto)}
        </p>
      )}

      {nota.enviadaPorNombre && (
        <p className="truncate text-right text-[10px] font-medium italic opacity-70">— {nota.enviadaPorNombre}</p>
      )}

      {arrastrable && editable && (
        <div
          onPointerDown={handleResizePointerDown}
          title="Arrastra para cambiar el tamaño"
          className="absolute -right-1 -bottom-1 flex h-4 w-4 cursor-nwse-resize items-center justify-center rounded-full border border-black/10 bg-white/90 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Maximize2 className="h-2.5 w-2.5 text-foreground/70" />
        </div>
      )}

      <Modal
        open={mostrarExpandir}
        onClose={() => (editable ? guardarBorrador() : setMostrarExpandir(false))}
        title="Nota"
        size="md"
      >
        {editable ? (
          <div className="space-y-3">
            <BarraFormato valor={borrador} onCambiar={setBorrador} textareaRef={textareaModalRef} />
            <textarea
              ref={textareaModalRef}
              autoFocus
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              maxLength={280}
              rows={8}
              className="w-full resize-none rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={guardarBorrador}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Guardar
              </button>
              <span className="text-xs text-muted-foreground">{borrador.length}/280</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-base whitespace-pre-wrap break-words text-foreground">{renderizarTextoNota(texto)}</p>
            {nota.enviadaPorNombre && (
              <p className="text-right text-xs font-medium italic text-muted-foreground">— {nota.enviadaPorNombre}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
