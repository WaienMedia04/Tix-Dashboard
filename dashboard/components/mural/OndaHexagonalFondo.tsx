"use client";

import { useEffect, useRef } from "react";

const RADIO_HEX = 22;

/**
 * Fondo animado "Onda Hexagonal" — una grilla de hexágonos cuya opacidad
 * pulsa según su distancia a un centro que se desplaza lentamente,
 * simulando ondas expandiéndose sobre la grilla.
 */
export function OndaHexagonalFondo() {
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
    let hexes: { cx: number; cy: number }[] = [];

    function dibujarHexagono(cx: number, cy: number, r: number) {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angulo = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + r * Math.cos(angulo);
        const y = cy + r * Math.sin(angulo);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
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

      const anchoHex = RADIO_HEX * Math.sqrt(3);
      const altoHex = RADIO_HEX * 1.5;
      hexes = [];
      for (let fila = -1; fila * altoHex < alto + altoHex; fila++) {
        for (let col = -1; col * anchoHex < ancho + anchoHex; col++) {
          const desplazado = fila % 2 !== 0;
          hexes.push({
            cx: col * anchoHex + (desplazado ? anchoHex / 2 : 0),
            cy: fila * altoHex,
          });
        }
      }
    }

    dimensionar();
    const observador = new ResizeObserver(dimensionar);
    observador.observe(contenedor);

    function cuadro(tms: number) {
      if (!ctx) return;
      const t = tms / 1000;
      ctx.clearRect(0, 0, ancho, alto);

      const cx = ancho / 2 + Math.cos(t * 0.25) * ancho * 0.3;
      const cy = alto / 2 + Math.sin(t * 0.2) * alto * 0.3;
      const radioMax = Math.hypot(ancho, alto) * 0.6;

      for (const hex of hexes) {
        const dist = Math.hypot(hex.cx - cx, hex.cy - cy);
        const onda = (Math.sin((dist / radioMax) * Math.PI * 4 - t * 2.2) + 1) / 2;
        const opacidad = 0.03 + onda * 0.16;
        dibujarHexagono(hex.cx, hex.cy, RADIO_HEX - 1.5);
        ctx.strokeStyle = `rgba(56,189,248,${opacidad + 0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (onda > 0.75) {
          ctx.fillStyle = `rgba(129,140,248,${(onda - 0.75) * 0.5})`;
          ctx.fill();
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
