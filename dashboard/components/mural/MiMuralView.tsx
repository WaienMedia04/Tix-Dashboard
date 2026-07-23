"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Gift,
  MessageCircle,
  Newspaper,
  NotebookPen,
  Palette,
  Radio,
  Sparkles,
  StickyNote,
  Users,
} from "lucide-react";
import { type MuralPropio, fetchChatResumen, fetchMuralDeTalento, fetchMuralPropio, fetchNotificaciones } from "@/lib/api";
import { fondoMuralCss, fondoMuralTexto } from "@/lib/mural-fondos";
import { coloresNombreMural } from "@/lib/mural-colores-nombre";
import { colorParaEstado } from "@/lib/estados-mural";
import { reproducirSonidoEntrada } from "@/lib/sonidos";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Modal } from "@/components/Modal";
import Dock from "@/components/vendor/Dock/Dock";
import TextType from "@/components/vendor/TextType/TextType";
import GradientText from "@/components/vendor/GradientText/GradientText";
import { LanyardBadge } from "./LanyardBadge";
import { PerfilDivertidoForm } from "./PerfilDivertidoForm";
import { SobreMiSoloLectura } from "./SobreMiSoloLectura";
import { SelectorFondo } from "./SelectorFondo";
import { SelectorColorNombre } from "./SelectorColorNombre";
import { SelectorColorWidgets } from "./SelectorColorWidgets";
import { MuralCanvas } from "./MuralCanvas";
import { DirectorioCompaneros } from "./DirectorioCompaneros";
import { MisEstampasModal } from "./MisEstampasModal";
import { EstadoModal } from "./EstadoModal";
import { VentanaEscritorio } from "./VentanaEscritorio";
import { BoletinInformativo } from "@/components/boletin/BoletinInformativo";
import { VacantesInformativo } from "@/components/vacantes/VacantesInformativo";
import { ClimaWidget } from "./ClimaWidget";
import { PizarraSocial } from "@/components/pizarra/PizarraSocial";
import { ChatPanel } from "@/components/chat/ChatPanel";

type EstadoVentana = "abierta" | "minimizada";

