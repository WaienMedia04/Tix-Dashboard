import { AlertTriangle, Award, CheckCircle2, ClipboardList, Sparkles } from "lucide-react";
import type { ReporteResponse } from "@/lib/api";
import { MetricCard } from "@/components/MetricCard";

export function ResumenEjecutivoReporte({ resumen }: { resumen: ReporteResponse["resumen"] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total de bitácoras" value={String(resumen.totalBitacoras)} icon={ClipboardList} />
        <MetricCard
          label="% cumplimiento"
          value={resumen.porcentajeEnviadas === null ? "—" : `${resumen.porcentajeEnviadas}%`}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Puntaje IA promedio"
          value={resumen.puntajeProm === null ? "—" : `${resumen.puntajeProm.toFixed(1)} / 10`}
          icon={Sparkles}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
              <Award className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empleado del período</p>
          </div>
          <p className="font-display mt-2 text-lg font-semibold text-foreground">
            {resumen.empleadoDelMes?.nombre ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {resumen.empleadoDelMes?.puntajeProm != null
              ? `Puntaje IA promedio: ${resumen.empleadoDelMes.puntajeProm.toFixed(1)} / 10`
              : "Sin datos suficientes en este período"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empleado en riesgo</p>
          </div>
          <p className="font-display mt-2 text-lg font-semibold text-foreground">
            {resumen.empleadoEnRiesgo?.nombre ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {resumen.empleadoEnRiesgo?.cumplimiento != null
              ? `% cumplimiento: ${resumen.empleadoEnRiesgo.cumplimiento}%`
              : "Sin datos suficientes en este período"}
          </p>
        </div>
      </div>
    </div>
  );
}
