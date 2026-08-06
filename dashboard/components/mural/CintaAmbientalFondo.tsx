"use client";

import { useEffect, useRef } from "react";

interface Cinta {
  offsetY: number;
  amplitud: number;
  frecuencia: number;
  velocidad: number;
  grosor: number;
  colores: [string, string];
  fase: number;
}

const CINTAS: Cinta[] = [
  { offsetY: 0.28, amplitud: 34, frecuencia: 1.4, velocidad: 0.4, grosor: 3, colores: ["#22D3EE", "#8B5CF6"], fase: 0 },
  { offsetY: 0.5, amplitud: 46, frecuencia: 1.1, velocidad: -0.3, grosor: 4, colores: ["#D946EF", "#22D3EE"], fase: 2 },
  { offsetY: 0.72, amplitud: 30, frecuencia: 1.7, velocidad: 0.55, grosor: 3, colores: ["#8B5CF6", "#D946EF"], fase: 4 },
];

/**
 * Fondo animado "Cinta Ambiental" — cintas de color fluyendo en ondas
 * horizontales, cada una con su propia amplitud/velocidad/gradiente.
 * Canvas 2D, mismo patrón que LluviaFondo.tsx.
 */
export function CintaAmbientalFondo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const contenedor = canvas?.parentElement;
    if (!canvas || !contenedor) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ancho = 0;
    let alto = 0;
    let animId = 0;

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
    }

    dimensionar();
    const observador = new ResizeObserver(dimensionar);
    observador.observe(contenedor);

    function dibujarCinta(cinta: Cinta, t: number) {
      if (!ctx) return;
      const y0 = alto * cinta.offsetY;
      const paso = 8;
      const gradiente = ctx.createLinearGradient(0, 0, ancho, 0);
      gradiente.addColorStop(0, `${cinta.colores[0]}00`);
      gradiente.addColorStop(0.5, `${cinta.colores[0]}aa`);
      gradiente.addColorStop(1, `${cinta.colores[1]}00`);

      ctx.beginPath();
      for (let x = 0; x <= ancho + paso; x += paso) {
        const y =
          y0 +
          Math.sin(x * 0.006 * cinta.frecuencia + t * cinta.velocidad + cinta.fase) * cinta.amplitud +
          Math.sin(x * 0.014 * cinta.frecuencia + t * cinta.velocidad * 1.6) * (cinta.amplitud * 0.3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = gradiente;
      ctx.lineWidth = cinta.grosor;
      ctx.lineCap = "round";
      ctx.shadowColor = cinta.colores[1];
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function cuadro(tms: number) {
      if (!ctx) return;
      const t = tms / 1000;
      ctx.clearRect(0, 0, ancho, alto);
      for (const cinta of CINTAS) dibujarCinta(cinta, t);
      animId = requestAnimationFrame(cuadro);
    }
    animId = requestAnimationFrame(cuadro);

    return () => {
      cancelAnimationFrame(animId);
      observador.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
