"use client";

import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProductividadDia } from "@/lib/api";
import { COLOR_CHART_1, COLOR_GRID, COLOR_SUPERFICIE_DARK, COLOR_SUPERFICIE_LIGHT, COLOR_TICK, useColorPorTema } from "../kpis/colorTokens";

function formatearRango(datos: ProductividadDia[]): string {
  if (datos.length === 0) return "";
  const opciones: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", timeZone: "UTC" };
  const desde = new Date(datos[0].fecha).toLocaleDateString("es-DO", opciones);
  const hasta = new Date(datos[datos.length - 1].fecha).toLocaleDateString("es-DO", opciones);
  return `${desde} – ${hasta}`;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function TooltipPersonalizado({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const valor = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-elegant">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {valor} bitácora{valor === 1 ? "" : "s"} enviada{valor === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function ProductividadChart({ datos }: { datos: ProductividadDia[] }) {
  const colorSuperficie = useColorPorTema(COLOR_SUPERFICIE_LIGHT, COLOR_SUPERFICIE_DARK);
  const hayDatos = datos.some((d) => d.enviadas > 0);
  const maximo = hayDatos ? Math.max(...datos.map((d) => d.enviadas)) : 0;
  const diaPico = hayDatos ? datos.find((d) => d.enviadas === maximo) : undefined;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Análisis de productividad</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Bitácoras enviadas por día — {formatearRango(datos)}</p>
      <div className="mt-3 flex-1">
        {!hayDatos ? (
          <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-muted-foreground">
            Sin bitácoras enviadas en este rango.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={180}>
            <AreaChart data={datos} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="productividadFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_CHART_1} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={COLOR_CHART_1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: COLOR_TICK }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLOR_TICK }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<TooltipPersonalizado />} cursor={{ stroke: COLOR_GRID, strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="enviadas"
                stroke={COLOR_CHART_1}
                strokeWidth={2}
                fill="url(#productividadFill)"
                dot={false}
                activeDot={{ r: 5, fill: COLOR_CHART_1, stroke: colorSuperficie, strokeWidth: 2 }}
                isAnimationActive
                animationDuration={900}
              />
              {diaPico && (
                <ReferenceDot
                  x={diaPico.dia}
                  y={diaPico.enviadas}
                  r={5}
                  fill={COLOR_CHART_1}
                  stroke={colorSuperficie}
                  strokeWidth={2}
                  label={{ value: String(diaPico.enviadas), position: "top", fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
