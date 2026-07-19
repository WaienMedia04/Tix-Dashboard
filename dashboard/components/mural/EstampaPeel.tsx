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
}: {
  estampa: EstampaOtorgadaMural;
  arrastrable: boolean;
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
    <StickerPeelVendor
      imageSrc={estampa.imagenUrl}
      width={96}
      rotate={rotacionEstable(estampa.id)}
      posX={estampa.posX}
      posY={estampa.posY}
      onPositionChange={({ posX, posY }: { posX: number; posY: number }) => {
        actualizarPosicionEstampa(estampa.id, { posX, posY }).catch(() => {});
      }}
    />
  );
}
