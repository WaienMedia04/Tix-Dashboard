"use client";

import { useEffect, useState } from "react";
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
  const [posicionInicialPx, setPosicionInicialPx] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!arrastrable) return;
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const rect = contenedor.getBoundingClientRect();
    setPosicionInicialPx({
      x: (estampa.posX / 100) * rect.width,
      y: (estampa.posY / 100) * rect.height,
    });
    // Solo se calcula una vez al montar — el drag maneja su propia posición después.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrastrable, contenedorRef]);

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

  if (!posicionInicialPx) return null;

  return (
    <StickerPeelVendor
      imageSrc={estampa.imagenUrl}
      width={96}
      rotate={rotacionEstable(estampa.id)}
      initialPosition={posicionInicialPx}
      onPositionChange={({ posX, posY }: { posX: number; posY: number }) => {
        actualizarPosicionEstampa(estampa.id, { posX, posY }).catch(() => {});
      }}
    />
  );
}
