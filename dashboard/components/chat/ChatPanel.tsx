"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Flame, LogOut, Plus, Users, X } from "lucide-react";
import {
  fetchChatConversaciones,
  salirDeChatGrupo,
  type ChatConversacion,
} from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { ChatHilo } from "./ChatHilo";
import { ChatNuevaConversacion } from "./ChatNuevaConversacion";

const INTERVALO_POLLING_MS = 4_000;

type Vista = { tipo: "lista" } | { tipo: "nueva" } | { tipo: "hilo"; conversacionId: string };

function tiempoRelativo(iso: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return "ahora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h`;
  const dias = Math.floor(horas / 24);
  return `${dias} d`;
}

function nombreConversacion(c: ChatConversacion): string {
  return c.nombre ?? "Chat";
}

export function ChatPanel({
  slug,
  onCerrar,
  onActividad,
}: {
  slug: string;
  onCerrar: () => void;
  onActividad?: () => void;
}) {
  const [vista, setVista] = useState<Vista>({ tipo: "lista" });
  const [conversaciones, setConversaciones] = useState<ChatConversacion[] | null>(null);

  const cargarConversaciones = useCallback(() => {
    fetchChatConversaciones(slug)
      .then((data) => setConversaciones(data))
      .catch(() => setConversaciones((prev) => prev ?? []));
  }, [slug]);

  useEffect(() => {
    cargarConversaciones();
    const id = setInterval(cargarConversaciones, INTERVALO_POLLING_MS);
    return () => clearInterval(id);
  }, [cargarConversaciones]);

  const activa = vista.tipo === "hilo" ? conversaciones?.find((c) => c.id === vista.conversacionId) : undefined;

  async function handleSalirDelGrupo(conversacionId: string) {
    if (!confirm("¿Salir de este grupo?")) return;
    try {
      await salirDeChatGrupo(slug, conversacionId);
      setVista({ tipo: "lista" });
      cargarConversaciones();
      onActividad?.();
    } catch {
      // el usuario puede reintentar desde la lista
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {vista.tipo !== "lista" && (
            <button
              onClick={() => setVista({ tipo: "lista" })}
              aria-label="Volver"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          {vista.tipo === "lista" && <p className="text-sm font-semibold text-foreground">Chat del equipo</p>}
          {vista.tipo === "nueva" && <p className="text-sm font-semibold text-foreground">Nueva conversación</p>}
          {vista.tipo === "hilo" && activa && (
            <div className="flex min-w-0 items-center gap-2">
              {activa.esGrupo ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </span>
              ) : (
                <Avatar nombreCompleto={nombreConversacion(activa)} fotoUrl={activa.fotoUrl} size="sm" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{nombreConversacion(activa)}</p>
                {activa.esGrupo && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {activa.participantes.length} integrantes
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {vista.tipo === "lista" && (
            <button
              onClick={() => setVista({ tipo: "nueva" })}
              aria-label="Nueva conversación"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          )}
          {vista.tipo === "hilo" && activa?.esGrupo && (
            <button
              onClick={() => void handleSalirDelGrupo(activa.id)}
              aria-label="Salir del grupo"
              title="Salir del grupo"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onCerrar}
            aria-label="Cerrar chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {vista.tipo === "lista" && (
          <div className="h-full overflow-y-auto">
            {conversaciones === null && <div className="h-24 animate-pulse" />}
            {conversaciones !== null && conversaciones.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm text-muted-foreground">Todavía no tienes conversaciones.</p>
                <button
                  onClick={() => setVista({ tipo: "nueva" })}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Empieza un chat
                </button>
              </div>
            )}
            {conversaciones?.map((c) => (
              <button
                key={c.id}
                onClick={() => setVista({ tipo: "hilo", conversacionId: c.id })}
                className={`flex w-full items-center gap-2.5 border-b border-border px-3 py-3 text-left transition-colors hover:bg-accent ${
                  c.tieneChismeSinLeer ? "bg-gold/5" : ""
                }`}
              >
                {c.esGrupo ? (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Users className="h-4.5 w-4.5 text-muted-foreground" />
                  </span>
                ) : (
                  <Avatar nombreCompleto={nombreConversacion(c)} fotoUrl={c.fotoUrl} size="md" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-foreground">{nombreConversacion(c)}</p>
                    {c.tieneChismeSinLeer && <Flame className="h-3.5 w-3.5 shrink-0 animate-pulse text-gold" />}
                  </div>
                  <p className={`truncate text-xs ${c.noLeidos > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {c.ultimoMensaje
                      ? `${c.ultimoMensaje.esChisme ? "🔥 " : ""}${c.ultimoMensaje.texto}`
                      : "Sin mensajes todavía"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {c.ultimoMensaje && (
                    <span className="text-[10px] text-muted-foreground/70">{tiempoRelativo(c.ultimoMensaje.createdAt)}</span>
                  )}
                  {c.noLeidos > 0 && (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {c.noLeidos > 9 ? "9+" : c.noLeidos}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {vista.tipo === "nueva" && (
          <ChatNuevaConversacion
            slug={slug}
            onCreada={(conversacion) => {
              cargarConversaciones();
              setVista({ tipo: "hilo", conversacionId: conversacion.id });
            }}
          />
        )}

        {vista.tipo === "hilo" && (
          <ChatHilo
            slug={slug}
            conversacionId={vista.conversacionId}
            titulo={activa ? nombreConversacion(activa) : "el chat"}
            onMensajeLeido={() => {
              cargarConversaciones();
              onActividad?.();
            }}
          />
        )}
      </div>
    </div>
  );
}
