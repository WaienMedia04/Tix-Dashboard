"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const TAMANOS: Record<"md" | "lg" | "xl", string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: string;
  size?: "md" | "lg" | "xl";
  children: React.ReactNode;
}) {
  const tituloId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    disparadorRef.current = document.activeElement;
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      if (disparadorRef.current instanceof HTMLElement) {
        disparadorRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="pt-safe pb-safe fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`relative z-10 max-h-[85vh] w-full ${TAMANOS[size]} overflow-y-auto rounded-xl border border-border bg-popover shadow-elegant outline-none`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-popover px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <h2 id={tituloId} className="truncate text-base font-semibold text-foreground">
                  {title}
                </h2>
                {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
