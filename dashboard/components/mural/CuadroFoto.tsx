"use client";

import { Avatar } from "@/components/Avatar";
import { marcoCuadroPorId } from "@/lib/mural-marco-cuadro";

/** Tamaño (px) del cuadro de foto en escritorio, según lo elegido en la personalización. */
const TAMANOS_PX: Record<string, number> = {
  pequeno: 180,
  mediano: 260,
  grande: 340,
};

/**
 * Alternativa al lanyard: la foto del talento dentro de un marco tipo
 * "cuadro de pared". El marco (fondo del contenedor exterior) se aplica
 * como padding, así que queda pegado a los bordes de la foto — no a los
 * del container, que se ajusta al tamaño exacto de la foto + el marco.
 */
export function CuadroFoto({
  nombreCompleto,
  frontImage,
  tamano,
  marcoId,
}: {
  nombreCompleto: string;
  frontImage: string | null;
  /** "pequeno" | "mediano" | "grande" */
  tamano: string;
  marcoId: string | null;
}) {
  const px = TAMANOS_PX[tamano] ?? TAMANOS_PX.mediano;
  const marco = marcoCuadroPorId(marcoId);

  return (
    <div
      className={`inline-flex shrink-0 rounded-xl ${marco?.clases ?? "bg-white/90 shadow-lg"}`}
      style={{ padding: marco?.grosor ?? "0.3rem" }}
    >
      <div
        className="overflow-hidden rounded-lg bg-card"
        style={{ width: px, height: px }}
      >
        {frontImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={frontImage} alt={nombreCompleto} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Avatar nombreCompleto={nombreCompleto} size="xl" />
          </div>
        )}
      </div>
    </div>
  );
}
