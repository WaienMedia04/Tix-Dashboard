"use client";

import { useEffect, useRef, useState } from "react";
import { Flame, Send } from "lucide-react";
import { enviarChatMensaje, fetchChatMensajes, type ChatMensaje } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

const INTERVALO_POLLING_MS = 3_500;

function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit" });
}

export function ChatHilo({
  slug,
  conversacionId,
  titulo,
  onMensajeLeido,
}: {
  slug: string;
  conversacionId: string;
  titulo: string;
  /** Se llama cada vez que se refresca el hilo — permite que el panel refresque el badge de no leídos. */
  onMensajeLeido?: () => void;
}) {
  const [mensajes, setMensajes] = useState<ChatMensaje[] | null>(null);
  const [texto, setTexto] = useState("");
  const [modoChisme, setModoChisme] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const alFondoRef = useRef(true);

  useEffect(() => {
    let cancelado = false;

    function cargar() {
      fetchChatMensajes(slug, conversacionId)
        .then((resp) => {
          if (cancelado) return;
          setMensajes(resp.data);
          onMensajeLeido?.();
        })
        .catch(() => {
          if (!cancelado) setMensajes((prev) => prev ?? []);
        });
    }

    cargar();
    const id = setInterval(cargar, INTERVALO_POLLING_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, conversacionId]);

  useEffect(() => {
    if (!scrollRef.current || !alFondoRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    alFondoRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function handleEnviar() {
    const contenido = texto.trim();
    if (!contenido || enviando) return;
    setEnviando(true);
    alFondoRef.current = true;
    try {
      const mensaje = await enviarChatMensaje(slug, conversacionId, {
        texto: contenido,
        esChisme: modoChisme,
      });
      setMensajes((prev) => [...(prev ?? []), mensaje]);
      setTexto("");
      setModoChisme(false);
    } catch {
      // silencioso: el próximo poll reintenta el estado real del hilo
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {mensajes === null && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Cargando…</div>
        )}
        {mensajes !== null && mensajes.length === 0 && (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Todavía no hay mensajes en {titulo}. ¡Rompe el hielo!
          </div>
        )}
        {mensajes?.map((m) => (
          <div key={m.id} className={`flex ${m.propio ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[80%] items-end gap-2 ${m.propio ? "flex-row-reverse" : ""}`}>
              {!m.propio && <Avatar nombreCompleto={m.autorNombre} fotoUrl={m.autorFotoUrl} size="sm" />}
              <div>
                {!m.propio && <p className="mb-0.5 px-1 text-[11px] font-medium text-muted-foreground">{m.autorNombre}</p>}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    m.esChisme
                      ? "border-2 border-gold bg-gradient-to-br from-gold/25 to-gold/5 text-foreground shadow-[0_0_16px_-4px_var(--color-gold)]"
                      : m.propio
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-accent text-accent-foreground"
                  }`}
                >
                  {m.esChisme && (
                    <p className="mb-1 flex items-center gap-1 text-[11px] font-bold tracking-wide text-gold uppercase">
                      <Flame className="h-3.5 w-3.5" /> Chisme
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                </div>
                <p className={`mt-0.5 px-1 text-[10px] text-muted-foreground/70 ${m.propio ? "text-right" : ""}`}>
                  {horaCorta(m.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-border p-2.5">
        {modoChisme && (
          <p className="mb-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-gold">
            <Flame className="h-3.5 w-3.5" /> Esto se enviará como chisme destacado
          </p>
        )}
        <div className="flex items-end gap-1.5">
          <button
            type="button"
            onClick={() => setModoChisme((v) => !v)}
            aria-pressed={modoChisme}
            title="Marcar como chisme"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              modoChisme
                ? "bg-gold text-gold-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-4.5 w-4.5" />
          </button>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleEnviar();
              }
            }}
            placeholder={modoChisme ? "Escribe el chisme…" : "Escribe un mensaje…"}
            rows={1}
            className="max-h-24 min-h-9 flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
          <button
            type="button"
            onClick={() => void handleEnviar()}
            disabled={!texto.trim() || enviando}
            aria-label="Enviar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
