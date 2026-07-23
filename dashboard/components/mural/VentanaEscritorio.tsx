"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Minus, X } from "lucide-react";
import { fondoMuralCss } from "@/lib/mural-fondos";

/**
 * "Ventana" de escritorio reutilizable — a diferencia de Modal, no se cierra
 * al hacer click afuera (las apps de un escritorio real no se comportan
 * así); solo Minimizar o Cerrar la ocultan, y el ícono correspondiente en
 * el Dock siempre queda disponible para volver a abrirla. Se puede arrastrar
 * desde la barra de título, y el fondo siempre es oscuro y difuminado (con el
 * color que el talento eligió para su mural) para que el texto se lea bien
 * sin importar el fondo elegido o el tema claro/oscuro de la app.
 */
export function VentanaEscritorio({
  abierta,
  titulo,
  icono,
  onMinimizar,
  onCerrar,
  ancho = "max-w-2xl",
  fondoId,
  children,
}: {
  abierta: boolean;
  titulo: string;
  icono: React.ReactNode;
  onMinimizar: () => void;
  onCerrar: () => void;
  ancho?: string;
  /** id del fondo elegido por el dueño del mural — tiñe el cristal de la ventana. */
  fondoId: string;
  children: React.ReactNode;
}) {
  const areaArrastreRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (!abierta) return;
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onMinimizar();
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [abierta, onMinimizar]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {abierta && (
        <div
          ref={areaArrastreRef}
          className="pt-safe pb-safe fixed inset-0 z-40 flex items-start justify-center p-3 pointer-events-none sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            dragConstraints={areaArrastreRef}
            className={`dark pointer-events-auto relative flex max-h-[85vh] w-full ${ancho} flex-col overflow-hidden rounded-2xl border border-border shadow-elegant`}
          >
            {/* Cristal: mismo color que el fondo del mural, difuminado y oscurecido para que el texto siempre contraste. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-10 -z-10 blur-2xl"
              style={{ background: fondoMuralCss(fondoId) }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-black/72" />

            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex shrink-0 cursor-grab items-center justify-between gap-2 border-b border-border bg-black/20 px-4 py-2.5 touch-none select-none active:cursor-grabbing"
            >
              <div className="flex min-w-0 items-center gap-2">
                {icono}
                <p className="truncate text-sm font-semibold text-foreground">{titulo}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={onMinimizar}
                  aria-label="Minimizar"
                  title="Minimizar"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={onCerrar}
                  aria-label="Cerrar"
                  title="Cerrar"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
