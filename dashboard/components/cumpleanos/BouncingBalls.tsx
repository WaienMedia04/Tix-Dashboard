"use client";

import { useEffect, useRef } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

interface BouncingBallsProps {
  className?: string;
  count?: number;
  colors?: string[];
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  followCursor?: boolean;
}

/**
 * Animación de bolitas rebotando en Canvas 2D — reemplaza al Ballpit de
 * three.js/WebGL, que fallaba en silencio (o directo no renderizaba) en
 * varios navegadores/GPUs. Canvas 2D no depende de WebGL, así que funciona
 * en cualquier navegador sin importar drivers/GPU.
 */
export function BouncingBalls({
  className = "",
  count = 20,
  colors = ["#FF477E", "#FFD23F", "#06D6A0", "#118AB2", "#EF476F", "#FFA62B", "#9B5DE5", "#F72585"],
  gravity = 0.25,
  friction = 0.995,
  wallBounce = 0.85,
  followCursor = true,
}: BouncingBallsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const parentEl = canvasEl?.parentElement;
    if (!canvasEl || !parentEl) return;

    const context = canvasEl.getContext("2d");
    if (!context) return;

    // Reasignados a variables con tipo no-nulable explícito: TypeScript no
    // conserva el estrechamiento de los `if` de arriba dentro de closures.
    const canvas: HTMLCanvasElement = canvasEl;
    const parent: HTMLElement = parentEl;
    const ctx: CanvasRenderingContext2D = context;

    let width = 0;
    let height = 0;
    let balls: Ball[] = [];
    let rafId = 0;
    const pointer = { x: 0, y: 0, active: false };

    function spawnBalls() {
      const minDim = Math.min(width, height);
      balls = Array.from({ length: count }, () => {
        const r = minDim * (0.045 + Math.random() * 0.035);
        return {
          x: Math.random() * Math.max(width - 2 * r, 1) + r,
          y: Math.random() * Math.max(height - 2 * r, 1) + r,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          r,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnBalls();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (const ball of balls) {
        ball.vy += gravity * 0.05;

        if (pointer.active) {
          const dx = ball.x - pointer.x;
          const dy = ball.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const influence = Math.min(width, height) * 0.35;
          if (dist < influence) {
            const force = ((influence - dist) / influence) * 0.6;
            ball.vx += (dx / dist) * force;
            ball.vy += (dy / dist) * force;
          }
        }

        ball.vx *= friction;
        ball.vy *= friction;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - ball.r < 0) {
          ball.x = ball.r;
          ball.vx = -ball.vx * wallBounce;
        } else if (ball.x + ball.r > width) {
          ball.x = width - ball.r;
          ball.vx = -ball.vx * wallBounce;
        }
        if (ball.y - ball.r < 0) {
          ball.y = ball.r;
          ball.vy = -ball.vy * wallBounce;
        } else if (ball.y + ball.r > height) {
          ball.y = height - ball.r;
          ball.vy = -ball.vy * wallBounce;
        }
      }

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const minDist = a.r + b.r;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const tmpVx = a.vx;
            const tmpVy = a.vy;
            a.vx = b.vx * wallBounce;
            a.vy = b.vy * wallBounce;
            b.vx = tmpVx * wallBounce;
            b.vy = tmpVy * wallBounce;
          }
        }
      }

      for (const ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }
    function onPointerLeave() {
      pointer.active = false;
    }

    resize();
    rafId = requestAnimationFrame(step);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    if (followCursor) {
      parent.addEventListener("pointermove", onPointerMove);
      parent.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (followCursor) {
        parent.removeEventListener("pointermove", onPointerMove);
        parent.removeEventListener("pointerleave", onPointerLeave);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ display: "block", width: "100%", height: "100%" }} />;
}
