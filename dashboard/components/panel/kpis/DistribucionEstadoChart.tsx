"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DistribucionEstado } from "@/lib/api";
import { COLOR_ESTADO } from "./colorTokens";

export function DistribucionEstadoChart({ datos }: { datos: DistribucionEstado[] }) {
  const total = datos.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Distribución de bitácoras por estado
      </p>
      {total === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Sin bitácoras registradas en este período.
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos}
                  dataKey="count"
                  nameKey="estado"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  isAnimationActive
                  animationDuration={500}
                >
                  {datos.map((d) => (
                    <Cell key={d.estado} fill={COLOR_ESTADO[d.colorKey]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => {
                    const numero = Number(value);
                    const payload = item.payload as DistribucionEstado;
                    return [`${numero} (${Math.round((numero / total) * 1000) / 10}%)`, payload.estado];
                  }}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">{total}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Total</p>
            </div>
          </div>
          <ul className="flex-1 space-y-2">
            {datos.map((d) => (
              <li key={d.estado} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLOR_ESTADO[d.colorKey] }}
                  />
                  {d.estado}
                </span>
                <span className="tabular-nums font-medium text-foreground">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
