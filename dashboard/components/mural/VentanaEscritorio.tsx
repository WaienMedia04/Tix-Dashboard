"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, X } from "lucide-react";

/**
 * "Ventana" de escritorio reutilizable — a diferencia de Modal, no se cierra
 * al hacer click afuera (las apps de un escritorio real no se comportan
 * así); solo Minimizar o Cerrar la ocultan, y el ícono correspondiente en
 * el Dock siempre queda disponible para volver a abrirla.
 */
export function VentanaEscritorio({
  abierta,
  titulo,
  icono,
  onMinimizar,
  onCerrar,
  ancho = "max-w-2xl",
  children,
}: {
  abierta: boolean;
  titulo: string;
  icono: React.ReactNode;
  onMinimizar: () => void;
  onCerrar: () => void;
  ancho?: string;
  children: React.ReactNode;
}) {
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
        <div className="pt-safe pb-safe fixed inset-0 z-40 flex items-start justify-center p-3 pointer-events-none sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={`pointer-events-auto flex max-h-[85vh] w-full ${ancho} flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant`}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                {icono}
                <p className="truncate text-sm font-semibold text-foreground">{titulo}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={onMinimizar}
                  aria-label="Minimizar"
                  title="Minimizar"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
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
