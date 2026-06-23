"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriePuntaje } from "@/lib/api";

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
          <CartesianGrid stroke="oklch(0.9 0.012 255)" vertical={false} />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "oklch(0.5 0.03 256)" }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 11, fill: "oklch(0.5 0.03 256)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "oklch(0.9 0.012 255)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="puntajeIA"
            stroke="oklch(0.42 0.13 258)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
