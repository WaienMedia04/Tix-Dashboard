"use client";

import { useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { type NotaMural, actualizarNotaMural, borrarNotaMural } from "@/lib/api";
import { COLORES_NOTA, colorNotaEstilo } from "@/lib/mural-fondos";

const ESCALA_MIN = 0.7;
const ESCALA_MAX = 1.8;

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
  const [texto, setTexto] = useState(nota.texto);
  const [editando, setEditando] = useState(false);
  const [mostrarColores, setMostrarColores] = useState(false);
  const estilo = colorNotaEstilo(nota.color);

  function handlePointerDown(e: React.PointerEvent) {
    if (!arrastrable || editando) return;
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

  return (
    <div
      ref={notaRef}
      onPointerDown={handlePointerDown}
      className={`group flex w-36 flex-col gap-1.5 rounded-sm p-3 text-xs shadow-elegant ${
        arrastrable ? "absolute" : "relative"
      } ${arrastrable ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={
        arrastrable
          ? ({
              left: `${nota.posX}%`,
              top: `${nota.posY}%`,
              background: estilo.bg,
              color: estilo.texto,
              "--nota-escala": nota.escala,
              transform: `rotate(${nota.rotacion}deg) scale(var(--nota-escala))`,
              transformOrigin: "top left",
              zIndex: nota.zIndex,
            } as React.CSSProperties)
          : { background: estilo.bg, color: estilo.texto }
      }
    >
      {editable && (
        <div className="flex items-start justify-between gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
        </div>
      )}

      {editable && mostrarColores && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-6 left-2 z-10 flex flex-wrap gap-1 rounded-md bg-white/90 p-1.5 shadow-elegant"
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
        </div>
      )}

      {editable && editando ? (
        <textarea
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={guardarTexto}
          onPointerDown={(e) => e.stopPropagation()}
          maxLength={280}
          rows={4}
          className="w-full resize-none bg-transparent text-xs outline-none"
        />
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
          {texto}
        </p>
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
    </div>
  );
}
