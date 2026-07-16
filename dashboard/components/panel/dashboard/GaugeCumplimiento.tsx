"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { COLOR_PISTA_DARK, COLOR_PISTA_LIGHT, useColorPorTema } from "../kpis/colorTokens";

export function GaugeCumplimiento({ porcentaje, onClick }: { porcentaje: number | null; onClick?: () => void }) {
  const colorPista = useColorPorTema(COLOR_PISTA_LIGHT, COLOR_PISTA_DARK);
  const data = [{ value: porcentaje ?? 0, fill: "url(#gaugeGradientCumplimiento)" }];

  return (
    <div
      onClick={onClick}
      className={`flex h-full select-none flex-col rounded-xl border border-border bg-card p-4 shadow-card ${
        onClick ? "cursor-pointer transition-shadow hover:shadow-elegant" : ""
      }`}
    >
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cumplimiento del equipo</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">% de bitácoras enviadas</p>
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
                <linearGradient id="gaugeGradientCumplimiento" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00F2FF" />
                  <stop offset="100%" stopColor="#BC00FF" />
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
