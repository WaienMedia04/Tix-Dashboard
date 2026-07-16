import Link from "next/link";
import type { EmpleadoResumen } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

function colorPuntaje(puntaje: number | null): string {
  if (puntaje === null) return "text-muted-foreground";
  if (puntaje >= 8) return "text-success";
  if (puntaje >= 5) return "text-warning";
  return "text-destructive";
}

export function EmpleadoCard({ slug, empleado }: { slug: string; empleado: EmpleadoResumen }) {
  const activo = empleado.estado === "activo";

  return (
    <Link
      href={`/${slug}/empleados/${empleado.id}`}
      className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        <Avatar nombreCompleto={empleado.nombreCompleto} fotoUrl={empleado.fotoUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-sm font-semibold text-foreground">
            {empleado.nombreCompleto}
          </p>
          <p className="truncate text-xs text-muted-foreground" title={empleado.rol}>
            {empleado.rol}
          </p>
          {empleado.departamento && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{empleado.departamento}</p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${
            activo ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
          }`}
        >
          {activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Puntaje IA</p>
          <p className={`font-display mt-1 text-base font-semibold tabular-nums ${colorPuntaje(empleado.puntajeIAPromedio)}`}>
            {empleado.puntajeIAPromedio === null ? "—" : empleado.puntajeIAPromedio.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Bitácoras</p>
          <p className="font-display mt-1 text-base font-semibold tabular-nums text-foreground">
            {empleado.totalBitacoras}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Cumplimiento</p>
          <p className="font-display mt-1 text-base font-semibold tabular-nums text-foreground">
            {empleado.porcentajeCumplimiento === null ? "—" : `${empleado.porcentajeCumplimiento}%`}
          </p>
        </div>
      </div>
    </Link>
  );
}
