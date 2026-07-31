"use client";

import { useEffect, useRef } from "react";
import type { IntensidadLluvia } from "@/lib/mural-fondos";

interface AjustesIntensidad {
  gotas: number;
  velocidad: [number, number];
  largo: [number, number];
  grosor: [number, number];
  opacidad: [number, number];
  viento: number;
  destello: number;
}

const AJUSTES: Record<IntensidadLluvia, AjustesIntensidad> = {
  llovizna: { gotas: 70, velocidad: [4, 8], largo: [8, 16], grosor: [1, 1], opacidad: [0.15, 0.35], viento: 0.3, destello: 0 },
  normal: { gotas: 150, velocidad: [8, 14], largo: [14, 26], grosor: [1, 2], opacidad: [0.25, 0.5], viento: 0.6, destello: 0.02 },
  tormenta: { gotas: 260, velocidad: [14, 22], largo: [20, 38], grosor: [1, 2], opacidad: [0.35, 0.65], viento: 1.4, destello: 0.06 },
};

interface Gota {
  x: number;
  y: number;
  velocidad: number;
  largo: number;
  grosor: number;
  opacidad: number;
}

function crearGota(ancho: number, alto: number, ajustes: AjustesIntensidad): Gota {
  return {
    x: Math.random() * ancho,
    y: Math.random() * alto,
    velocidad: ajustes.velocidad[0] + Math.random() * (ajustes.velocidad[1] - ajustes.velocidad[0]),
    largo: ajustes.largo[0] + Math.random() * (ajustes.largo[1] - ajustes.largo[0]),
    grosor: ajustes.grosor[0] + Math.random() * (ajustes.grosor[1] - ajustes.grosor[0]),
    opacidad: ajustes.opacidad[0] + Math.random() * (ajustes.opacidad[1] - ajustes.opacidad[0]),
  };
}

/**
 * Fondo animado de lluvia — franjas cayendo en canvas 2D (sin WebGL) para no
 * competir con el carnet 3D del mural, que ya usa la GPU bastante. Tres
 * intensidades elegibles como si fueran un fondo más.
 */
export function LluviaFondo({ intensidad }: { intensidad: IntensidadLluvia }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const contenedor = canvas?.parentElement;
    if (!canvas || !contenedor) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ajustes = AJUSTES[intensidad];
    let gotas: Gota[] = [];
    let ancho = 0;
    let alto = 0;
    let animId = 0;
    let ultimoDestello = 0;
    let destelloActivo = 0;

    function dimensionar() {
      if (!canvas || !contenedor) return;
      ancho = contenedor.clientWidth;
      alto = contenedor.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = ancho * dpr;
      canvas.height = alto * dpr;
      canvas.style.width = `${ancho}px`;
      canvas.style.height = `${alto}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      gotas = Array.from({ length: ajustes.gotas }, () => crearGota(ancho, alto, ajustes));
    }

    dimensionar();
    const observador = new ResizeObserver(dimensionar);
    observador.observe(contenedor);

    function cuadro(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, ancho, alto);

      // Un relámpago ocasional (solo en lluvia/tormenta) — un velo blanco breve.
      if (ajustes.destello > 0 && t - ultimoDestello > 4000 && Math.random() < ajustes.destello / 60) {
        destelloActivo = 1;
        ultimoDestello = t;
      }
      if (destelloActivo > 0) {
        ctx.fillStyle = `rgba(255,255,255,${destelloActivo * 0.18})`;
        ctx.fillRect(0, 0, ancho, alto);
        destelloActivo -= 0.06;
        if (destelloActivo < 0) destelloActivo = 0;
      }

      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.lineCap = "round";
      for (const gota of gotas) {
        ctx.globalAlpha = gota.opacidad;
        ctx.lineWidth = gota.grosor;
        ctx.beginPath();
        ctx.moveTo(gota.x, gota.y);
        ctx.lineTo(gota.x - ajustes.viento * (gota.largo / 10), gota.y + gota.largo);
        ctx.stroke();

        gota.y += gota.velocidad;
        gota.x -= ajustes.viento;
        if (gota.y > alto || gota.x < -20) {
          gota.y = -gota.largo;
          gota.x = Math.random() * (ancho + 40);
        }
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(cuadro);
    }
    animId = requestAnimationFrame(cuadro);

    return () => {
      cancelAnimationFrame(animId);
      observador.disconnect();
    };
  }, [intensidad]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
