"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { type MuralPropio, fetchMuralDeTalento, fetchMuralPropio } from "@/lib/api";
import { fondoMuralCss } from "@/lib/mural-fondos";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LanyardBadge } from "./LanyardBadge";
import { PerfilDivertidoForm } from "./PerfilDivertidoForm";
import { SobreMiSoloLectura } from "./SobreMiSoloLectura";
import { SelectorFondo } from "./SelectorFondo";
import { MuralCanvas } from "./MuralCanvas";
import { DirectorioCompaneros } from "./DirectorioCompaneros";

export function MiMuralView({
  slug,
  talentoId,
  miTalentoId,
}: {
  slug: string;
  /** Si se omite: el mural propio (editable). Si se da: el de otro empleado (solo lectura). */
  talentoId?: string;
  /** talentoId del usuario autenticado — solo se usa para excluirlo del directorio de compañeros. */
  miTalentoId: string;
}) {
  const editable = talentoId === undefined;
  const [mural, setMural] = useState<MuralPropio | null>(null);
  const [error, setError] = useState(false);

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

  return (
    <div
      className="min-h-[calc(100vh-73px)] transition-[background] duration-500"
      style={{ background: fondoMuralCss(mural.perfil.fondoId) }}
    >
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-8">
        <div className="rounded-lg border border-border bg-card/90 p-4 shadow-elegant backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-6">
            <LanyardBadge
              nombreCompleto={nombreCompleto}
              frontImage={mural.talento.carnetFotoUrl ?? mural.talento.fotoUrl}
              logoUrl={mural.empresa.logoUrl}
            />
            <div className="flex-1 text-center sm:pt-4 sm:text-left">
              <h1 className="font-display text-xl font-semibold text-foreground">
                {mural.perfil.apodo ? `${nombreCompleto} · "${mural.perfil.apodo}"` : nombreCompleto}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{mural.talento.rol}</p>
              {mural.talento.departamento && (
                <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
                  <Building2 className="h-3.5 w-3.5" />
                  {mural.talento.departamento}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground/80">
                {editable
                  ? "Estos datos los administra tu empresa. Debajo puedes personalizar tu perfil."
                  : "Estás viendo el mural de un compañero."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {editable ? (
            <PerfilDivertidoForm
              perfil={mural.perfil}
              onActualizado={(perfil) => setMural((prev) => (prev ? { ...prev, perfil } : prev))}
            />
          ) : (
            <SobreMiSoloLectura perfil={mural.perfil} />
          )}
          {editable && (
            <SelectorFondo
              fondoId={mural.perfil.fondoId}
              onCambiado={(fondoId) =>
                setMural((prev) => (prev ? { ...prev, perfil: { ...prev.perfil, fondoId } } : prev))
              }
            />
          )}
        </div>

        <MuralCanvas
          notas={mural.notas}
          estampas={mural.estampasRecibidas}
          editable={editable}
          onNotasChange={(notas) => setMural((prev) => (prev ? { ...prev, notas } : prev))}
        />

        {editable && <DirectorioCompaneros slug={slug} propioTalentoId={miTalentoId} />}
      </div>
    </div>
  );
}
