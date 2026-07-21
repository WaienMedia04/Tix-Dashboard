"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search, Users } from "lucide-react";
import { crearChatConversacion, fetchChatDirectorio, type ChatConversacion, type ChatPersona } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

const ETIQUETA_ROL: Record<string, string> = {
  CEO: "CEO",
  RRHH: "RRHH",
  MANAGER: "Gerente",
  TALENTO: "Talento",
};

export function ChatNuevaConversacion({
  slug,
  onCreada,
}: {
  slug: string;
  onCreada: (conversacion: ChatConversacion) => void;
}) {
  const [personas, setPersonas] = useState<ChatPersona[] | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChatDirectorio(slug)
      .then(setPersonas)
      .catch(() => setPersonas([]));
  }, [slug]);

  const filtradas = useMemo(() => {
    if (!personas) return [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return personas;
    return personas.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [personas, busqueda]);

  const esGrupo = seleccionados.length > 1;

  function alternar(id: string) {
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleCrear() {
    if (seleccionados.length === 0) return;
    if (esGrupo && !nombreGrupo.trim()) {
      setError("Ponle un nombre al grupo");
      return;
    }
    setError(null);
    setCreando(true);
    try {
      const conversacion = await crearChatConversacion(slug, {
        participanteIds: seleccionados,
        esGrupo,
        nombre: esGrupo ? nombreGrupo.trim() : undefined,
      });
      onCreada(conversacion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la conversación");
    } finally {
      setCreando(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2.5 border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar compañeros…"
            className="w-full rounded-full border border-border bg-background py-2 pr-3 pl-8 text-sm outline-none focus:border-ring"
          />
        </div>
        {seleccionados.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {seleccionados.map((id) => {
              const persona = personas?.find((p) => p.id === id);
              if (!persona) return null;
              return (
                <button
                  key={id}
                  onClick={() => alternar(id)}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {persona.nombre.split(" ")[0]} ×
                </button>
              );
            })}
          </div>
        )}
        {esGrupo && (
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Nombre del grupo
            </label>
            <input
              value={nombreGrupo}
              onChange={(e) => setNombreGrupo(e.target.value)}
              placeholder="Ej. Equipo de Ventas"
              maxLength={60}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {personas === null && <div className="h-24 animate-pulse" />}
        {personas !== null && filtradas.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No se encontraron compañeros.</p>
        )}
        {filtradas.map((p) => {
          const activo = seleccionados.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => alternar(p.id)}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent ${
                activo ? "bg-accent/60" : ""
              }`}
            >
              <Avatar nombreCompleto={p.nombre} fotoUrl={p.fotoUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{p.nombre}</p>
                <p className="text-xs text-muted-foreground">{ETIQUETA_ROL[p.rol] ?? p.rol}</p>
              </div>
              {activo && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <button
          onClick={() => void handleCrear()}
          disabled={seleccionados.length === 0 || creando}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {creando ? "Creando…" : esGrupo ? "Crear grupo" : "Iniciar chat"}
        </button>
      </div>
    </div>
  );
}
