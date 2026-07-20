"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Avatar } from "@/components/Avatar";
import { useEsMobile } from "@/lib/use-es-mobile";

// three.js + rapier + drei son, con diferencia, el paquete más pesado de
// toda la app — se evita por completo en móvil (ver el fallback 2D abajo)
// y se carga solo dentro de la ruta Mi Mural en escritorio/tablet.
const LanyardScene = dynamic(() => import("@/components/vendor/Lanyard/Lanyard"), {
  ssr: false,
  loading: () => <div className="h-[30rem] w-[26rem] animate-pulse rounded-2xl bg-muted" />,
});

function CarnetFlipCard({
  nombreCompleto,
  frontImage,
  logoUrl,
}: {
  nombreCompleto: string;
  frontImage: string | null;
  logoUrl: string | null;
}) {
  const [volteada, setVolteada] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="h-12 w-2.5 rounded-b-full bg-foreground/15" />
      <button
        onClick={() => setVolteada((v) => !v)}
        aria-label="Voltear carnet"
        className="h-72 w-52 shrink-0 [perspective:1200px]"
      >
        <div
          className="relative h-full w-full rounded-2xl shadow-elegant transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: volteada ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Frente: foto de perfil o carnet */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-card [backface-visibility:hidden]">
            {frontImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={frontImage} alt={nombreCompleto} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Avatar nombreCompleto={nombreCompleto} size="xl" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 backdrop-blur-sm">
              <p className="truncate text-center text-sm font-medium text-white">{nombreCompleto}</p>
            </div>
          </div>

          {/* Reverso: logo de la empresa */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl border border-border bg-card p-6 [backface-visibility:hidden]"
            style={{ transform: "rotateY(180deg)" }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo de la empresa" className="max-h-32 max-w-full object-contain" />
            ) : (
              <p className="text-center text-xs text-muted-foreground">Sin logo de empresa todavía</p>
            )}
          </div>
        </div>
      </button>
      <p className="text-xs text-muted-foreground">Toca el carnet para voltearlo</p>
    </div>
  );
}

export function LanyardBadge({
  nombreCompleto,
  frontImage,
  logoUrl,
}: {
  nombreCompleto: string;
  frontImage: string | null;
  logoUrl: string | null;
}) {
  const esMobile = useEsMobile();

  if (esMobile) {
    return <CarnetFlipCard nombreCompleto={nombreCompleto} frontImage={frontImage} logoUrl={logoUrl} />;
  }

  return (
    // Sin overflow-hidden ni recortes: los parámetros de cámara/física quedan
    // igual que la demo oficial de React Bits (valores de fábrica del
    // componente), para que la tarjeta cuelgue libre y no se recorte contra
    // los bordes de un contenedor al arrastrarla.
    <div className="h-[30rem] w-[26rem] shrink-0 sm:h-[34rem] sm:w-[28rem]">
      <LanyardScene frontImage={frontImage ?? undefined} backImage={logoUrl ?? undefined} imageFit="cover" />
    </div>
  );
}
