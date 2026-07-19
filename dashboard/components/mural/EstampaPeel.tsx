"use client";

import dynamic from "next/dynamic";
import { type EstampaOtorgadaMural, actualizarPosicionEstampa } from "@/lib/api";

const StickerPeelVendor = dynamic(() => import("@/components/vendor/StickerPeel/StickerPeel"), { ssr: false });

/** Rotación pseudo-aleatoria pero estable (no cambia entre renders) a partir del id. */
function rotacionEstable(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  return (hash % 25) - 12;
}

export function EstampaPeel({
  estampa,
  arrastrable,
  contenedorRef,
}: {
  estampa: EstampaOtorgadaMural;
  arrastrable: boolean;
  contenedorRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!arrastrable) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center" title={estampa.mensaje ?? estampa.nombre}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={estampa.imagenUrl}
          alt={estampa.nombre}
          className="h-full w-full object-contain drop-shadow-md"
          style={{ transform: `rotate(${rotacionEstable(estampa.id)}deg)` }}
        />
      </div>
    );
  }

  return (
    // La posición de reposo vive en CSS (%), no en un cálculo en px hecho una
    // sola vez al montar — así nunca queda "vieja" si el contenedor todavía
    // no tenía su tamaño final (fuentes/imágenes cargando) en ese momento.
    // El arrastre (GSAP) solo aplica un delta encima de esta posición base.
    <div className="absolute" style={{ left: `${estampa.posX}%`, top: `${estampa.posY}%`, zIndex: estampa.zIndex }}>
      <StickerPeelVendor
        imageSrc={estampa.imagenUrl}
        width={96}
        rotate={rotacionEstable(estampa.id)}
        initialPosition={{ x: 0, y: 0 }}
        boundsRef={contenedorRef}
        onPositionChange={({ posX, posY }: { posX: number; posY: number }) => {
          actualizarPosicionEstampa(estampa.id, { posX, posY }).catch(() => {});
        }}
      />
    </div>
  );
}
