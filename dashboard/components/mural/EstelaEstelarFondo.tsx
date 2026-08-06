"use client";

import { useEffect, useRef } from "react";

interface Estrella {
  angulo: number;
  radio: number;
  velocidadAngular: number;
  tamano: number;
  centro: 0 | 1;
}

/**
 * Fondo animado "Estela Estelar" — pequeñas estrellas orbitando dos
 * centros a distinta velocidad, dejando una estela que se desvanece
 * (rastro por des-vanecimiento parcial del canvas en vez de limpiarlo).
 */
export function EstelaEstelarFondo() {
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
    let estrellas: Estrella[] = [];

    function crearEstrellas() {
      estrellas = Array.from({ length: 70 }, () => ({
        angulo: Math.random() * Math.PI * 2,
        radio: 20 + Math.random() * (Math.min(ancho, alto) * 0.42),
        velocidadAngular: (0.15 + Math.random() * 0.35) * (Math.random() < 0.5 ? 1 : -1),
        tamano: 0.8 + Math.random() * 1.6,
        centro: Math.random() < 0.5 ? 0 : 1,
      }));
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
        ctx.fillStyle = "#05010f";
        ctx.fillRect(0, 0, ancho, alto);
      }
      crearEstrellas();
    }

    dimensionar();
    const observador = new ResizeObserver(dimensionar);
    observador.observe(contenedor);

    function cuadro() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(5, 1, 15, 0.14)";
      ctx.fillRect(0, 0, ancho, alto);

      const centros: [number, number][] = [
        [ancho * 0.3, alto * 0.4],
        [ancho * 0.72, alto * 0.62],
      ];

      for (const estrella of estrellas) {
        const [cx, cy] = centros[estrella.centro];
        const x = cx + Math.cos(estrella.angulo) * estrella.radio;
        const y = cy + Math.sin(estrella.angulo) * estrella.radio * 0.6;

        const brillo = ctx.createRadialGradient(x, y, 0, x, y, estrella.tamano * 4);
        brillo.addColorStop(0, "rgba(255,255,255,0.95)");
        brillo.addColorStop(1, "rgba(191,219,254,0)");
        ctx.fillStyle = brillo;
        ctx.beginPath();
        ctx.arc(x, y, estrella.tamano * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, estrella.tamano, 0, Math.PI * 2);
        ctx.fill();

        estrella.angulo += estrella.velocidadAngular * 0.016;
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
