export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Token de sesión de Clerk, leído fuera de un componente React vía el
 * singleton global `window.Clerk` (patrón documentado por Clerk para
 * exactamente este caso: código no-React, como este módulo de fetch). El
 * dominio de la API es distinto al del dashboard, así que no puede
 * compartir la cookie de sesión de Clerk — cada request lleva el JWT como
 * `Authorization: Bearer <token>`.
 */
async function authHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const token = await window.Clerk?.session?.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface TalentoRanking {
  talentoId: string;
  nombreCompleto: string;
  rol: string;
  fotoUrl: string | null;
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
  fotoUrl: string | null;
  estado: string;
  fecha: string | null;
  estadoEnvio: string | null;
  puntajeIA: number | null;
}

export type PeriodoRanking = "mensual" | "anual" | "historico";

export interface RankingsResponse {
  periodo: PeriodoRanking;
  valor: string | null;
  general: TalentoRanking[];
  porDepartamento: { departamento: string; talentos: TalentoRanking[] }[];
  sinDepartamento: TalentoRanking[] | null;
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
  apellido: string | null;
  rol: string;
  departamento: string | null;
  estado: string;
  fotoUrl: string | null;
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
  talento: {
    id: string;
    nombreCompleto: string;
    apellido: string | null;
    rol: string;
    departamento: string | null;
    estado: string;
    fotoUrl: string | null;
    cedula: string | null;
    correo: string | null;
    telefono: string | null;
    fechaIngreso: string | null;
    cvUrl: string | null;
    cvDatosExtraidos: CvDatosExtraidos | null;
  };
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

export type EstadoColorKey = "success" | "destructive" | "info" | "warning" | "neutral" | "muted" | "gold";

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
  fotoUrl: string | null;
  puntajeProm: number | null;
  cumplimiento: number | null;
  cumplimientoTareasProm: number | null;
  enviadas: number;
  tendencia: Tendencia;
}

export interface KpisResumen {
  puntajeProm: number | null;
  puntajePromAnterior: number | null;
  variacion: number | null;
  porcentajeCumplimientoPromedio: number | null;
  empleadosEnRiesgo: number;
  empleadoDestacado: { nombre: string; puntajeProm: number } | null;
}

export interface KpisResponse {
  periodo: string;
  resumen: KpisResumen;
  evolucionSemanal: EvolucionSemanal[];
  bitacorasSemanal: BitacorasSemanal[];
  distribucionEstado: DistribucionEstado[];
  distribucionProductividad: DistribucionProductividad;
  kpisPorEmpleado: KpiEmpleado[];
}

export type PeriodoReporte = "mensual" | "semanal" | "anual" | "personalizado";

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

export interface AnalisisEjecutivo {
  resumenEjecutivo: string;
  fortalezas: string[];
  riesgos: string[];
  recomendaciones: string[];
}

export interface ReporteEjecutivoResponse extends ReporteResponse {
  analisis: AnalisisEjecutivo | null;
}

export async function fetchReporteEjecutivo(
  slug: string,
  periodo: PeriodoReporte,
  opciones: { valor?: string; fechaInicio?: string; fechaFin?: string },
): Promise<ReporteEjecutivoResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  if (opciones.valor) params.set("valor", opciones.valor);
  if (opciones.fechaInicio) params.set("fechaInicio", opciones.fechaInicio);
  if (opciones.fechaFin) params.set("fechaFin", opciones.fechaFin);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/reportes-ejecutivos?${params.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el reporte ejecutivo");
  }
  return res.json();
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

