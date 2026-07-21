"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Gift, NotebookPen, Palette, Sparkles, StickyNote, Users } from "lucide-react";
import { type MuralPropio, fetchMuralDeTalento, fetchMuralPropio } from "@/lib/api";
import { fondoMuralCss, fondoMuralTexto } from "@/lib/mural-fondos";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Modal } from "@/components/Modal";
import Dock from "@/components/vendor/Dock/Dock";
import { LanyardBadge } from "./LanyardBadge";
import { PerfilDivertidoForm } from "./PerfilDivertidoForm";
import { SobreMiSoloLectura } from "./SobreMiSoloLectura";
import { SelectorFondo } from "./SelectorFondo";
import { MuralCanvas } from "./MuralCanvas";
import { DirectorioCompaneros } from "./DirectorioCompaneros";
import { MisEstampasModal } from "./MisEstampasModal";

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
        if (!cancelado) setMural(data);
      })
      .catch(() => {
        if (!cancelado) setError(true);
      });
    return () => {
      cancelado = true;
    };
  }, [slug, talentoId, editable]);

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
      className="min-h-[calc(100vh-73px)] transition-[background] duration-500"
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
          <h1
            className="font-display mt-4 text-3xl font-bold sm:text-4xl"
            style={{ color: texto.color, textShadow: texto.sombra }}
          >
            {nombreCompleto}
          </h1>
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

      {editable && (
        <div className="pointer-events-none fixed inset-0 z-40 print:hidden">
          <Dock
            items={[
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
        <Modal open={mostrarFondo} onClose={() => setMostrarFondo(false)} title="Fondo del mural">
          <SelectorFondo
            fondoId={mural.perfil.fondoId}
            onCambiado={(fondoId) =>
              setMural((prev) => (prev ? { ...prev, perfil: { ...prev.perfil, fondoId } } : prev))
            }
          />
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
    </div>
  );
}
