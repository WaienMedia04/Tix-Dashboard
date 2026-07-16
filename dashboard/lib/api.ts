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
  tareasPlanificadas: string | null;
  horaCheckin: string | null;
  checkinEnviado: boolean;
  cumplimientoTareas: number | null;
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

export interface ProductividadDia {
  dia: string;
  fecha: string;
  enviadas: number;
}

export interface ActividadEmpleado {
  talentoId: string;
  nombreCompleto: string;
  rol: string;
  fecha: string | null;
  estadoEnvio: string | null;
  puntajeIA: number | null;
}

export interface DashboardData {
  empresa: { nombre: string; slug: string; plan: string };
  metricas: {
    totalBitacoras: number;
    enviadas: number;
    porcentajeEnviadas: number;
    empleadosActivos: number;
    bitacorasHoy: number;
    checkinsHoy: number;
    porcentajeCheckinHoy: number;
  };
  productividadSemanal: ProductividadDia[];
  rankingTalentos: TalentoRanking[];
  worklogsRecientes: WorklogReciente[];
  actividadEquipo: ActividadEmpleado[];
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
  tareasPlanificadas: string | null;
  horaCheckin: string | null;
  checkinEnviado: boolean;
  cumplimientoTareas: number | null;
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
  cumplimientoTareasPromedio: number | null;
}

export interface SeriePuntaje {
  fecha: string;
  puntajeIA: number | null;
}

export interface SerieCumplimientoTareas {
  fecha: string;
  cumplimientoTareas: number | null;
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
    cumplimientoTareasPromedio: number | null;
  };
  serieIA: SeriePuntaje[];
  serieCumplimiento: SerieCumplimientoTareas[];
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
  cumplimientoTareasProm: number | null;
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
  cumplimientoTareasProm: number | null;
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

export type Rol = "CEO" | "RRHH" | "MANAGER" | "TALENTO";

export interface SesionUsuario {
  id: string;
  nombre: string;
  rol: Rol;
  talentoId: string | null;
}

export interface MeResponse {
  usuario: SesionUsuario;
  empresa: { slug: string; nombre: string } | null;
}

export class SesionInvalidaError extends Error {}
export class EmpresaNoEncontradaError extends Error {}
export class DemasiadosIntentosError extends Error {}

export async function login(
  email: string,
  password: string,
): Promise<{ usuario: SesionUsuario & { empresaSlug: string; empresaNombre: string; passwordDebeCambiar: boolean } }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Correo o contraseña incorrectos");
  }
  if (res.status === 429) {
    throw new DemasiadosIntentosError("Demasiados intentos. Espera un momento antes de volver a intentar.");
  }
  if (!res.ok) {
    throw new Error("No se pudo iniciar sesión");
  }
  return res.json();
}

export async function me(): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/auth/me`, { credentials: "include", cache: "no-store" });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo verificar la sesión");
  }
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
}

export async function fetchDashboard(slug: string): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/dashboard`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el dashboard");
  }
  return res.json();
}

export async function fetchBitacoras(slug: string, filtros: BitacorasFiltros): Promise<BitacorasResponse> {
  const params = new URLSearchParams();
  if (filtros.fechaInicio) params.set("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.set("fechaFin", filtros.fechaFin);
  if (filtros.talentoId) params.set("talentoId", filtros.talentoId);
  if (filtros.estado) params.set("estado", filtros.estado);
  params.set("page", String(filtros.page ?? 1));
  params.set("limit", String(filtros.limit ?? 20));

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/bitacoras?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar las bitácoras");
  }
  return res.json();
}

export async function fetchEmpleados(slug: string): Promise<EmpleadoResumen[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/empleados`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
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
  talentoId: string,
  page: number = 1,
): Promise<EmpleadoDetalle> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "20");

  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/empleados/${encodeURIComponent(talentoId)}?${params.toString()}`,
    { credentials: "include", cache: "no-store" },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
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
  estado: "activo" | "inactivo",
): Promise<{ id: string; nombreCompleto: string; rol: string; estado: string }> {
  const res = await fetch(`${API_URL}/talentos/${encodeURIComponent(talentoId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ estado }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar el estado del empleado");
  }
  return res.json();
}

export async function fetchKpis(slug: string, periodo: string): Promise<KpisResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/kpis?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
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
  periodo: PeriodoReporte,
  valor: string,
): Promise<ReporteResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  params.set("valor", valor);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/reportes?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
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
  datos: { nombreCompleto: string; rol: string },
): Promise<EmpleadoResumen> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/talentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo crear el empleado");
  }
  return res.json();
}

export async function actualizarFotoTalento(
  talentoId: string,
  fotoUrl: string,
): Promise<{ id: string; nombreCompleto: string; fotoUrl: string | null }> {
  const res = await fetch(`${API_URL}/talentos/${encodeURIComponent(talentoId)}/foto`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fotoUrl }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar la foto del empleado");
  }
  return res.json();
}

export interface CvDatosExtraidos {
  nombre: string | null;
  contacto: { correo: string | null; telefono: string | null };
  experienciaLaboral: {
    empresa: string;
    puesto: string;
    periodo: string | null;
    descripcion: string | null;
  }[];
  educacion: { institucion: string; titulo: string; anio: string | null }[];
  habilidades: string[];
  resumenParaRRHH: string;
}

export type TipoRegistroWorklog = "checkin" | "checkout";

export interface RegistrarWorklogPropioInput {
  tipo: TipoRegistroWorklog;
  tareasPlanificadas?: string;
  actividadesRealizadas?: string;
  detallesRelevantes?: string;
  informeAvances?: string;
  objetivoDia?: string;
}

/** Autoservicio: el propio talento registra su bitácora de hoy. */
export async function registrarWorklogPropio(
  input: RegistrarWorklogPropioInput,
): Promise<{ id: string; estadoEnvio: string; checkinEnviado: boolean }> {
  const res = await fetch(`${API_URL}/talentos/me/worklogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo registrar la bitácora");
  }
  return res.json();
}

export async function actualizarCvTalento(
  talentoId: string,
  cvUrl: string,
): Promise<{
  id: string;
  nombreCompleto: string;
  cvUrl: string | null;
  cvDatosExtraidos: CvDatosExtraidos | null;
}> {
  const res = await fetch(`${API_URL}/talentos/${encodeURIComponent(talentoId)}/cv`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ cvUrl }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar el CV del empleado");
  }
  return res.json();
}
