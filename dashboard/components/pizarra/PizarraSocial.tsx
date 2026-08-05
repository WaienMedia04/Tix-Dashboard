"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardList } from "lucide-react";
import { type EmojiClima, type PizarraPanel, type PizarraPost, fetchPizarraPanel, fetchPizarraPosts } from "@/lib/api";
import { PizarraComposer } from "./PizarraComposer";
import { PizarraPostCard } from "./PizarraPostCard";
import { PizarraPaginacion } from "./PizarraPaginacion";
import { WidgetProgreso } from "./WidgetProgreso";
import { WidgetResumenSemanal } from "./WidgetResumenSemanal";
import { WidgetMisiones } from "./WidgetMisiones";
import { WidgetTopEmpresa } from "./WidgetTopEmpresa";
import { IdeasDelEquipo } from "./IdeasDelEquipo";
import { PizarraReconocimientoBanner } from "./PizarraReconocimientoBanner";
import { PizarraNuevoReconocimientoModal } from "./PizarraNuevoReconocimientoModal";
import { PizarraEncuestaCard } from "./PizarraEncuestaCard";
import { PizarraNuevaEncuestaModal } from "./PizarraNuevaEncuestaModal";
import { PizarraContenidoDiarioBanner } from "./PizarraContenidoDiario";
import { PizarraTimeline } from "./PizarraTimeline";
import { PizarraTrivia } from "./PizarraTrivia";
import { WidgetClimaLaboral } from "./WidgetClimaLaboral";
import { WidgetRacha } from "./WidgetRacha";
import { WidgetMisionDelDia } from "./WidgetMisionDelDia";
import { WidgetRankingSemanal } from "./WidgetRankingSemanal";
import { WidgetEstampasRecientes } from "./WidgetEstampasRecientes";
import { WidgetEventosProximos } from "./WidgetEventosProximos";
import { WidgetCumpleanosProximos } from "./WidgetCumpleanosProximos";
import { WidgetTimeCapsule } from "./WidgetTimeCapsule";
import type { TemaWidgets } from "@/lib/pizarra-temas";

const INTERVALO_POLLING_MS = 15_000;
const INTERVALO_PANEL_MS = 60_000;
const POSTS_POR_PAGINA = 10;
const DURACION_XP_GANADA_MS = 2500;

