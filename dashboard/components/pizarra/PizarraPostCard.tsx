"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { type PizarraPost, borrarPizarraPost, comentarPizarraPost, reaccionarPizarraPost } from "@/lib/api";
import { renderizarTextoPizarra } from "@/lib/pizarra-texto";
import { EMOJIS_REACCION_PIZARRA } from "@/lib/emojis-reaccion-pizarra.constant";
import { Avatar } from "@/components/Avatar";

function tiempoRelativo(iso: string): string {
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return "ahora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} d`;
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short" });
}

export function PizarraPostCard({
  slug,
  post,
  puedeBorrar,
  onActualizado,
  onBorrado,
}: {
  slug: string;
  post: PizarraPost;
  puedeBorrar: boolean;
  onActualizado: (post: PizarraPost) => void;
  onBorrado: (id: string) => void;
}) {
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [comentario, setComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);

  async function reaccionar(emoji: string) {
    setMostrarSelector(false);
    try {
      const actualizado = await reaccionarPizarraPost(slug, post.id, emoji);
      onActualizado(actualizado);
    } catch {
      // el usuario puede reintentar, el próximo poll corrige el estado
    }
  }

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault();
    if (!comentario.trim()) return;
    setEnviandoComentario(true);
    try {
      const actualizado = await comentarPizarraPost(slug, post.id, comentario.trim());
      onActualizado(actualizado);
      setComentario("");
      setMostrarComentarios(true);
    } catch {
      // el usuario puede reintentar
    } finally {
      setEnviandoComentario(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar esta publicación?")) return;
    onBorrado(post.id);
    try {
      await borrarPizarraPost(slug, post.id);
    } catch {
      // ya se quitó del estado local; no revertimos para no confundir
    }
  }

  const comentariosVisibles = mostrarComentarios ? post.comentarios : post.comentarios.slice(-2);

  return (
    <div className="rounded-xl border border-border bg-card p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar nombreCompleto={post.autor.nombre} fotoUrl={post.autor.fotoUrl} size="sm" />
          <div>
            <p className="text-sm font-semibold text-foreground">{post.autor.nombre}</p>
            <p className="text-[11px] text-muted-foreground">{tiempoRelativo(post.createdAt)}</p>
          </div>
        </div>
        {puedeBorrar && (
          <button
            onClick={() => void eliminar()}
            aria-label="Eliminar publicación"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <p className="mt-2 text-sm whitespace-pre-wrap break-words text-foreground">
        {renderizarTextoPizarra(post.texto)}
      </p>

      <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
        {post.reacciones.map((r) => (
          <button
            key={r.emoji}
            onClick={() => void reaccionar(r.emoji)}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
              r.mia ? "border-primary bg-primary/10" : "border-border hover:bg-accent"
            }`}
          >
            <span>{r.emoji}</span>
            <span className="text-[11px] text-muted-foreground">{r.cantidad}</span>
          </button>
        ))}
        <button
          onClick={() => setMostrarSelector((v) => !v)}
          aria-label="Agregar reacción"
          className="flex h-6 w-6 items-center justify-center rounded-full text-sm text-muted-foreground hover:bg-accent"
        >
          +
        </button>
        {mostrarSelector && (
          <div className="absolute top-full left-0 z-10 mt-1 flex gap-1 rounded-full border border-border bg-popover p-1 shadow-elegant">
            {EMOJIS_REACCION_PIZARRA.map((emoji) => (
              <button
                key={emoji}
                onClick={() => void reaccionar(emoji)}
                className="rounded-full p-1 text-base hover:bg-accent"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {post.comentarios.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-border pt-2.5">
          {post.comentarios.length > 2 && !mostrarComentarios && (
            <button
              onClick={() => setMostrarComentarios(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver los {post.comentarios.length} comentarios
            </button>
          )}
          {comentariosVisibles.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-xs">
              <Avatar nombreCompleto={c.autor.nombre} fotoUrl={c.autor.fotoUrl} size="sm" />
              <p>
                <span className="font-semibold text-foreground">{c.autor.nombre} </span>
                <span className="text-foreground">{renderizarTextoPizarra(c.texto)}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => void enviarComentario(e)} className="mt-2.5 flex items-center gap-2">
        <input
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe un comentario…"
          maxLength={300}
          className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-ring"
        />
        <button
          type="submit"
          disabled={!comentario.trim() || enviandoComentario}
          className="shrink-0 text-xs font-semibold text-primary disabled:opacity-40"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
