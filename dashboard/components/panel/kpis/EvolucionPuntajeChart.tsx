"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EvolucionSemanal } from "@/lib/api";
import { COLOR_CHART_1, COLOR_GRID, COLOR_SUPERFICIE_DARK, COLOR_SUPERFICIE_LIGHT, COLOR_TICK, useColorPorTema } from "./colorTokens";

function formatearSemana(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export function EvolucionPuntajeChart({ datos }: { datos: EvolucionSemanal[] }) {
  const colorSuperficie = useColorPorTema(COLOR_SUPERFICIE_LIGHT, COLOR_SUPERFICIE_DARK);
  const hayDatos = datos.some((d) => d.puntajeProm !== null);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Evolución del puntaje IA — últimas 8 semanas
      </p>
      {!hayDatos ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Sin puntajes registrados en este rango.
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradientPuntajeIA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR_CHART_1} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLOR_CHART_1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis
                dataKey="semana"
                tickFormatter={formatearSemana}
                tick={{ fontSize: 11, fill: COLOR_TICK }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 11, fill: COLOR_TICK }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                labelFormatter={(v) => formatearSemana(String(v))}
                formatter={(value) => [value === null || value === undefined ? "—" : value, "Puntaje IA"]}
                contentStyle={{ borderRadius: 8, borderColor: COLOR_GRID, fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="puntajeProm"
                stroke={COLOR_CHART_1}
                strokeWidth={2}
                fill="url(#gradientPuntajeIA)"
                connectNulls
                isAnimationActive
                animationDuration={600}
                dot={{ r: 4, fill: COLOR_CHART_1, stroke: colorSuperficie, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: COLOR_CHART_1, stroke: colorSuperficie, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