/** Pizarra compartida por toda la empresa — mismo contenido se vea desde el mural de quien se vea. */
export function PizarraSocial({
  slug,
  miRol,
  temaWidgets,
  dentroDeVentana = false,
}: {
  slug: string;
  miRol: string;
  /** Preferencia de quien es dueño del mural que se está viendo — no del usuario logueado. */
  temaWidgets: string;
  /** true cuando VentanaEscritorio ya provee el marco/encabezado — evita duplicarlo. */
  dentroDeVentana?: boolean;
}) {
  const esModerador = miRol === "CEO" || miRol === "RRHH";
  const tema: TemaWidgets = temaWidgets === "solido" ? "solido" : "vibrante";

  const [posts, setPosts] = useState<PizarraPost[] | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [panel, setPanel] = useState<PizarraPanel | null>(null);
  const [mostrarNuevaEncuesta, setMostrarNuevaEncuesta] = useState(false);
  const [mostrarNuevoReconocimiento, setMostrarNuevoReconocimiento] = useState(false);
  const [prefillComposer, setPrefillComposer] = useState<{ texto: string } | null>(null);
  const [xpGanada, setXpGanada] = useState<number | null>(null);
  const xpTotalAnteriorRef = useRef<number | null>(null);

  const cargar = useCallback(
    (p: number) => {
      fetchPizarraPosts(slug, { page: p, limit: POSTS_POR_PAGINA })
        .then((r) => {
          if (r.data.length === 0 && p > 1) {
            setPagina(p - 1);
            return;
          }
          setPosts(r.data);
          setTotalPaginas(r.totalPaginas);
        })
        .catch(() => setPosts((prev) => prev ?? []));
    },
    [slug],
  );

  const cargarPanel = useCallback(() => {
    fetchPizarraPanel(slug)
      .then((p) => {
        setPanel(p);
        const xpNuevo = p.progresoPropio?.xpTotal ?? null;
        const xpAnterior = xpTotalAnteriorRef.current;
        if (xpAnterior !== null && xpNuevo !== null && xpNuevo > xpAnterior) {
          setXpGanada(xpNuevo - xpAnterior);
          setTimeout(() => setXpGanada(null), DURACION_XP_GANADA_MS);
        }
        xpTotalAnteriorRef.current = xpNuevo;
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    cargar(pagina);
    const id = setInterval(() => cargar(pagina), INTERVALO_POLLING_MS);
    return () => clearInterval(id);
  }, [cargar, pagina]);

  useEffect(() => {
    cargarPanel();
    const id = setInterval(cargarPanel, INTERVALO_PANEL_MS);
    return () => clearInterval(id);
  }, [cargarPanel]);

  function irAPagina(p: number) {
    if (p < 1 || p > totalPaginas) return;
    setPagina(p);
  }

  function actualizarPost(actualizado: PizarraPost) {
    setPosts((prev) => prev?.map((p) => (p.id === actualizado.id ? actualizado : p)) ?? prev);
  }

  return (
    <div
      className={
        dentroDeVentana
          ? "w-full min-w-0 bg-transparent"
          : "w-full min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5"
      }
    >
      {!dentroDeVentana && (
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 sm:px-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-zinc-900">Pizarra del equipo</h2>
            <p className="text-xs text-zinc-500">Agradecimientos, avisos y menciones — la ve toda la empresa</p>
          </div>
        </div>
      )}

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <PizarraReconocimientoBanner
              reconocimiento={panel?.reconocimientoActivo ?? null}
              puedeFijar={esModerador}
              onFijar={() => setMostrarNuevoReconocimiento(true)}
            />
          </div>

          <div className="sm:col-span-2">
            <WidgetProgreso progreso={panel?.progresoPropio ?? null} tema={tema} xpGanada={xpGanada} />
          </div>

          <div className="sm:col-span-2">
            <WidgetMisiones tema={tema} />
          </div>

          <div className="sm:col-span-2">
            <WidgetResumenSemanal tema={tema} />
          </div>

          <WidgetClimaLaboral
            slug={slug}
            climaHoy={panel?.climaHoy ?? null}
            esModerador={esModerador}
            onRespondido={(emoji: EmojiClima) =>
              setPanel((prev) => (prev ? { ...prev, climaHoy: emoji } : prev))
            }
            tema={tema}
          />
          <WidgetRacha racha={panel?.rachaPropia ?? null} tema={tema} />
          <WidgetMisionDelDia mision={panel?.misionDelDia ?? ""} tema={tema} />

          <PizarraContenidoDiarioBanner
            contenido={panel?.contenidoDiario ?? null}
            onResponder={(pregunta) => setPrefillComposer({ texto: `❓ ${pregunta}: ` })}
          />

          <PizarraEncuestaCard
            slug={slug}
            encuesta={panel?.encuestaActiva ?? null}
            puedeCrear={esModerador}
            onActualizada={(e) => setPanel((prev) => (prev ? { ...prev, encuestaActiva: e } : prev))}
            onCrear={() => setMostrarNuevaEncuesta(true)}
          />

          <PizarraTrivia slug={slug} />

          <IdeasDelEquipo slug={slug} esModerador={esModerador} tema={tema} />

          {panel && (
            <div className="sm:col-span-2">
              <WidgetRankingSemanal ranking={panel.rankingSemanal} tema={tema} />
            </div>
          )}

          <div className="sm:col-span-2">
            <WidgetTopEmpresa slug={slug} tema={tema} />
          </div>

          {panel && <WidgetEstampasRecientes estampas={panel.estampasRecientes} tema={tema} />}
          {panel && <WidgetEventosProximos eventos={panel.eventosProximos} tema={tema} />}
          <WidgetCumpleanosProximos slug={slug} tema={tema} />
          <WidgetTimeCapsule slug={slug} tema={tema} />

          <div className="sm:col-span-2">
            <PizarraTimeline slug={slug} />
          </div>
        </div>

        <PizarraComposer
          slug={slug}
          onPublicado={() => {
            if (pagina === 1) cargar(1);
            else setPagina(1);
          }}
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
            onBorrado={() => cargar(pagina)}
          />
        ))}

        <PizarraPaginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={irAPagina} />
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
