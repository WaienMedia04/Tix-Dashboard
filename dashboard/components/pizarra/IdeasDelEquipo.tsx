"use client";

import { useCallback, useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { type PizarraPost, crearPizarraPost, fetchPizarraPosts } from "@/lib/api";
import { PizarraPostCard } from "./PizarraPostCard";
import { PizarraPaginacion } from "./PizarraPaginacion";
import { estiloWidget, type TemaWidgets } from "@/lib/pizarra-temas";

const IDEAS_POR_PAGINA = 5;

/** Tarjeta de "Idea del día" (doc "Actualización Mural 2.0" #12) — reutiliza el post/reacción/comentario de la pizarra, solo filtrado a esIdea:true. */
export function IdeasDelEquipo({
  slug,
  esModerador,
  tema,
}: {
  slug: string;
  esModerador: boolean;
  tema: TemaWidgets;
}) {
  const [ideas, setIdeas] = useState<PizarraPost[] | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [texto, setTexto] = useState("");
  const [publicando, setPublicando] = useState(false);
  const estilo = estiloWidget(tema, "amarillo");

  const cargar = useCallback(
    (p: number) => {
      fetchPizarraPosts(slug, { page: p, limit: IDEAS_POR_PAGINA, soloIdeas: true })
        .then((r) => {
          if (r.data.length === 0 && p > 1) {
            setPagina(p - 1);
            return;
          }
          setIdeas(r.data);
          setTotalPaginas(r.totalPaginas);
        })
        .catch(() => setIdeas((prev) => prev ?? []));
    },
    [slug],
  );

  useEffect(() => {
    cargar(pagina);
  }, [cargar, pagina]);

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || publicando) return;
    setPublicando(true);
    try {
      await crearPizarraPost(slug, texto.trim(), true);
      setTexto("");
      setPagina(1);
      cargar(1);
    } catch {
      // el usuario puede reintentar
    } finally {
      setPublicando(false);
    }
  }

  return (
    <div className={`rounded-xl border p-3.5 sm:col-span-2 ${estilo.card}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${estilo.badge}`}>
          <Lightbulb className={`h-3.5 w-3.5 ${estilo.icon}`} />
        </span>
        <span className="text-xs font-semibold text-zinc-500">Idea del día</span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">¿Tienes una idea para mejorar el equipo? Compártela aquí.</p>

      <form onSubmit={(e) => void publicar(e)} className="mt-2.5 flex items-center gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Propón una mejora…"
          maxLength={500}
          disabled={publicando}
          className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none focus:border-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!texto.trim() || publicando}
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publicando ? "Publicando…" : "Compartir"}
        </button>
      </form>

      <div className="mt-3 space-y-3">
        {ideas === null && <div className="h-16 animate-pulse rounded-lg bg-white/60" />}
        {ideas !== null && ideas.length === 0 && (
          <p className="text-xs text-zinc-500">Todavía no hay ideas compartidas — ¡sé el primero!</p>
        )}
        {ideas?.map((idea) => (
          <PizarraPostCard
            key={idea.id}
            slug={slug}
            post={idea}
            puedeBorrar={idea.propio || esModerador}
            puedeAprobarIdeas={esModerador}
            onActualizado={(actualizado) =>
              setIdeas((prev) => prev?.map((i) => (i.id === actualizado.id ? actualizado : i)) ?? prev)
            }
            onBorrado={() => cargar(pagina)}
          />
        ))}
      </div>

      <div className="mt-2">
        <PizarraPaginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>
    </div>
  );
}
