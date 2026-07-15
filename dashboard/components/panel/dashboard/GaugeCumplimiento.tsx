"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { COLOR_CHART_1, COLOR_PISTA_DARK, COLOR_PISTA_LIGHT } from "../kpis/colorTokens";

export function GaugeCumplimiento({ porcentaje }: { porcentaje: number | null }) {
  const valor = porcentaje ?? 0;
  const data = [{ value: valor, fill: COLOR_CHART_1 }];
  const { resolvedTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMontado(true), []);
  const colorPista = montado && resolvedTheme === "dark" ? COLOR_PISTA_DARK : COLOR_PISTA_LIGHT;

  return (
    <div className="flex h-full select-none flex-col rounded-xl border border-border bg-card p-4 shadow-card">
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
