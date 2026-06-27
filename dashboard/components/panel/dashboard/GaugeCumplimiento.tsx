"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { COLOR_CHART_1 } from "../kpis/colorTokens";

const COLOR_PISTA = "oklch(0.93 0.01 150)";

export function GaugeCumplimiento({ porcentaje }: { porcentaje: number | null }) {
  const valor = porcentaje ?? 0;
  const data = [{ value: valor, fill: COLOR_CHART_1 }];

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cumplimiento del equipo</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">% de bitácoras enviadas</p>
      <div className="relative mt-1 flex flex-1 items-center justify-center">
        {porcentaje === null ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <>
            <RadialBarChart
              width={180}
              height={110}
              cx="50%"
              cy="100%"
              innerRadius="75%"
              outerRadius="100%"
              barSize={16}
              startAngle={180}
              endAngle={0}
              data={data}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: COLOR_PISTA }}
                isAnimationActive
                animationDuration={600}
              />
            </RadialBarChart>
            <p className="font-display absolute bottom-1 text-2xl font-semibold text-foreground tabular-nums">
              {porcentaje}%
            </p>
          </>
        )}
      </div>
    </div>
  );
}
