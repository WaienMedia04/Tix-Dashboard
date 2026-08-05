"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Flame, LogOut, MessageSquare, Plus, Search, Trash2, Users, X } from "lucide-react";
import {
  eliminarChatConversacion,
  fetchChatConversaciones,
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
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [busqueda, setBusqueda] = useState("");

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

  const conversacionesFiltradas = useMemo(() => {
    if (!conversaciones) return conversaciones;
    const q = busqueda.trim().toLowerCase();
    if (!q) return conversaciones;
    return conversaciones.filter((c) => nombreConversacion(c).toLowerCase().includes(q));
  }, [conversaciones, busqueda]);

  async function handleEliminarConversacion(conversacionId: string, esGrupo: boolean) {
    const pregunta = esGrupo ? "¿Salir de este grupo?" : "¿Eliminar esta conversación?";
    if (!confirm(pregunta)) return;

    setConversaciones((prev) => prev?.filter((c) => c.id !== conversacionId) ?? prev);
    if (vista.tipo === "hilo" && vista.conversacionId === conversacionId) {
      setVista({ tipo: "lista" });
    }
    try {
      await eliminarChatConversacion(slug, conversacionId);
      onActividad?.();
    } catch {
      cargarConversaciones();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-col border-b border-white/10">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {vista.tipo !== "lista" && (
              <button
                onClick={() => setVista({ tipo: "lista" })}
                aria-label="Volver"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            {vista.tipo === "lista" && (
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                  <MessageSquare className="h-3.5 w-3.5 text-white" />
                </span>
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">Chat del equipo</p>
              </div>
            )}
            {vista.tipo === "nueva" && <p className="text-sm font-semibold text-foreground">Nueva conversación</p>}
            {vista.tipo === "hilo" && activa && (
              <div className="flex min-w-0 items-center gap-2">
                {activa.esGrupo ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </span>
                ) : (
                  <Avatar
                    nombreCompleto={nombreConversacion(activa)}
                    fotoUrl={activa.fotoUrl}
                    size="sm"
                    className="ring-1 ring-white/10"
                  />
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
              <>
                <button
                  onClick={() => setMostrarBusqueda((v) => !v)}
                  aria-label="Buscar conversación"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    mostrarBusqueda ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Search className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setVista({ tipo: "nueva" })}
                  aria-label="Nueva conversación"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm transition-transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </>
            )}
            {vista.tipo === "hilo" && activa && (
              <button
                onClick={() => void handleEliminarConversacion(activa.id, activa.esGrupo)}
                aria-label={activa.esGrupo ? "Salir del grupo" : "Eliminar conversación"}
                title={activa.esGrupo ? "Salir del grupo" : "Eliminar conversación"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                {activa.esGrupo ? <LogOut className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={onCerrar}
              aria-label="Cerrar chat"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
        {vista.tipo === "lista" && mostrarBusqueda && (
          <div className="px-3 pb-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full min-w-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        )}
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
            {conversaciones !== null && conversaciones.length > 0 && conversacionesFiltradas?.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Sin resultados para &ldquo;{busqueda}&rdquo;.
              </p>
            )}
            {conversacionesFiltradas?.map((c) => (
              <div
                key={c.id}
                className={`group flex w-full items-center gap-1 border-b border-white/[0.06] transition-colors hover:bg-white/[0.04] ${
                  c.tieneChismeSinLeer ? "bg-gold/5" : ""
                }`}
              >
                <button
                  onClick={() => setVista({ tipo: "hilo", conversacionId: c.id })}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                >
                  {c.esGrupo ? (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                      <Users className="h-4.5 w-4.5 text-muted-foreground" />
                    </span>
                  ) : (
                    <Avatar
                      nombreCompleto={nombreConversacion(c)}
                      fotoUrl={c.fotoUrl}
                      size="md"
                      className="ring-1 ring-white/10"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">{nombreConversacion(c)}</p>
                      {c.tieneChismeSinLeer && <Flame className="h-3.5 w-3.5 shrink-0 animate-pulse text-gold" />}
                    </div>
                    <p className={`truncate text-xs ${c.noLeidos > 0 ? "text-foreground/80" : "text-muted-foreground"}`}>
                      {c.ultimoMensaje
                        ? `${c.ultimoMensaje.esChisme ? "🔥 " : ""}${c.ultimoMensaje.texto}`
                        : "Sin mensajes todavía"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {c.ultimoMensaje && (
                      <span className="text-[10px] text-muted-foreground/60">{tiempoRelativo(c.ultimoMensaje.createdAt)}</span>
                    )}
                    {c.noLeidos > 0 && (
                      <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 px-1 text-[10px] font-bold text-white">
                        {c.noLeidos > 9 ? "9+" : c.noLeidos}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => void handleEliminarConversacion(c.id, c.esGrupo)}
                  aria-label={c.esGrupo ? "Salir del grupo" : "Eliminar conversación"}
                  title={c.esGrupo ? "Salir del grupo" : "Eliminar conversación"}
                  className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/40 opacity-60 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
