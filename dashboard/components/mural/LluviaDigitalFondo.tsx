"use client";

import { useEffect, useRef } from "react";

const GLIFOS = "01アイウエオカキクケコサシスセソタチツテト";
const ANCHO_COLUMNA = 16;

interface Columna {
  y: number;
  velocidad: number;
  largo: number;
  glifos: string[];
}

/**
 * Fondo animado "Lluvia Digital" — columnas de glifos cayendo estilo
 * Matrix, con una cola que se desvanece. El rastro se logra pintando un
 * rectángulo translúcido cada cuadro en vez de limpiar el canvas entero.
 */
export function LluviaDigitalFondo() {
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
    let columnas: Columna[] = [];
    let ultimoCuadro = 0;

    function crearColumna(): Columna {
      return {
        y: -Math.random() * 30,
        velocidad: 0.3 + Math.random() * 0.5,
        largo: 8 + Math.floor(Math.random() * 10),
        glifos: Array.from({ length: 18 }, () => GLIFOS[Math.floor(Math.random() * GLIFOS.length)]),
      };
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
        ctx.fillStyle = "#000814";
        ctx.fillRect(0, 0, ancho, alto);
      }
      const numColumnas = Math.ceil(ancho / ANCHO_COLUMNA);
      columnas = Array.from({ length: numColumnas }, crearColumna);
    }

    dimensionar();
    const observador = new ResizeObserver(dimensionar);
    observador.observe(contenedor);

    function cuadro(t: number) {
      if (!ctx) return;
      if (t - ultimoCuadro < 45) {
        animId = requestAnimationFrame(cuadro);
        return;
      }
      ultimoCuadro = t;

      ctx.fillStyle = "rgba(0, 8, 20, 0.16)";
      ctx.fillRect(0, 0, ancho, alto);
      ctx.font = "13px monospace";
      ctx.textAlign = "center";

      columnas.forEach((col, i) => {
        const x = i * ANCHO_COLUMNA + ANCHO_COLUMNA / 2;
        for (let j = 0; j < col.largo; j++) {
          const y = (col.y - j) * 18;
          if (y < -18 || y > alto + 18) continue;
          const glifo = col.glifos[j % col.glifos.length];
          const opacidad = j === 0 ? 1 : Math.max(0, 1 - j / col.largo);
          ctx.fillStyle = j === 0 ? `rgba(190,255,220,${opacidad})` : `rgba(34,197,94,${opacidad * 0.8})`;
          ctx.fillText(glifo, x, y);
        }
        col.y += col.velocidad;
        if ((col.y - col.largo) * 18 > alto) {
          Object.assign(col, crearColumna(), { y: -2 });
        }
        if (Math.random() < 0.02) col.glifos[Math.floor(Math.random() * col.glifos.length)] = GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
      });

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
