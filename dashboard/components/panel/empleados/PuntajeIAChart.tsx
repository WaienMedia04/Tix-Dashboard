"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriePuntaje } from "@/lib/api";
import { COLOR_CHART_1, COLOR_GRID, COLOR_TICK } from "../kpis/colorTokens";

function formatearFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export function PuntajeIAChart({ serie }: { serie: SeriePuntaje[] }) {
  const datos = serie
    .filter((p) => p.puntajeIA !== null)
    .map((p) => ({ fecha: formatearFechaCorta(p.fecha), puntajeIA: p.puntajeIA }));

  if (datos.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Aún no hay puntajes de IA registrados para este empleado.
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={COLOR_GRID} vertical={false} />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: COLOR_TICK }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11, fill: COLOR_TICK }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: COLOR_GRID,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="puntajeIA"
            stroke={COLOR_CHART_1}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            isAnimationActive
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
