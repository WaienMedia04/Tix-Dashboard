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
  /** Probabilidad (0-1) de que una gota deje una onda al "aterrizar" abajo. */
  probOnda: number;
}

const AJUSTES: Record<IntensidadLluvia, AjustesIntensidad> = {
  llovizna: {
    gotas: 70,
    velocidad: [4, 8],
    largo: [10, 18],
    grosor: [1, 1.6],
    opacidad: [0.2, 0.4],
    viento: 0.3,
    destello: 0,
    probOnda: 0.08,
  },
  normal: {
    gotas: 150,
    velocidad: [8, 14],
    largo: [16, 30],
    grosor: [1.4, 2.4],
    opacidad: [0.3, 0.55],
    viento: 0.6,
    destello: 0.02,
    probOnda: 0.16,
  },
  tormenta: {
    gotas: 260,
    velocidad: [14, 22],
    largo: [24, 44],
    grosor: [1.8, 3],
    opacidad: [0.4, 0.7],
    viento: 1.4,
    destello: 0.06,
    probOnda: 0.28,
  },
};

interface Gota {
  x: number;
  y: number;
  velocidad: number;
  largo: number;
  grosor: number;
  opacidad: number;
}

interface Onda {
  x: number;
  y: number;
  radio: number;
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
 * Fondo animado de lluvia — canvas 2D (sin WebGL) para no competir con el
 * carnet 3D del mural, que ya usa la GPU bastante. Cada gota es un trazo con
 * degradado (se desvanece hacia la cola) más una "cabeza" con brillo radial
 * — simula la luz reflejándose en la gota, como si escurriera por un
 * cristal — y algunas dejan una onda al llegar abajo. Tres intensidades
 * elegibles como si fueran un fondo más.
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
    let ondas: Onda[] = [];
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
      ondas = [];
    }

    dimensionar();
    const observador = new ResizeObserver(dimensionar);
    observador.observe(contenedor);

    function dibujarGota(gota: Gota) {
      if (!ctx) return;
      const colaX = gota.x - ajustes.viento * (gota.largo / 10);
      const colaY = gota.y + gota.largo;

      // Trazo con degradado: casi invisible en la cola, más definido cerca de la cabeza.
      const trazo = ctx.createLinearGradient(colaX, colaY, gota.x, gota.y);
      trazo.addColorStop(0, "rgba(226,240,255,0)");
      trazo.addColorStop(1, `rgba(226,240,255,${gota.opacidad})`);
      ctx.strokeStyle = trazo;
      ctx.lineWidth = gota.grosor * 0.7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(colaX, colaY);
      ctx.lineTo(gota.x, gota.y);
      ctx.stroke();

      // Cabeza: brillo radial pequeño simulando el reflejo de luz en la gota.
      const radio = gota.grosor * 1.6;
      const brillo = ctx.createRadialGradient(gota.x, gota.y, 0, gota.x, gota.y, radio);
      brillo.addColorStop(0, `rgba(255,255,255,${Math.min(gota.opacidad + 0.25, 1)})`);
      brillo.addColorStop(0.6, `rgba(226,240,255,${gota.opacidad * 0.6})`);
      brillo.addColorStop(1, "rgba(226,240,255,0)");
      ctx.fillStyle = brillo;
      ctx.beginPath();
      ctx.arc(gota.x, gota.y, radio, 0, Math.PI * 2);
      ctx.fill();
    }

    function dibujarOndas() {
      if (!ctx) return;
      ondas = ondas.filter((onda) => onda.opacidad > 0.02);
      for (const onda of ondas) {
        ctx.strokeStyle = `rgba(226,240,255,${onda.opacidad})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(onda.x, onda.y, onda.radio, onda.radio * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        onda.radio += 0.6;
        onda.opacidad -= 0.02;
      }
    }

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

      dibujarOndas();

      for (const gota of gotas) {
        dibujarGota(gota);

        gota.y += gota.velocidad;
        gota.x -= ajustes.viento;
        if (gota.y > alto || gota.x < -20) {
          if (Math.random() < ajustes.probOnda) {
            ondas.push({ x: gota.x, y: alto - 2, radio: 2, opacidad: 0.35 });
          }
          gota.y = -gota.largo;
          gota.x = Math.random() * (ancho + 40);
        }
      }

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