export function MiMuralView({
  slug,
  talentoId,
  miTalentoId,
  rol,
}: {
  slug: string;
  /** Si se omite: el mural propio (editable). Si se da: el de otro empleado (solo lectura). */
  talentoId?: string;
  /** talentoId del usuario autenticado — solo se usa para excluirlo del directorio de compañeros. */
  miTalentoId: string;
  /** Solo aplica al mural propio — decide a dónde lleva el botón de Bitácoras. */
  rol?: string;
}) {
  const editable = talentoId === undefined;
  const router = useRouter();
  const [mural, setMural] = useState<MuralPropio | null>(null);
  const [error, setError] = useState(false);
  const [mostrarSobreMi, setMostrarSobreMi] = useState(false);
  const [mostrarFondo, setMostrarFondo] = useState(false);
  const [mostrarCompaneros, setMostrarCompaneros] = useState(false);
  const [mostrarEstampas, setMostrarEstampas] = useState(false);
  const [mostrarNuevaNota, setMostrarNuevaNota] = useState(false);
  const [mostrarEstado, setMostrarEstado] = useState(false);
  const [ventanaPizarra, setVentanaPizarra] = useState<EstadoVentana>("minimizada");
  const [ventanaMural, setVentanaMural] = useState<EstadoVentana>("minimizada");
  const [ventanaChat, setVentanaChat] = useState<EstadoVentana>("minimizada");
  const [pizarraNoLeidas, setPizarraNoLeidas] = useState(0);
  const [chatNoLeidos, setChatNoLeidos] = useState(0);
  const [chatHayChisme, setChatHayChisme] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelado = false;
    // Al navegar entre murales (ej. desde el directorio de compañeros) el
    // componente no se desmonta, solo cambia `talentoId` — hay que limpiar
    // el mural anterior para no mostrarlo un instante mientras carga el nuevo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMural(null);
    setError(false);
    const promesa = editable ? fetchMuralPropio() : fetchMuralDeTalento(slug, talentoId);
    promesa
      .then((data) => {
        if (cancelado) return;
        setMural(data);
        if (editable) reproducirSonidoEntrada();
      })
      .catch(() => {
        if (!cancelado) setError(true);
      });
    return () => {
      cancelado = true;
    };
  }, [slug, talentoId, editable]);

  // Insignias del Dock (Pizarra/Chat) — solo en el mural propio, donde vive el Dock.
  useEffect(() => {
    if (!editable) return;
    let cancelado = false;
    function cargar() {
      fetchNotificaciones(slug)
        .then((lista) => {
          if (!cancelado) {
            setPizarraNoLeidas(lista.filter((n) => n.tipo.startsWith("PIZARRA_") && !n.leida).length);
          }
        })
        .catch(() => {});
      fetchChatResumen(slug)
        .then((r) => {
          if (!cancelado) {
            setChatNoLeidos(r.noLeidosTotal);
            setChatHayChisme(r.hayChismeSinLeer);
          }
        })
        .catch(() => {});
    }
    cargar();
    const id = setInterval(cargar, 30_000);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [slug, editable]);

  if (error) {
    return (
      <p className="p-8 text-center text-sm text-destructive">
        {editable ? "No se pudo cargar tu mural." : "No se pudo cargar este mural."}
      </p>
    );
  }
  if (!mural) {
    return <LoadingScreen />;
  }

  const nombreCompleto = mural.talento.nombreCompleto;
  const texto = fondoMuralTexto(mural.perfil.fondoId);

  return (
    <div
      className="relative min-h-[calc(100vh-40px)] transition-[background] duration-500"
      style={{ background: fondoMuralCss(mural.perfil.fondoId) }}
    >
      {/* Muro libre: un solo contenedor cubre encabezado + lienzo, para que
          notas y estampas se puedan arrastrar a cualquier parte de la página
          (incluso sobre el carnet), no solo debajo del encabezado. */}
      <div ref={contenedorRef} className="relative">
        {/* Encabezado: carnet grande y centrado, nombre y rol debajo */}
        <div className="flex flex-col items-center px-4 pb-4 text-center">
          <LanyardBadge
            nombreCompleto={nombreCompleto}
            frontImage={mural.talento.carnetFotoUrl ?? mural.talento.fotoUrl}
            logoUrl={mural.empresa.logoUrl}
          />
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            {mural.perfil.estado &&
              (() => {
                const contenido = (
                  <>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        style={{ background: colorParaEstado(mural.perfil.estado!) }}
                      />
                      <span
                        className="relative inline-flex h-2 w-2 rounded-full"
                        style={{ background: colorParaEstado(mural.perfil.estado!) }}
                      />
                    </span>
                    {mural.perfil.estado}
                  </>
                );
                const clases =
                  "inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm";
                return editable ? (
                  <button type="button" onClick={() => setMostrarEstado(true)} className={clases} style={{ color: texto.color }}>
                    {contenido}
                  </button>
                ) : (
                  <div className={clases} style={{ color: texto.color }}>
                    {contenido}
                  </div>
                );
              })()}
            {editable && !mural.perfil.estado && (
              <button
                type="button"
                onClick={() => setMostrarEstado(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/30 px-3.5 py-1.5 text-xs font-medium opacity-80 backdrop-blur-sm transition-opacity hover:opacity-100"
                style={{ color: texto.color }}
              >
                <Radio className="h-3.5 w-3.5" />
                Poner un estado
              </button>
            )}
          </div>
          <GradientText
            colors={coloresNombreMural(mural.perfil.colorNombreId)}
            animationSpeed={4}
            className="font-display mt-10 text-3xl font-bold sm:text-4xl"
          >
            {nombreCompleto}
          </GradientText>
          {mural.perfil.apodo && (
            <p className="mt-1 text-lg font-medium italic" style={{ color: texto.color, textShadow: texto.sombra }}>
              &ldquo;{mural.perfil.apodo}&rdquo;
            </p>
          )}
          <p className="mt-1 text-xl font-medium" style={{ color: texto.color, textShadow: texto.sombra }}>
            {mural.talento.rol}
          </p>
          {mural.talento.departamento && (
            <p
              className="mt-1 flex items-center justify-center gap-1.5 text-sm opacity-90"
              style={{ color: texto.color, textShadow: texto.sombra }}
            >
              <Building2 className="h-4 w-4" />
              {mural.talento.departamento}
            </p>
          )}

          {mural.perfil.personalidades.length > 0 && (
            <div
              className="mt-2 min-h-[1.5em] text-base font-medium italic"
              style={{ color: texto.color, textShadow: texto.sombra }}
            >
              <TextType
                text={mural.perfil.personalidades}
                typingSpeed={70}
                deletingSpeed={35}
                pauseDuration={1800}
                loop
                showCursor
                cursorCharacter="|"
              />
            </div>
          )}

          {/* En el mural propio, "Sobre mí" vive en el Dock de abajo junto al resto. */}
          {!editable && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setMostrarSobreMi(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-4 py-2 text-xs font-medium text-foreground shadow-elegant backdrop-blur-sm transition-transform hover:scale-105"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sobre esta persona
              </button>
            </div>
          )}
        </div>

        {/* Lienzo libre: notas y estampas se arrastran sobre todo este contenedor */}
        <MuralCanvas
          slug={slug}
          miTalentoId={miTalentoId}
          notas={mural.notas}
          estampas={mural.estampasRecibidas}
          editable={editable}
          fondoId={mural.perfil.fondoId}
          contenedorRef={contenedorRef}
          onNotasChange={(notas) => setMural((prev) => (prev ? { ...prev, notas } : prev))}
          mostrarNuevaNota={mostrarNuevaNota}
          onCerrarNuevaNota={() => setMostrarNuevaNota(false)}
        />
      </div>

      {mural.racha > 0 && (
        <div
          className="fixed bottom-4 left-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm print:hidden"
          title="Días seguidos enviando bitácora"
        >
          🔥 {mural.racha} {mural.racha === 1 ? "día" : "días"}
        </div>
      )}

      <div className="fixed top-14 right-3 z-0 w-[190px] max-w-[50vw] origin-top-right scale-[0.72] print:hidden">
        <div className="-rotate-2 rounded-md border-4 border-white bg-white p-1 shadow-lg">
          <ClimaWidget />
        </div>
      </div>

      {editable && (
        <div className="pointer-events-none fixed inset-0 z-40 print:hidden">
          <Dock
            items={[
              {
                icon: <Radio className="h-5 w-5 text-rose-400" />,
                label: "Estado",
                onClick: () => setMostrarEstado(true),
              },
              {
                icon: <Sparkles className="h-5 w-5 text-amber-400" />,
                label: "Sobre mí",
                onClick: () => setMostrarSobreMi(true),
              },
              {
                icon: <Palette className="h-5 w-5 text-fuchsia-400" />,
                label: "Fondo",
                onClick: () => setMostrarFondo(true),
              },
              {
                icon: <NotebookPen className="h-5 w-5 text-cyan-400" />,
                label: "Mis Bitácoras",
                onClick: () => router.push(rol === "TALENTO" ? `/${slug}/mi-espacio` : `/${slug}/bitacoras`),
              },
              {
                icon: <Users className="h-5 w-5 text-emerald-400" />,
                label: "Compañeros",
                onClick: () => setMostrarCompaneros(true),
              },
              {
                icon: <Gift className="h-5 w-5 text-rose-400" />,
                label: "Mis Estampas",
                onClick: () => setMostrarEstampas(true),
              },
              {
                icon: <StickyNote className="h-5 w-5 text-yellow-400" />,
                label: "Agregar nota",
                onClick: () => setMostrarNuevaNota(true),
              },
              {
                icon: (
                  <div className="relative">
                    <ClipboardList className="h-5 w-5 text-orange-400" />
                    {pizarraNoLeidas > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white ring-2 ring-background">
                        {pizarraNoLeidas > 9 ? "9+" : pizarraNoLeidas}
                      </span>
                    )}
                  </div>
                ),
                label: "Pizarra",
                onClick: () => setVentanaPizarra("abierta"),
              },
              {
                icon: <Newspaper className="h-5 w-5 text-sky-400" />,
                label: "Mural informativo",
                onClick: () => setVentanaMural("abierta"),
              },
              {
                icon: (
                  <div className="relative">
                    <MessageCircle className="h-5 w-5 text-violet-400" />
                    {(chatNoLeidos > 0 || chatHayChisme) && (
                      <span
                        className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2 ring-background ${
                          chatHayChisme ? "animate-chisme-blink" : "bg-destructive"
                        }`}
                      >
                        {chatNoLeidos > 9 ? "9+" : chatNoLeidos}
                      </span>
                    )}
                  </div>
                ),
                label: "Chat del equipo",
                onClick: () => setVentanaChat("abierta"),
              },
            ]}
            className="pointer-events-auto"
            panelHeight={64}
            baseItemSize={46}
            magnification={62}
          />
        </div>
      )}

      <Modal
        open={mostrarSobreMi}
        onClose={() => setMostrarSobreMi(false)}
        title={editable ? "Sobre mí" : `Sobre ${nombreCompleto.split(" ")[0]}`}
      >
        {editable ? (
          <PerfilDivertidoForm
            perfil={mural.perfil}
            onActualizado={(perfil) => setMural((prev) => (prev ? { ...prev, perfil } : prev))}
          />
        ) : (
          <SobreMiSoloLectura perfil={mural.perfil} />
        )}
      </Modal>

      {editable && (
        <Modal open={mostrarFondo} onClose={() => setMostrarFondo(false)} title="Personalizar mural">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Fondo del mural
              </p>
              <SelectorFondo
                fondoId={mural.perfil.fondoId}
                onCambiado={(fondoId) =>
                  setMural((prev) => (prev ? { ...prev, perfil: { ...prev.perfil, fondoId } } : prev))
                }
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Color del nombre
              </p>
              <SelectorColorNombre
                colorNombreId={mural.perfil.colorNombreId}
                onCambiado={(colorNombreId) =>
                  setMural((prev) => (prev ? { ...prev, perfil: { ...prev.perfil, colorNombreId } } : prev))
                }
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Color de los widgets de la Pizarra
              </p>
              <SelectorColorWidgets
                colorWidgetsId={mural.perfil.colorWidgetsId}
                onCambiado={(colorWidgetsId) =>
                  setMural((prev) => (prev ? { ...prev, perfil: { ...prev.perfil, colorWidgetsId } } : prev))
                }
              />
            </div>
          </div>
        </Modal>
      )}

      {editable && (
        <Modal
          open={mostrarCompaneros}
          onClose={() => setMostrarCompaneros(false)}
          title="Murales de tus compañeros"
          size="lg"
        >
          <DirectorioCompaneros slug={slug} propioTalentoId={miTalentoId} />
        </Modal>
      )}

      {editable && (
        <MisEstampasModal
          open={mostrarEstampas}
          onClose={() => setMostrarEstampas(false)}
          onCambio={(estampa) =>
            setMural((prev) => {
              if (!prev) return prev;
              const yaEstaba = prev.estampasRecibidas.some((e) => e.id === estampa.id);
              if (estampa.enMural) {
                return {
                  ...prev,
                  estampasRecibidas: yaEstaba
                    ? prev.estampasRecibidas.map((e) => (e.id === estampa.id ? estampa : e))
                    : [...prev.estampasRecibidas, estampa],
                };
              }
              return { ...prev, estampasRecibidas: prev.estampasRecibidas.filter((e) => e.id !== estampa.id) };
            })
          }
        />
      )}

      {editable && (
        <EstadoModal
          open={mostrarEstado}
          estadoActual={mural.perfil.estado}
          onClose={() => setMostrarEstado(false)}
          onActualizado={(perfil) => setMural((prev) => (prev ? { ...prev, perfil } : prev))}
        />
      )}

      {!editable && (
        <div className="relative z-10 px-4 pb-10 sm:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <PizarraSocial slug={slug} miRol={rol ?? "TALENTO"} temaWidgets={mural.perfil.colorWidgetsId} />
            <div className="flex w-full min-w-0 flex-col gap-6">
              <BoletinInformativo slug={slug} />
              <VacantesInformativo slug={slug} />
            </div>
          </div>
        </div>
      )}

      {editable && (
        <>
          <VentanaEscritorio
            abierta={ventanaPizarra === "abierta"}
            titulo="Pizarra del equipo"
            icono={<ClipboardList className="h-4 w-4 text-orange-500" />}
            onMinimizar={() => setVentanaPizarra("minimizada")}
            onCerrar={() => setVentanaPizarra("minimizada")}
            ancho="max-w-2xl"
            fondoId={mural.perfil.fondoId}
          >
            <PizarraSocial
              slug={slug}
              miRol={rol ?? "TALENTO"}
              temaWidgets={mural.perfil.colorWidgetsId}
              dentroDeVentana
            />
          </VentanaEscritorio>

          <VentanaEscritorio
            abierta={ventanaMural === "abierta"}
            titulo="Mural informativo"
            icono={<Newspaper className="h-4 w-4 text-sky-500" />}
            onMinimizar={() => setVentanaMural("minimizada")}
            onCerrar={() => setVentanaMural("minimizada")}
            ancho="max-w-2xl"
            fondoId={mural.perfil.fondoId}
          >
            <div className="flex flex-col gap-4 p-4 sm:p-5">
              <BoletinInformativo slug={slug} dentroDeVentana />
              <VacantesInformativo slug={slug} />
            </div>
          </VentanaEscritorio>

          <VentanaEscritorio
            abierta={ventanaChat === "abierta"}
            titulo="Chat del equipo"
            icono={<MessageCircle className="h-4 w-4 text-violet-500" />}
            onMinimizar={() => setVentanaChat("minimizada")}
            onCerrar={() => setVentanaChat("minimizada")}
            ancho="max-w-md"
            fondoId={mural.perfil.fondoId}
          >
            <ChatPanel
              slug={slug}
              onCerrar={() => setVentanaChat("minimizada")}
              onActividad={() => {
                fetchChatResumen(slug)
                  .then((r) => {
                    setChatNoLeidos(r.noLeidosTotal);
                    setChatHayChisme(r.hayChismeSinLeer);
                  })
                  .catch(() => {});
              }}
            />
          </VentanaEscritorio>
        </>
      )}
    </div>
  );
}
