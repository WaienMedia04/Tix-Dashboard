"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { COLOR_PISTA_DARK, COLOR_PISTA_LIGHT, useColorPorTema } from "../kpis/colorTokens";

export function GaugeCheckin({ porcentaje }: { porcentaje: number | null }) {
  const colorPista = useColorPorTema(COLOR_PISTA_LIGHT, COLOR_PISTA_DARK);
  const data = [{ value: porcentaje ?? 0, fill: "url(#gaugeGradientCheckin)" }];

  return (
    <div className="flex h-full select-none flex-col rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Check-in del equipo</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">% de check-in enviado hoy</p>
      <div className="relative mt-1 flex flex-1 items-end justify-center">
        {porcentaje === null ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <div className="relative">
            <RadialBarChart
              width={180}
              height={96}
              cx="50%"
              cy="100%"
              innerRadius="72%"
              outerRadius="100%"
              barSize={14}
              startAngle={180}
              endAngle={0}
              data={data}
            >
              <defs>
                <linearGradient id="gaugeGradientCheckin" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0DA2E7" />
                  <stop offset="100%" stopColor="#7F3BED" />
                </linearGradient>
              </defs>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: colorPista }}
                isAnimationActive
                animationDuration={600}
              />
            </RadialBarChart>
            <p className="font-display absolute inset-x-0 bottom-1 text-center text-2xl font-semibold text-foreground tabular-nums">
              {porcentaje}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
