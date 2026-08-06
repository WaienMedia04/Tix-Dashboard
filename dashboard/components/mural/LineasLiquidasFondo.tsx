"use client";

import { useEffect, useRef } from "react";

interface Capa {
  offsetY: number;
  amplitud: number;
  frecuencia: number;
  velocidad: number;
  color: string;
  opacidad: number;
}

const CAPAS: Capa[] = [
  { offsetY: 0.55, amplitud: 26, frecuencia: 1.2, velocidad: 0.5, color: "#0EA5E9", opacidad: 0.28 },
  { offsetY: 0.68, amplitud: 34, frecuencia: 0.9, velocidad: -0.35, color: "#0891B2", opacidad: 0.32 },
  { offsetY: 0.82, amplitud: 22, frecuencia: 1.5, velocidad: 0.65, color: "#155E75", opacidad: 0.4 },
];

/**
 * Fondo animado "Líneas Líquidas" — capas de curvas rellenas apiladas que
 * ondulan a distinto ritmo, dando sensación de profundidad líquida (como
 * agua vista de perfil, con varias capas superpuestas).
 */
export function LineasLiquidasFondo() {
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

    function dibujarCapa(capa: Capa, t: number) {
      if (!ctx) return;
      const y0 = alto * capa.offsetY;
      const paso = 10;

      ctx.beginPath();
      ctx.moveTo(0, alto);
      for (let x = 0; x <= ancho + paso; x += paso) {
        const y =
          y0 +
          Math.sin(x * 0.008 * capa.frecuencia + t * capa.velocidad) * capa.amplitud +
          Math.sin(x * 0.02 * capa.frecuencia - t * capa.velocidad * 1.3) * (capa.amplitud * 0.4);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(ancho, alto);
      ctx.closePath();

      const gradiente = ctx.createLinearGradient(0, y0 - capa.amplitud, 0, alto);
      gradiente.addColorStop(0, `${capa.color}${Math.round(capa.opacidad * 255).toString(16).padStart(2, "0")}`);
      gradiente.addColorStop(1, `${capa.color}05`);
      ctx.fillStyle = gradiente;
      ctx.fill();
    }

    function cuadro(tms: number) {
      if (!ctx) return;
      const t = tms / 1000;
      ctx.clearRect(0, 0, ancho, alto);
      for (const capa of CAPAS) dibujarCapa(capa, t);
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
