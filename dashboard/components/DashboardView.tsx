import type { DashboardData } from "@/lib/api";
import { MetricCard } from "./MetricCard";
import { RankingTalentos } from "./RankingTalentos";
import { WorklogsRecientes } from "./WorklogsRecientes";

function puntajeIAPromedioGlobal(data: DashboardData): string {
  const conPuntaje = data.rankingTalentos.filter((t) => t.puntajeIAPromedio !== null);
  if (conPuntaje.length === 0) return "—";
  const promedio =
    conPuntaje.reduce((sum, t) => sum + (t.puntajeIAPromedio ?? 0), 0) / conPuntaje.length;
  return `${promedio.toFixed(1)} / 10`;
}

export function DashboardView({
  data,
  onLogout,
}: {
  data: DashboardData;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-surface-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">Talentix</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground">{data.empresa.nombre}</h1>
            <p className="mt-1 text-sm text-muted">
              Plan <span className="text-foreground">{data.empresa.plan}</span>
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg border border-surface-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Total de bitácoras" value={String(data.metricas.totalBitacoras)} />
          <MetricCard
            label="% de cumplimiento"
            value={`${data.metricas.porcentajeEnviadas}%`}
            hint={`${data.metricas.enviadas} de ${data.metricas.totalBitacoras} enviadas`}
          />
          <MetricCard label="Puntaje IA promedio" value={puntajeIAPromedioGlobal(data)} />
        </div>

        <RankingTalentos talentos={data.rankingTalentos} />
        <WorklogsRecientes worklogs={data.worklogsRecientes} />
      </main>
    </div>
  );
}
