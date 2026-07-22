"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { type PizarraPost, fetchPizarraPosts } from "@/lib/api";
import { PizarraComposer } from "./PizarraComposer";
import { PizarraPostCard } from "./PizarraPostCard";

const INTERVALO_POLLING_MS = 15_000;

/** Pizarra compartida por toda la empresa — mismo contenido se vea desde el mural de quien se vea. */
export function PizarraSocial({ slug, miRol }: { slug: string; miRol: string }) {
  const [posts, setPosts] = useState<PizarraPost[] | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(false);

  const cargar = useCallback(() => {
    fetchPizarraPosts(slug)
      .then((r) => {
        setPosts(r.data);
        setHayMas(r.hayMas);
      })
      .catch(() => setPosts((prev) => prev ?? []));
  }, [slug]);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, INTERVALO_POLLING_MS);
    return () => clearInterval(id);
  }, [cargar]);

  async function cargarMas() {
    if (!posts || posts.length === 0) return;
    setCargandoMas(true);
    try {
      const ultimo = posts[posts.length - 1];
      const r = await fetchPizarraPosts(slug, { cursorId: ultimo.id });
      setPosts((prev) => [...(prev ?? []), ...r.data]);
      setHayMas(r.hayMas);
    } catch {
      // el usuario puede reintentar
    } finally {
      setCargandoMas(false);
    }
  }

  function actualizarPost(actualizado: PizarraPost) {
    setPosts((prev) => prev?.map((p) => (p.id === actualizado.id ? actualizado : p)) ?? prev);
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4 px-4 pt-2 pb-10">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <ClipboardList className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">Pizarra del equipo</h2>
          <p className="text-xs text-muted-foreground">Agradecimientos, avisos y menciones — la ve toda la empresa</p>
        </div>
      </div>

      <PizarraComposer slug={slug} onPublicado={(post) => setPosts((prev) => [post, ...(prev ?? [])])} />

      {posts === null && <div className="h-24 animate-pulse rounded-xl bg-muted" />}
      {posts !== null && posts.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">Todavía no hay nada en la pizarra. ¡Sé el primero!</p>
      )}
      {posts?.map((post) => (
        <PizarraPostCard
          key={post.id}
          slug={slug}
          post={post}
          puedeBorrar={post.propio || miRol === "CEO" || miRol === "RRHH"}
          onActualizado={actualizarPost}
          onBorrado={(id) => setPosts((prev) => prev?.filter((p) => p.id !== id) ?? prev)}
        />
      ))}
      {hayMas && (
        <button
          onClick={() => void cargarMas()}
          disabled={cargandoMas}
          className="mx-auto block text-xs font-medium text-primary hover:underline disabled:opacity-50"
        >
          {cargandoMas ? "Cargando…" : "Cargar más"}
        </button>
      )}
    </section>
  );
}
