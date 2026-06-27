"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProductividadDia } from "@/lib/api";
import { COLOR_CHART_1, COLOR_GRID, COLOR_TICK } from "../kpis/colorTokens";

const COLOR_SIN_DATOS = "oklch(0.93 0.01 150)";

function formatearRango(datos: ProductividadDia[]): string {
  if (datos.length === 0) return "";
  const opciones: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", timeZone: "UTC" };
  const desde = new Date(datos[0].fecha).toLocaleDateString("es-DO", opciones);
  const hasta = new Date(datos[datos.length - 1].fecha).toLocaleDateString("es-DO", opciones);
  return `${desde} – ${hasta}`;
}

export function ProductividadChart({ datos }: { datos: ProductividadDia[] }) {
  const hayDatos = datos.some((d) => d.enviadas > 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Análisis de productividad</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        Bitácoras enviadas por día — {formatearRango(datos)}
      </p>
      <div className="mt-3 flex-1">
        {!hayDatos ? (
          <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-muted-foreground">
            Sin bitácoras enviadas en este rango.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={180}>
            <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: COLOR_TICK }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLOR_TICK }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                formatter={(value) => [`${value} enviadas`, ""]}
                contentStyle={{ borderRadius: 8, borderColor: COLOR_GRID, fontSize: 12 }}
              />
              <Bar dataKey="enviadas" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={500} maxBarSize={32}>
                {datos.map((d) => (
                  <Cell key={d.dia} fill={d.enviadas > 0 ? COLOR_CHART_1 : COLOR_SIN_DATOS} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
