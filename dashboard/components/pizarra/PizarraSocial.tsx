"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { type PizarraPanel, type PizarraPost, fetchPizarraPanel, fetchPizarraPosts } from "@/lib/api";
import { PizarraComposer } from "./PizarraComposer";
import { PizarraPostCard } from "./PizarraPostCard";
import { PizarraReconocimientoBanner } from "./PizarraReconocimientoBanner";
import { PizarraNuevoReconocimientoModal } from "./PizarraNuevoReconocimientoModal";
import { PizarraEncuestaCard } from "./PizarraEncuestaCard";
import { PizarraNuevaEncuestaModal } from "./PizarraNuevaEncuestaModal";
import { PizarraContenidoDiarioBanner } from "./PizarraContenidoDiario";
import { PizarraTimeline } from "./PizarraTimeline";
import { PizarraTrivia } from "./PizarraTrivia";

const INTERVALO_POLLING_MS = 15_000;
const INTERVALO_PANEL_MS = 60_000;

/** Pizarra compartida por toda la empresa — mismo contenido se vea desde el mural de quien se vea. */
export function PizarraSocial({ slug, miRol }: { slug: string; miRol: string }) {
  const esModerador = miRol === "CEO" || miRol === "RRHH";

  const [posts, setPosts] = useState<PizarraPost[] | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(false);
  const [panel, setPanel] = useState<PizarraPanel | null>(null);
  const [mostrarNuevaEncuesta, setMostrarNuevaEncuesta] = useState(false);
  const [mostrarNuevoReconocimiento, setMostrarNuevoReconocimiento] = useState(false);
  const [prefillComposer, setPrefillComposer] = useState<{ texto: string } | null>(null);

  const cargar = useCallback(() => {
    fetchPizarraPosts(slug)
      .then((r) => {
        setPosts(r.data);
        setHayMas(r.hayMas);
      })
      .catch(() => setPosts((prev) => prev ?? []));
  }, [slug]);

  const cargarPanel = useCallback(() => {
    fetchPizarraPanel(slug)
      .then(setPanel)
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, INTERVALO_POLLING_MS);
    return () => clearInterval(id);
  }, [cargar]);

  useEffect(() => {
    cargarPanel();
    const id = setInterval(cargarPanel, INTERVALO_PANEL_MS);
    return () => clearInterval(id);
  }, [cargarPanel]);

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
    <div className="w-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 lg:max-w-2xl">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 sm:px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
          <ClipboardList className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-zinc-900">Pizarra del equipo</h2>
          <p className="text-xs text-zinc-500">Agradecimientos, avisos y menciones — la ve toda la empresa</p>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <PizarraReconocimientoBanner
          reconocimiento={panel?.reconocimientoActivo ?? null}
          puedeFijar={esModerador}
          onFijar={() => setMostrarNuevoReconocimiento(true)}
        />

        <PizarraEncuestaCard
          slug={slug}
          encuesta={panel?.encuestaActiva ?? null}
          puedeCrear={esModerador}
          onActualizada={(e) => setPanel((prev) => (prev ? { ...prev, encuestaActiva: e } : prev))}
          onCrear={() => setMostrarNuevaEncuesta(true)}
        />

        <PizarraContenidoDiarioBanner
          contenido={panel?.contenidoDiario ?? null}
          onResponder={(pregunta) => setPrefillComposer({ texto: `❓ ${pregunta}: ` })}
        />

        <PizarraTimeline slug={slug} />

        <PizarraTrivia slug={slug} />

        <PizarraComposer
          slug={slug}
          onPublicado={(post) => setPosts((prev) => [post, ...(prev ?? [])])}
          prefill={prefillComposer}
        />

        {posts === null && <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />}
        {posts !== null && posts.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-500">Todavía no hay nada en la pizarra. ¡Sé el primero!</p>
        )}
        {posts?.map((post) => (
          <PizarraPostCard
            key={post.id}
            slug={slug}
            post={post}
            puedeBorrar={post.propio || esModerador}
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
      </div>

      <PizarraNuevaEncuestaModal
        slug={slug}
        open={mostrarNuevaEncuesta}
        onClose={() => setMostrarNuevaEncuesta(false)}
        onCreada={(e) => setPanel((prev) => (prev ? { ...prev, encuestaActiva: e } : prev))}
      />
      <PizarraNuevoReconocimientoModal
        slug={slug}
        open={mostrarNuevoReconocimiento}
        onClose={() => setMostrarNuevoReconocimiento(false)}
        onCreado={(r) => setPanel((prev) => (prev ? { ...prev, reconocimientoActivo: r } : prev))}
      />
    </div>
  );
}
