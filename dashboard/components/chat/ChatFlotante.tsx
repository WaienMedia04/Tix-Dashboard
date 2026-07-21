"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { fetchChatResumen } from "@/lib/api";
import { ChatPanel } from "./ChatPanel";

const INTERVALO_CERRADO_MS = 15_000;
const INTERVALO_ABIERTO_MS = 4_000;

export function ChatFlotante({ slug }: { slug: string }) {
  const [abierto, setAbierto] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);
  const [hayChisme, setHayChisme] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const refrescarResumen = useCallback(() => {
    fetchChatResumen(slug)
      .then((r) => {
        setNoLeidos(r.noLeidosTotal);
        setHayChisme(r.hayChismeSinLeer);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    refrescarResumen();
    const id = setInterval(refrescarResumen, abierto ? INTERVALO_ABIERTO_MS : INTERVALO_CERRADO_MS);
    return () => clearInterval(id);
  }, [refrescarResumen, abierto]);

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickFuera);
      document.removeEventListener("keydown", onEscape);
    };
  }, [abierto]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div ref={contenedorRef} className="pb-safe pr-safe fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 print:hidden">
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed inset-2 bottom-20 z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-popover shadow-elegant sm:absolute sm:inset-auto sm:right-0 sm:bottom-[calc(100%+0.75rem)] sm:h-[600px] sm:max-h-[75vh] sm:w-[380px]"
          >
            <ChatPanel slug={slug} onCerrar={() => setAbierto(false)} onActividad={refrescarResumen} />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar chat" : "Abrir chat del equipo"}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-elegant transition-transform hover:scale-105 ${
          hayChisme && !abierto ? "animate-chisme-blink" : "bg-gradient-primary"
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        {noLeidos > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold text-white ring-2 ring-background">
            {noLeidos > 9 ? "9+" : noLeidos}
          </span>
        )}
      </button>
    </div>,
    document.body,
  );
}