export async function me(): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/auth/me`, { headers: await authHeaders(), cache: "no-store" });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo verificar la sesión");
  }
  return res.json();
}

export async function fetchDashboard(slug: string): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/dashboard`, {
    headers: await authHeaders(),
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
    headers: await authHeaders(),
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
    headers: await authHeaders(),
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
    { headers: await authHeaders(), cache: "no-store" },
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
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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

export interface DatosTalentoEditable {
  rol?: string;
  apellido?: string;
  departamento?: string;
  cedula?: string;
  correo?: string;
  telefono?: string;
  fechaIngreso?: string;
}

export async function actualizarTalento(
  talentoId: string,
  datos: DatosTalentoEditable,
): Promise<Omit<EmpleadoDetalle["talento"], "cvUrl" | "cvDatosExtraidos">> {
  const res = await fetch(`${API_URL}/talentos/${encodeURIComponent(talentoId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar el empleado");
  }
  return res.json();
}

export async function fetchKpis(slug: string, periodo: string): Promise<KpisResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/kpis?${params.toString()}`, {
    headers: await authHeaders(),
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

export type SeveridadAlerta = "critica" | "advertencia" | "positiva";

export interface AlertaItem {
  id: string;
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  severidad: SeveridadAlerta;
  tipo: string;
  mensaje: string;
  fecha: string;
}

export interface AlertasResponse {
  resumen: { criticas: number; advertencias: number; positivas: number };
  alertas: AlertaItem[];
}

export async function fetchAlertas(slug: string): Promise<AlertasResponse> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/alertas`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar las alertas");
  }
  return res.json();
}

export type TipoNovedad = "LOGRO" | "BUENA_ACCION" | "AUSENCIA" | "ERROR" | "SITUACION";

export interface NovedadItem {
  id: string;
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  tipo: TipoNovedad;
  fecha: string;
  descripcion: string;
  creadoPorNombre: string;
  createdAt: string;
}

export async function fetchNovedades(slug: string, filtros: { talentoId?: string; tipo?: TipoNovedad } = {}): Promise<NovedadItem[]> {
  const params = new URLSearchParams();
  if (filtros.talentoId) params.set("talentoId", filtros.talentoId);
  if (filtros.tipo) params.set("tipo", filtros.tipo);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/novedades?${params.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar las novedades");
  }
  return res.json();
}

export async function crearNovedad(
  slug: string,
  datos: { talentoId: string; tipo: TipoNovedad; fecha: string; descripcion: string },
): Promise<NovedadItem> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/novedades`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo registrar la novedad");
  }
  return res.json();
}

export type TipoAusencia = "PERMISO" | "LICENCIA_MEDICA" | "VACACIONES";

export interface AusenciaItem {
  id: string;
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  tipo: TipoAusencia;
  fechaInicio: string;
  fechaFin: string;
  motivo: string | null;
  creadoPorNombre: string;
  createdAt: string;
}

export async function fetchAusencias(slug: string, filtros: { talentoId?: string } = {}): Promise<AusenciaItem[]> {
  const params = new URLSearchParams();
  if (filtros.talentoId) params.set("talentoId", filtros.talentoId);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/ausencias?${params.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar las ausencias");
  }
  return res.json();
}

export async function crearAusencia(
  slug: string,
  datos: { talentoId: string; tipo: TipoAusencia; fechaInicio: string; fechaFin: string; motivo?: string },
): Promise<{ ausencia: AusenciaItem; fechasOmitidas: string[] }> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/ausencias`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo registrar la ausencia");
  }
  return res.json();
}

export async function fetchRankings(
  slug: string,
  periodo: PeriodoRanking,
  valor?: string,
): Promise<RankingsResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  if (valor) params.set("valor", valor);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/rankings?${params.toString()}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el ranking");
  }
  return res.json();
}

export async function fetchReporte(
  slug: string,
  periodo: PeriodoReporte,
  opciones: { valor?: string; fechaInicio?: string; fechaFin?: string },
): Promise<ReporteResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  if (opciones.valor) params.set("valor", opciones.valor);
  if (opciones.fechaInicio) params.set("fechaInicio", opciones.fechaInicio);
  if (opciones.fechaFin) params.set("fechaFin", opciones.fechaFin);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/reportes?${params.toString()}`, {
    headers: await authHeaders(),
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

export interface DatosNuevoTalento extends DatosTalentoEditable {
  nombreCompleto: string;
  rol: string;
}

export async function crearTalento(
  slug: string,
  datos: DatosNuevoTalento,
): Promise<EmpleadoResumen> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/talentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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

export interface DatosCvEditable {
  resumenParaRRHH?: string;
  habilidades?: string[];
  correo?: string;
  telefono?: string;
}

/** Corrige a mano los datos ya extraídos, sin volver a leer el PDF. */
export async function actualizarCvDatosTalento(
  talentoId: string,
  datos: DatosCvEditable,
): Promise<{
  id: string;
  nombreCompleto: string;
  cvUrl: string | null;
  cvDatosExtraidos: CvDatosExtraidos | null;
}> {
  const res = await fetch(`${API_URL}/talentos/${encodeURIComponent(talentoId)}/cv-datos`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado o sin datos de CV");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar los datos del CV");
  }
  return res.json();
}
