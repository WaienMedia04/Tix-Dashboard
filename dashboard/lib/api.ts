export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface Empresa {
  id: string;
  nombre: string;
  slug: string;
  plan: string;
}

export interface TalentoRanking {
  talentoId: string;
  nombreCompleto: string;
  rol: string;
  puntajeIAPromedio: number | null;
  bitacorasEnviadas: number;
  totalBitacoras: number;
}

export interface WorklogReciente {
  id: string;
  talento: string;
  fecha: string;
  estadoEnvio: string;
  horaEnvio: string | null;
  puntajeIA: number | null;
  calificacionCeo: string | null;
  actividadesRealizadas: string | null;
  queSeEjecuto: string | null;
  detallesRelevantes: string | null;
  informeAvances: string | null;
  objetivoDia: string | null;
  notasTix: string | null;
}

export interface DashboardData {
  empresa: { nombre: string; slug: string; plan: string };
  metricas: { totalBitacoras: number; enviadas: number; porcentajeEnviadas: number };
  rankingTalentos: TalentoRanking[];
  worklogsRecientes: WorklogReciente[];
}

export class CodigoInvalidoError extends Error {}
export class EmpresaNoEncontradaError extends Error {}

export async function listarEmpresas(): Promise<Empresa[]> {
  const res = await fetch(`${API_URL}/empresas`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudo cargar el listado de empresas");
  }
  return res.json();
}

export async function fetchDashboard(slug: string, codigoAcceso: string): Promise<DashboardData> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/dashboard?codigoAcceso=${encodeURIComponent(codigoAcceso)}`,
    { cache: "no-store" },
  );
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el dashboard");
  }
  return res.json();
}
