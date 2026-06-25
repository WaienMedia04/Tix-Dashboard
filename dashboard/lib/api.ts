export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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

export interface BitacoraTalento {
  id: string;
  nombreCompleto: string;
  rol: string;
}

export interface BitacoraItem {
  id: string;
  fecha: string;
  dia: string | null;
  semana: number | null;
  estadoEnvio: string;
  horaEnvio: string | null;
  puntajeIA: number | null;
  calificacionCeo: string | null;
  actividadesRealizadas: string | null;
  capacitacion: string | null;
  queSeEjecuto: string | null;
  detallesRelevantes: string | null;
  informeAvances: string | null;
  objetivoDia: string | null;
  notasTix: string | null;
  talento: BitacoraTalento;
}

export interface BitacorasResumen {
  totalBitacoras: number;
  porcentajeEnviadas: number;
  puntajeProm: number | null;
}

export interface BitacorasResponse {
  data: BitacoraItem[];
  total: number;
  page: number;
  totalPages: number;
  resumen: BitacorasResumen;
}

export type EstadoFiltro = "enviada" | "no_enviada" | "permiso";

export interface BitacorasFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  talentoId?: string;
  estado?: EstadoFiltro;
  page?: number;
  limit?: number;
}

export interface EmpleadoResumen {
  id: string;
  nombreCompleto: string;
  rol: string;
  estado: string;
  puntajeIAPromedio: number | null;
  totalBitacoras: number;
  porcentajeCumplimiento: number | null;
}

export interface SeriePuntaje {
  fecha: string;
  puntajeIA: number | null;
}

export interface HistorialBitacoras {
  data: BitacoraItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EmpleadoDetalle {
  talento: { id: string; nombreCompleto: string; rol: string; estado: string };
  metricas: {
    puntajeIAPromedio: number | null;
    totalBitacoras: number;
    porcentajeCumplimiento: number | null;
  };
  serieIA: SeriePuntaje[];
  historial: HistorialBitacoras;
}

export interface EvolucionSemanal {
  semana: string;
  puntajeProm: number | null;
}

export interface BitacorasSemanal {
  semana: string;
  enviadas: number;
  esperadas: number;
}

export type EstadoColorKey = "success" | "destructive" | "info" | "warning" | "neutral" | "muted";

export interface DistribucionEstado {
  estado: string;
  colorKey: EstadoColorKey;
  count: number;
}

export interface DistribucionProductividad {
  alta: number;
  media: number;
  baja: number;
  sinDatos: number;
}

export type Tendencia = "subio" | "bajo" | "igual" | null;

export interface KpiEmpleado {
  talentoId: string;
  nombre: string;
  puntajeProm: number | null;
  cumplimiento: number | null;
  enviadas: number;
  tendencia: Tendencia;
}

export interface KpisResponse {
  periodo: string;
  evolucionSemanal: EvolucionSemanal[];
  bitacorasSemanal: BitacorasSemanal[];
  distribucionEstado: DistribucionEstado[];
  distribucionProductividad: DistribucionProductividad;
  kpisPorEmpleado: KpiEmpleado[];
}

export type PeriodoReporte = "mensual" | "semanal";

export interface ReporteDetalleItem {
  talentoId: string;
  nombre: string;
  rol: string;
  puntajeProm: number | null;
  cumplimiento: number | null;
  enviadas: number;
  totalBitacoras: number;
}

export interface ReporteResponse {
  periodo: PeriodoReporte;
  valor: string;
  rangoInicio: string;
  rangoFin: string;
  empresa: { nombre: string; slug: string };
  resumen: {
    totalBitacoras: number;
    porcentajeEnviadas: number | null;
    puntajeProm: number | null;
    empleadoDelMes: { nombre: string; puntajeProm: number | null } | null;
    empleadoEnRiesgo: { nombre: string; cumplimiento: number | null } | null;
  };
  detalle: ReporteDetalleItem[];
}

export class CodigoInvalidoError extends Error {}
export class EmpresaNoEncontradaError extends Error {}

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

export async function fetchBitacoras(
  slug: string,
  codigoAcceso: string,
  filtros: BitacorasFiltros,
): Promise<BitacorasResponse> {
  const params = new URLSearchParams();
  params.set("codigoAcceso", codigoAcceso);
  if (filtros.fechaInicio) params.set("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.set("fechaFin", filtros.fechaFin);
  if (filtros.talentoId) params.set("talentoId", filtros.talentoId);
  if (filtros.estado) params.set("estado", filtros.estado);
  params.set("page", String(filtros.page ?? 1));
  params.set("limit", String(filtros.limit ?? 20));

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/bitacoras?${params.toString()}`, {
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar las bitácoras");
  }
  return res.json();
}

export async function fetchEmpleados(slug: string, codigoAcceso: string): Promise<EmpleadoResumen[]> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/empleados?codigoAcceso=${encodeURIComponent(codigoAcceso)}`,
    { cache: "no-store" },
  );
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar los empleados");
  }
  return res.json();
}

export async function fetchEmpleadoDetalle(
  slug: string,
  codigoAcceso: string,
  talentoId: string,
  page: number = 1,
): Promise<EmpleadoDetalle> {
  const params = new URLSearchParams();
  params.set("codigoAcceso", codigoAcceso);
  params.set("page", String(page));
  params.set("limit", "20");

  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/empleados/${encodeURIComponent(talentoId)}?${params.toString()}`,
    { cache: "no-store" },
  );
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el empleado");
  }
  return res.json();
}

export async function actualizarEstadoTalento(
  talentoId: string,
  codigoAcceso: string,
  estado: "activo" | "inactivo",
): Promise<{ id: string; nombreCompleto: string; rol: string; estado: string }> {
  const res = await fetch(
    `${API_URL}/talentos/${encodeURIComponent(talentoId)}?codigoAcceso=${encodeURIComponent(codigoAcceso)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    },
  );
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar el estado del empleado");
  }
  return res.json();
}

export async function fetchKpis(
  slug: string,
  codigoAcceso: string,
  periodo: string,
): Promise<KpisResponse> {
  const params = new URLSearchParams();
  params.set("codigoAcceso", codigoAcceso);
  params.set("periodo", periodo);

  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/kpis?${params.toString()}`,
    { cache: "no-store" },
  );
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar los KPIs");
  }
  return res.json();
}

export async function fetchReporte(
  slug: string,
  codigoAcceso: string,
  periodo: PeriodoReporte,
  valor: string,
): Promise<ReporteResponse> {
  const params = new URLSearchParams();
  params.set("codigoAcceso", codigoAcceso);
  params.set("periodo", periodo);
  params.set("valor", valor);

  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/reportes?${params.toString()}`,
    { cache: "no-store" },
  );
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el reporte");
  }
  return res.json();
}

export async function crearTalento(
  slug: string,
  codigoAcceso: string,
  datos: { nombreCompleto: string; rol: string },
): Promise<EmpleadoResumen> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/talentos?codigoAcceso=${encodeURIComponent(codigoAcceso)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    },
  );
  if (res.status === 401) {
    throw new CodigoInvalidoError("Código de acceso inválido");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo crear el empleado");
  }
  return res.json();
}
