"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DistribucionProductividad } from "@/lib/api";
import { COLOR_ESTADO } from "./colorTokens";

const NIVELES: { clave: keyof DistribucionProductividad; label: string; colorKey: "success" | "warning" | "destructive" }[] = [
  { clave: "alta", label: "Alta (≥ 8)", colorKey: "success" },
  { clave: "media", label: "Media (5 – 7.9)", colorKey: "warning" },
  { clave: "baja", label: "Baja (< 5)", colorKey: "destructive" },
];

export function DistribucionProductividadChart({ datos }: { datos: DistribucionProductividad }) {
  const segmentos = NIVELES.map((n) => ({ label: n.label, count: datos[n.clave], colorKey: n.colorKey }));
  const total = segmentos.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Productividad del equipo (por puntaje IA)
      </p>
      {total === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Sin empleados con puntaje en este período.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentos} dataKey="count" nameKey="label" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {segmentos.map((s) => (
                      <Cell key={s.label} fill={COLOR_ESTADO[s.colorKey]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => {
                      const numero = Number(value);
                      const payload = item.payload as { label: string };
                      return [`${numero} (${Math.round((numero / total) * 1000) / 10}%)`, payload.label];
                    }}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2">
              {segmentos.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLOR_ESTADO[s.colorKey] }} />
                    {s.label}
                  </span>
                  <span className="tabular-nums font-medium text-foreground">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
          {datos.sinDatos > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {datos.sinDatos} {datos.sinDatos === 1 ? "empleado" : "empleados"} sin puntaje de IA en este período (no incluido arriba).
            </p>
          )}
        </>
      )}
    </div>
  );
}
