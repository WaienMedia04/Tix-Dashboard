"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BitacorasSemanal } from "@/lib/api";
import { COLOR_CHART_1, COLOR_CHART_2, COLOR_GRID, COLOR_TICK } from "./colorTokens";

function formatearSemana(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-DO", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export function BitacorasSemanalChart({ datos }: { datos: BitacorasSemanal[] }) {
  const hayDatos = datos.some((d) => d.esperadas > 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Bitácoras enviadas vs. esperadas — últimas 8 semanas
      </p>
      {!hayDatos ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Sin bitácoras registradas en este rango.
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis
                dataKey="semana"
                tickFormatter={formatearSemana}
                tick={{ fontSize: 11, fill: COLOR_TICK }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLOR_TICK }} axisLine={false} tickLine={false} width={24} />
              <Tooltip labelFormatter={(v) => formatearSemana(String(v))} contentStyle={{ borderRadius: 8, borderColor: COLOR_GRID, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="esperadas" name="Esperadas" fill={COLOR_CHART_2} radius={[4, 4, 0, 0]} />
              <Bar dataKey="enviadas" name="Enviadas" fill={COLOR_CHART_1} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
