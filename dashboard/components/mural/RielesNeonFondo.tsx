"use client";

import { useEffect, useRef } from "react";

const COLORES = ["#F472B6", "#22D3EE", "#A78BFA", "#34D399"];

interface Riel {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Particula {
  riel: number;
  progreso: number;
  velocidad: number;
  color: string;
}

/**
 * Fondo animado "Rieles Neón" — una grilla de rieles diagonales fijos con
 * partículas brillantes deslizándose por encima, dejando una breve estela
 * (rastro por des-vanecimiento parcial del canvas en vez de limpiarlo).
 */
export function RielesNeonFondo() {
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
    let rieles: Riel[] = [];
    let particulas: Particula[] = [];

    function construirRieles() {
      rieles = [];
      const paso = 90;
      for (let x = -alto; x < ancho + alto; x += paso) {
        rieles.push({ x1: x, y1: 0, x2: x + alto, y2: alto });
      }
      particulas = rieles.flatMap((_, i) =>
        Array.from({ length: 2 }, () => ({
          riel: i,
          progreso: Math.random(),
          velocidad: 0.0018 + Math.random() * 0.0025,
          color: COLORES[Math.floor(Math.random() * COLORES.length)],
        })),
      );
    }

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
      if (ctx) {
        ctx.fillStyle = "#0a0014";
        ctx.fillRect(0, 0, ancho, alto);
      }
      construirRieles();
    }

    dimensionar();
    const observador = new ResizeObserver(dimensionar);
    observador.observe(contenedor);

    function cuadro() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(10, 0, 20, 0.22)";
      ctx.fillRect(0, 0, ancho, alto);

      ctx.strokeStyle = "rgba(139,92,246,0.08)";
      ctx.lineWidth = 1;
      for (const r of rieles) {
        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
        ctx.stroke();
      }

      for (const p of particulas) {
        const riel = rieles[p.riel];
        if (!riel) continue;
        const x = riel.x1 + (riel.x2 - riel.x1) * p.progreso;
        const y = riel.y1 + (riel.y2 - riel.y1) * p.progreso;

        const brillo = ctx.createRadialGradient(x, y, 0, x, y, 7);
        brillo.addColorStop(0, `${p.color}ee`);
        brillo.addColorStop(1, `${p.color}00`);
        ctx.fillStyle = brillo;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        p.progreso += p.velocidad;
        if (p.progreso > 1) {
          p.progreso = 0;
          p.color = COLORES[Math.floor(Math.random() * COLORES.length)];
        }
      }

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
