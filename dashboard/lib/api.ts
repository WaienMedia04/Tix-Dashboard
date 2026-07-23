import { getSupabaseBrowserClient } from "./supabase-browser";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Header Authorization con el access token de la sesión Supabase actual. */
export async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await getSupabaseBrowserClient().auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
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
  empresa: { nombre: string; slug: string; plan: string; logoUrl: string | null };
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
  departamento?: string;
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
    carnetFotoUrl: string | null;
    cedula: string | null;
    correo: string | null;
    telefono: string | null;
    fechaIngreso: string | null;
    fechaNacimiento: string | null;
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
  /** Marcador crudo si hoy tiene una ausencia autorizada activa (permiso/licencia/vacaciones), si no null. */
  estadoActual: string | null;
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
  opciones: { valor?: string; fechaInicio?: string; fechaFin?: string; departamento?: string },
): Promise<ReporteEjecutivoResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  if (opciones.valor) params.set("valor", opciones.valor);
  if (opciones.fechaInicio) params.set("fechaInicio", opciones.fechaInicio);
  if (opciones.fechaFin) params.set("fechaFin", opciones.fechaFin);
  if (opciones.departamento) params.set("departamento", opciones.departamento);

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

export type Rol = "CEO" | "RRHH" | "GERENTE_GENERAL" | "MANAGER" | "TALENTO";

export interface SesionUsuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  talentoId: string | null;
  fotoUrl: string | null;
  passwordEstablecida: boolean;
  /** Solo aplica a rol "MANAGER". */
  departamentoGestionado: string | null;
  /** Solo aplica a rol "GERENTE_GENERAL". */
  departamentosSupervisados: string[];
}

export interface EmpresaDisponible {
  slug: string;
  nombre: string;
  logoUrl: string | null;
}

export interface MeResponse {
  usuario: SesionUsuario;
  empresa: EmpresaDisponible | null;
  /** Sucursales: empresa propia + cualquiera vinculada (solo CEO/RRHH puede tener más de una). */
  empresasDisponibles: EmpresaDisponible[];
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

/** Marca la cuenta como activada en Neon, justo después de que Supabase ya aceptó la nueva contraseña. */
export async function activarCuenta(): Promise<{ ok: true }> {
  const res = await fetch(`${API_URL}/auth/activar`, {
    method: "POST",
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo activar la cuenta");
  }
  return res.json();
}

export async function fetchDashboard(slug: string, departamento?: string): Promise<DashboardData> {
  const params = new URLSearchParams();
  if (departamento) params.set("departamento", departamento);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/dashboard?${params.toString()}`, {
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
  if (filtros.departamento) params.set("departamento", filtros.departamento);
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

export interface DepartamentoDefinicion {
  id: string;
  nombre: string;
}

/** Catálogo de departamentos configurado por Talentix (panel admin) para esta empresa. */
export async function fetchDepartamentos(slug: string): Promise<DepartamentoDefinicion[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/departamentos`, {
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
    throw new Error("No se pudieron cargar los departamentos");
  }
  return res.json();
}

export async function fetchEmpleados(slug: string, departamento?: string): Promise<EmpleadoResumen[]> {
  const params = new URLSearchParams();
  if (departamento) params.set("departamento", departamento);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/empleados?${params.toString()}`, {
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
  fechaNacimiento?: string;
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

export async function fetchKpis(slug: string, periodo: string, departamento?: string): Promise<KpisResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  if (departamento) params.set("departamento", departamento);

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

export async function fetchAlertas(slug: string, departamento?: string): Promise<AlertasResponse> {
  const params = new URLSearchParams();
  if (departamento) params.set("departamento", departamento);

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/alertas?${params.toString()}`, {
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

export async function fetchNovedades(
  slug: string,
  filtros: { talentoId?: string; tipo?: TipoNovedad; departamento?: string } = {},
): Promise<NovedadItem[]> {
  const params = new URLSearchParams();
  if (filtros.talentoId) params.set("talentoId", filtros.talentoId);
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.departamento) params.set("departamento", filtros.departamento);

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

export async function fetchAusencias(
  slug: string,
  filtros: { talentoId?: string; departamento?: string } = {},
): Promise<AusenciaItem[]> {
  const params = new URLSearchParams();
  if (filtros.talentoId) params.set("talentoId", filtros.talentoId);
  if (filtros.departamento) params.set("departamento", filtros.departamento);

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
  departamento?: string,
): Promise<RankingsResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  if (valor) params.set("valor", valor);
  if (departamento) params.set("departamento", departamento);

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
  opciones: { valor?: string; fechaInicio?: string; fechaFin?: string; departamento?: string },
): Promise<ReporteResponse> {
  const params = new URLSearchParams();
  params.set("periodo", periodo);
  if (opciones.valor) params.set("valor", opciones.valor);
  if (opciones.fechaInicio) params.set("fechaInicio", opciones.fechaInicio);
  if (opciones.fechaFin) params.set("fechaFin", opciones.fechaFin);
  if (opciones.departamento) params.set("departamento", opciones.departamento);

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

export type RolInvitable = "TALENTO" | "MANAGER" | "GERENTE_GENERAL";

/** CEO/RRHH invitan a su propio talento a entrar a la plataforma, igual que hace un admin. */
export async function crearUsuarioTalento(
  slug: string,
  datos: {
    email: string;
    nombre: string;
    rol: RolInvitable;
    talentoId?: string;
    /** Solo tiene efecto cuando rol es "MANAGER". */
    departamentoGestionado?: string;
    /** Solo tiene efecto cuando rol es "GERENTE_GENERAL". */
    departamentosSupervisados?: string[];
  },
): Promise<{ usuario: { id: string; email: string; nombre: string; rol: RolInvitable }; invitacionEnviada: true }> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/usuarios`, {
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
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudo enviar la invitación");
  }
  return res.json();
}

export interface UsuarioTalento {
  id: string;
  email: string;
  nombre: string;
  rol: RolInvitable;
  activo: boolean;
  passwordEstablecida: boolean;
  talentoId: string | null;
  /** Solo aplica a rol "MANAGER". */
  departamentoGestionado: string | null;
  /** Solo aplica a rol "GERENTE_GENERAL". */
  departamentosSupervisados: string[];
}

export async function fetchUsuariosTalento(slug: string): Promise<UsuarioTalento[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/usuarios`, {
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
    throw new Error("No se pudieron cargar los accesos");
  }
  return res.json();
}

export async function cambiarCorreoUsuarioTalento(
  slug: string,
  usuarioId: string,
  email: string,
): Promise<{ id: string; email: string; nombre: string; rol: RolInvitable }> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/usuarios/${encodeURIComponent(usuarioId)}/correo`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ email }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudo cambiar el correo");
  }
  return res.json();
}

export async function actualizarDepartamentoGestionadoUsuario(
  slug: string,
  usuarioId: string,
  departamentoGestionado: string,
): Promise<UsuarioTalento> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/usuarios/${encodeURIComponent(usuarioId)}/departamento`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ departamentoGestionado }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudo actualizar el departamento");
  }
  return res.json();
}

export async function actualizarDepartamentosSupervisadosUsuario(
  slug: string,
  usuarioId: string,
  departamentosSupervisados: string[],
): Promise<UsuarioTalento> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/usuarios/${encodeURIComponent(usuarioId)}/departamentos-supervisados`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ departamentosSupervisados }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudieron actualizar los departamentos supervisados");
  }
  return res.json();
}

export async function restablecerPasswordUsuarioTalento(
  slug: string,
  usuarioId: string,
): Promise<{ ok: boolean }> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/usuarios/${encodeURIComponent(usuarioId)}/restablecer-password`,
    { method: "POST", headers: await authHeaders() },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo enviar el restablecimiento");
  }
  return res.json();
}

export type TipoSoporte = "AVERIA" | "SUGERENCIA";

export async function crearSolicitudSoporte(
  slug: string,
  datos: { tipo: TipoSoporte; mensaje: string },
): Promise<{ id: string; tipo: TipoSoporte; mensaje: string; createdAt: string }> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/soporte`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudo enviar la solicitud");
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

export interface ComparacionCv {
  puntajeAjuste: number;
  resumen: string;
  fortalezas: string[];
  brechas: string[];
  otrosRolesSugeridos: string[];
}

/** Compara el CV ya extraído del talento contra una descripción de puesto pegada al vuelo — no se persiste. */
export async function compararCvTalento(
  talentoId: string,
  descripcionPuesto: string,
): Promise<{ evaluado: boolean; comparacion: ComparacionCv | null }> {
  const res = await fetch(`${API_URL}/talentos/${encodeURIComponent(talentoId)}/comparar-cv`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ descripcionPuesto }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudo comparar el CV");
  }
  return res.json();
}

// ── Mi Mural ────────────────────────────────────────────────────────────

export type TipoEstampaForma = "REDONDEADO" | "CIRCULAR" | "CUADRADO" | "DIAMANTE" | "LIBRE";

export interface PerfilMural {
  apodo: string | null;
  meGusta: string | null;
  noMeGusta: string | null;
  cancionFavorita: string | null;
  superpoder: string | null;
  /** Hasta 5 palabras que describen la personalidad — se muestran animadas en el mural. */
  personalidades: string[];
  /** Estado actual (ej. "Trabajando", "En reunión") — se muestra como píldora animada arriba del nombre. */
  estado: string | null;
  fondoId: string;
  /** Paleta del degradado animado del nombre — ver dashboard/lib/mural-colores-nombre.ts. */
  colorNombreId: string;
  /** Tema de color de las tarjetas de la Pizarra: "vibrante" | "solido" — ver dashboard/lib/pizarra-temas.ts. */
  colorWidgetsId: string;
}

export interface NotaMural {
  id: string;
  texto: string;
  color: string;
  posX: number;
  posY: number;
  rotacion: number;
  zIndex: number;
  escala: number;
  enviadaPorNombre: string | null;
}

export interface EstampaOtorgadaMural {
  id: string;
  estampaDefinicionId: string;
  nombre: string;
  imagenUrl: string;
  forma: TipoEstampaForma;
  mensaje: string | null;
  posX: number;
  posY: number;
  zIndex: number;
  enMural: boolean;
  createdAt: string;
}

export interface MuralPropio {
  perfil: PerfilMural;
  notas: NotaMural[];
  estampasRecibidas: EstampaOtorgadaMural[];
  /** Días seguidos con bitácora enviada (los permisos/licencias/vacaciones no la rompen). */
  racha: number;
  talento: {
    nombreCompleto: string;
    rol: string;
    departamento: string | null;
    fotoUrl: string | null;
    carnetFotoUrl: string | null;
  };
  empresa: { logoUrl: string | null };
}

/** 403 cuando la cuenta autenticada no tiene un Talento vinculado (ej. CEO/RRHH sin ficha propia). */
export class SinPerfilMuralError extends Error {}

async function manejarErrorMural(res: Response): Promise<never> {
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 403) {
    throw new SinPerfilMuralError("Esta cuenta no tiene un perfil de empleado asociado");
  }
  throw new Error("No se pudo completar la operación en Mi Mural");
}

export async function fetchMuralPropio(): Promise<MuralPropio> {
  const res = await fetch(`${API_URL}/talentos/me/mural`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await manejarErrorMural(res);
  return res.json();
}

/** Vista de solo lectura del mural de cualquier empleado de la empresa. */
export async function fetchMuralDeTalento(slug: string, talentoId: string): Promise<MuralPropio> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/empleados/${encodeURIComponent(talentoId)}/mural`,
    { headers: await authHeaders(), cache: "no-store" },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el mural");
  }
  return res.json();
}

export interface MuralDirectorioItem {
  id: string;
  nombreCompleto: string;
  rol: string;
  fotoUrl: string | null;
}

/** Directorio de compañeros para navegar entre murales — abierto a toda la empresa. */
export async function fetchMuralDirectorio(slug: string): Promise<MuralDirectorioItem[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/mural-directorio`, {
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
    throw new Error("No se pudo cargar el directorio");
  }
  return res.json();
}

export interface CumpleanosHoyItem {
  id: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  departamento: string | null;
  rol: string;
}

export interface CumpleanosMesItem extends CumpleanosHoyItem {
  dia: number;
}

export interface CumpleanosPorMes {
  mes: number;
  talentos: CumpleanosMesItem[];
}

export interface CumpleanosResponse {
  hoy: CumpleanosHoyItem[];
  esteMes: CumpleanosMesItem[];
  porMes: CumpleanosPorMes[];
}

/** Cumpleaños de hoy y del resto del mes en curso — visible para toda la empresa. */
export async function fetchCumpleanos(slug: string): Promise<CumpleanosResponse> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/cumpleanos`, {
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
    throw new Error("No se pudieron cargar los cumpleaños");
  }
  return res.json();
}

export async function actualizarPerfilMural(datos: Partial<PerfilMural>): Promise<PerfilMural> {
  const res = await fetch(`${API_URL}/talentos/me/mural/perfil`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (!res.ok) await manejarErrorMural(res);
  return res.json();
}

export async function crearNotaMural(datos: {
  texto: string;
  color?: string;
  posX?: number;
  posY?: number;
}): Promise<NotaMural> {
  const res = await fetch(`${API_URL}/talentos/me/mural/notas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (!res.ok) await manejarErrorMural(res);
  return res.json();
}

/** Le deja una nota a OTRO talento — aparece en su mural, no en el propio. */
export async function enviarNotaAMural(
  slug: string,
  talentoId: string,
  datos: { texto: string; color?: string; posX?: number; posY?: number },
): Promise<NotaMural> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/empleados/${encodeURIComponent(talentoId)}/mural/notas`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(datos),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo enviar la nota");
  }
  return res.json();
}

export async function actualizarNotaMural(
  id: string,
  datos: Partial<{
    texto: string;
    color: string;
    posX: number;
    posY: number;
    rotacion: number;
    zIndex: number;
    escala: number;
  }>,
): Promise<NotaMural> {
  const res = await fetch(`${API_URL}/talentos/me/mural/notas/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (!res.ok) await manejarErrorMural(res);
  return res.json();
}

export async function borrarNotaMural(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/talentos/me/mural/notas/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) await manejarErrorMural(res);
}

export async function actualizarPosicionEstampa(
  id: string,
  datos: Partial<{ posX: number; posY: number; zIndex: number; enMural: boolean }>,
): Promise<EstampaOtorgadaMural> {
  const res = await fetch(`${API_URL}/talentos/me/mural/estampas/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (!res.ok) await manejarErrorMural(res);
  return res.json();
}

export async function fetchMisEstampas(): Promise<EstampaOtorgadaMural[]> {
  const res = await fetch(`${API_URL}/talentos/me/mural/estampas`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) await manejarErrorMural(res);
  return res.json();
}

export async function actualizarCarnetTalento(
  talentoId: string,
  carnetFotoUrl: string | null,
): Promise<{ id: string; nombreCompleto: string; carnetFotoUrl: string | null }> {
  const res = await fetch(`${API_URL}/talentos/${encodeURIComponent(talentoId)}/carnet`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ carnetFotoUrl }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Empleado no encontrado");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar la imagen del carnet");
  }
  return res.json();
}

export async function actualizarLogoEmpresa(slug: string, logoUrl: string): Promise<{ slug: string; logoUrl: string | null }> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/logo`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ logoUrl }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError(`Empresa "${slug}" no encontrada`);
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar el logo de la empresa");
  }
  return res.json();
}

// ── Estampas (catálogo CEO/RRHH) ───────────────────────────────────────

export interface EstampaDefinicion {
  id: string;
  nombre: string;
  imagenUrl: string;
  forma: TipoEstampaForma;
  activo: boolean;
  creadoPorNombre: string;
  createdAt: string;
}

export async function fetchEstampas(slug: string): Promise<EstampaDefinicion[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/estampas`, {
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
    throw new Error("No se pudieron cargar las estampas");
  }
  return res.json();
}

export async function crearEstampaDefinicion(
  slug: string,
  datos: { nombre: string; imagenUrl: string; forma: TipoEstampaForma },
): Promise<EstampaDefinicion> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/estampas`, {
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
    throw new Error("No se pudo crear la estampa");
  }
  return res.json();
}

export async function actualizarEstampaDefinicion(
  slug: string,
  id: string,
  datos: { activo: boolean },
): Promise<EstampaDefinicion> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/estampas/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar la estampa");
  }
  return res.json();
}

export async function eliminarEstampaDefinicion(slug: string, id: string): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/estampas/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("La estampa no fue encontrada");
  }
  if (!res.ok) {
    throw new Error("No se pudo eliminar la estampa");
  }
  return res.json();
}

export async function otorgarEstampa(
  slug: string,
  estampaDefinicionId: string,
  talentoIds: string[],
  mensaje?: string,
): Promise<{ otorgadas: number }> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/estampas/${encodeURIComponent(estampaDefinicionId)}/otorgar`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ talentoIds, mensaje }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (res.status === 404) {
    throw new EmpresaNoEncontradaError("Uno o más empleados o la estampa no fueron encontrados");
  }
  if (!res.ok) {
    throw new Error("No se pudo regalar la estampa");
  }
  return res.json();
}

export type TipoNotificacion =
  | "ESTAMPA_RECIBIDA"
  | "CUMPLEANOS"
  | "AUSENCIA_REGISTRADA"
  | "NOVEDAD_PUBLICADA"
  | "CV_LISTO_PARA_REVISAR"
  | "NOTA_RECIBIDA"
  | "PIZARRA_REACCION"
  | "PIZARRA_COMENTARIO"
  | "PIZARRA_MENCION"
  | "PIZARRA_RECONOCIMIENTO";

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  createdAt: string;
  leida: boolean;
}

export async function fetchNotificaciones(slug: string): Promise<Notificacion[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/notificaciones`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar las notificaciones");
  }
  return res.json();
}

export async function fetchContadorNotificaciones(slug: string): Promise<{ noLeidas: number }> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/notificaciones/contador`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el contador de notificaciones");
  }
  return res.json();
}

export async function marcarNotificacionLeida(slug: string, id: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/notificaciones/${encodeURIComponent(id)}/leer`,
    { method: "POST", headers: await authHeaders() },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo marcar la notificación como leída");
  }
}

export async function marcarTodasNotificacionesLeidas(slug: string): Promise<void> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/notificaciones/leer-todas`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudieron marcar las notificaciones como leídas");
  }
}

// ===== Chat interno =====

export interface ChatPersona {
  id: string;
  nombre: string;
  rol: Rol;
  fotoUrl: string | null;
}

export interface ChatUltimoMensaje {
  texto: string;
  esChisme: boolean;
  autorUsuarioId: string;
  createdAt: string;
}

export interface ChatConversacion {
  id: string;
  esGrupo: boolean;
  nombre: string | null;
  fotoUrl: string | null;
  participantes: ChatPersona[];
  ultimoMensaje: ChatUltimoMensaje | null;
  noLeidos: number;
  tieneChismeSinLeer: boolean;
  createdAt: string;
}

export interface ChatResumen {
  noLeidosTotal: number;
  hayChismeSinLeer: boolean;
}

export interface ChatMensaje {
  id: string;
  texto: string;
  esChisme: boolean;
  autorUsuarioId: string;
  autorNombre: string;
  autorFotoUrl: string | null;
  propio: boolean;
  createdAt: string;
}

export interface ChatMensajesResponse {
  data: ChatMensaje[];
  hayMas: boolean;
}

/** Compañeros de la empresa con los que se puede iniciar un chat o armar un grupo. */
export async function fetchChatDirectorio(slug: string): Promise<ChatPersona[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/chat/directorio`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el directorio del chat");
  }
  return res.json();
}

export async function fetchChatConversaciones(slug: string): Promise<ChatConversacion[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/chat/conversaciones`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar las conversaciones");
  }
  return res.json();
}

/** Payload liviano para el botón flotante: contador de no leídos + si hay algún chisme sin abrir. */
export async function fetchChatResumen(slug: string): Promise<ChatResumen> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/chat/conversaciones/resumen`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el resumen del chat");
  }
  return res.json();
}

export async function crearChatConversacion(
  slug: string,
  datos: { participanteIds: string[]; esGrupo?: boolean; nombre?: string },
): Promise<ChatConversacion> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/chat/conversaciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudo crear la conversación");
  }
  return res.json();
}

export async function fetchChatMensajes(
  slug: string,
  conversacionId: string,
  opts?: { antesDeId?: string; limit?: number },
): Promise<ChatMensajesResponse> {
  const params = new URLSearchParams();
  if (opts?.antesDeId) params.set("antesDeId", opts.antesDeId);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const query = params.toString();

  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/chat/conversaciones/${encodeURIComponent(conversacionId)}/mensajes${query ? `?${query}` : ""}`,
    { headers: await authHeaders(), cache: "no-store" },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar los mensajes");
  }
  return res.json();
}

export async function enviarChatMensaje(
  slug: string,
  conversacionId: string,
  datos: { texto: string; esChisme?: boolean },
): Promise<ChatMensaje> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/chat/conversaciones/${encodeURIComponent(conversacionId)}/mensajes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(datos),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo enviar el mensaje");
  }
  return res.json();
}

export async function agregarChatParticipantes(
  slug: string,
  conversacionId: string,
  participanteIds: string[],
): Promise<ChatConversacion> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/chat/conversaciones/${encodeURIComponent(conversacionId)}/participantes`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ participanteIds }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudieron agregar los participantes");
  }
  return res.json();
}

/** Elimina la conversación para el usuario actual (chat 1 a 1) o lo saca del grupo (chat grupal). */
export async function eliminarChatConversacion(slug: string, conversacionId: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/chat/conversaciones/${encodeURIComponent(conversacionId)}/eliminar`,
    { method: "POST", headers: await authHeaders() },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo eliminar la conversación");
  }
}

// ===== Pizarra (muro social compartido de la empresa) =====

export interface PizarraPersona {
  id: string;
  nombre: string;
  rol: Rol;
  fotoUrl: string | null;
}

export interface PizarraReaccion {
  emoji: string;
  cantidad: number;
  mia: boolean;
}

export interface PizarraComentario {
  id: string;
  texto: string;
  createdAt: string;
  autor: { id: string; nombre: string; fotoUrl: string | null };
}

export interface PizarraPost {
  id: string;
  texto: string;
  createdAt: string;
  propio: boolean;
  autor: PizarraPersona;
  reacciones: PizarraReaccion[];
  comentarios: PizarraComentario[];
}

export interface PizarraPostsResponse {
  data: PizarraPost[];
  hayMas: boolean;
}

/** Directorio de la empresa para el autocompletado de @menciones — reutiliza el mismo directorio que el chat. */
export const fetchPizarraDirectorio = fetchChatDirectorio;

export async function fetchPizarraPosts(
  slug: string,
  opts?: { cursorId?: string; limit?: number },
): Promise<PizarraPostsResponse> {
  const params = new URLSearchParams();
  if (opts?.cursorId) params.set("cursorId", opts.cursorId);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const query = params.toString();

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/posts${query ? `?${query}` : ""}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar la pizarra");
  }
  return res.json();
}

export async function crearPizarraPost(slug: string, texto: string): Promise<PizarraPost> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ texto }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo publicar en la pizarra");
  }
  return res.json();
}

export async function borrarPizarraPost(slug: string, postId: string): Promise<void> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo eliminar la publicación");
  }
}

export async function reaccionarPizarraPost(slug: string, postId: string, emoji: string): Promise<PizarraPost> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/posts/${encodeURIComponent(postId)}/reacciones`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ emoji }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo reaccionar");
  }
  return res.json();
}

export async function comentarPizarraPost(slug: string, postId: string, texto: string): Promise<PizarraPost> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/posts/${encodeURIComponent(postId)}/comentarios`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ texto }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo comentar");
  }
  return res.json();
}

// ===== Pizarra: contenido diario, encuestas, reconocimiento, timeline, trivia =====

export interface PizarraContenidoDiario {
  pregunta: string;
  frase: string;
}

export interface PizarraEncuestaActiva {
  id: string;
  pregunta: string;
  opciones: string[];
  conteos: number[];
  total: number;
  miVoto: number | null;
  createdAt: string;
}

export interface PizarraReconocimientoActivo {
  id: string;
  titulo: string;
  descripcion: string | null;
  createdAt: string;
  talento: { id: string; nombreCompleto: string; fotoUrl: string | null; rol: string };
}

export type EmojiClima = "FELIZ" | "NEUTRAL" | "TRISTE" | "CANSADO" | "EMOCIONADO";

export interface PizarraRachaPropia {
  actual: number;
  mejor: number;
}

export interface PizarraRankingSemanalItem {
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  puntaje: number;
}

export interface PizarraEstampaReciente {
  id: string;
  createdAt: string;
  talento: { id: string; nombreCompleto: string; fotoUrl: string | null };
  estampaNombre: string;
  estampaImagenUrl: string;
}

export interface PizarraEventoProximo {
  id: string;
  titulo: string;
  fechaEvento: string;
}

export interface PizarraPanel {
  contenidoDiario: PizarraContenidoDiario;
  misionDelDia: string;
  encuestaActiva: PizarraEncuestaActiva | null;
  reconocimientoActivo: PizarraReconocimientoActivo | null;
  rachaPropia: PizarraRachaPropia | null;
  climaHoy: EmojiClima | null;
  rankingSemanal: PizarraRankingSemanalItem[];
  estampasRecientes: PizarraEstampaReciente[];
  eventosProximos: PizarraEventoProximo[];
}

export async function fetchPizarraPanel(slug: string): Promise<PizarraPanel> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/panel`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el panel de la pizarra");
  }
  return res.json();
}

export async function crearPizarraEncuesta(
  slug: string,
  datos: { pregunta: string; opciones: string[] },
): Promise<PizarraEncuestaActiva> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/encuestas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo crear la encuesta");
  }
  return res.json();
}

export async function votarPizarraEncuesta(
  slug: string,
  encuestaId: string,
  opcionIndex: number,
): Promise<PizarraEncuestaActiva> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/encuestas/${encodeURIComponent(encuestaId)}/votar`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ opcionIndex }),
    },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo votar");
  }
  return res.json();
}

export async function crearPizarraReconocimiento(
  slug: string,
  datos: { talentoId: string; titulo: string; descripcion?: string },
): Promise<PizarraReconocimientoActivo> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/reconocimiento`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo publicar el reconocimiento");
  }
  return res.json();
}

export interface PizarraEventoTimeline {
  id: string;
  tipo: "estampa" | "nuevo" | "cumple";
  fecha: string;
  texto: string;
  talento: { id: string; nombreCompleto: string; fotoUrl: string | null };
}

export async function fetchPizarraTimeline(slug: string): Promise<PizarraEventoTimeline[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/timeline`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar la actividad reciente");
  }
  return res.json();
}

export interface PizarraTriviaHoy {
  pregunta: string;
  opciones: string[];
  yaRespondida: boolean;
  correcta: boolean | null;
  correctaIndex: number | null;
}

export async function fetchPizarraTriviaHoy(slug: string): Promise<PizarraTriviaHoy> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/trivia-hoy`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar la trivia de hoy");
  }
  return res.json();
}

export async function responderPizarraTrivia(slug: string, opcionIndex: number): Promise<PizarraTriviaHoy> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/trivia-hoy/responder`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ opcionIndex }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo responder la trivia");
  }
  return res.json();
}

export interface PizarraTriviaRankingItem {
  usuarioId: string;
  nombre: string;
  fotoUrl: string | null;
  aciertos: number;
}

export async function fetchPizarraTriviaRanking(slug: string): Promise<PizarraTriviaRankingItem[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/trivia-ranking`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el ranking de trivia");
  }
  return res.json();
}

// ===== Clima laboral =====

export async function responderPizarraClima(slug: string, emoji: EmojiClima): Promise<{ emoji: EmojiClima }> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/clima`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ emoji }),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo registrar tu respuesta");
  }
  return res.json();
}

export interface PizarraClimaEquipoRespuesta {
  usuarioId: string;
  nombre: string;
  fotoUrl: string | null;
  emoji: EmojiClima;
}

export interface PizarraClimaEquipo {
  total: number;
  resumen: { emoji: EmojiClima; cantidad: number }[];
  respuestas: PizarraClimaEquipoRespuesta[];
}

/** Solo CEO/RRHH — quién respondió qué hoy. */
export async function fetchPizarraClimaEquipo(slug: string): Promise<PizarraClimaEquipo> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/clima/equipo`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el clima del equipo");
  }
  return res.json();
}

// ===== Time Capsule =====

export interface PizarraTimeCapsula {
  id: string;
  fechaApertura: string;
  createdAt: string;
  abierta: boolean;
  mensaje: string | null;
}

export async function crearPizarraTimeCapsula(
  slug: string,
  datos: { mensaje: string; fechaApertura: string },
): Promise<PizarraTimeCapsula> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/time-capsulas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.message ?? "No se pudo crear la cápsula del tiempo");
  }
  return res.json();
}

export async function fetchPizarraTimeCapsulas(slug: string): Promise<PizarraTimeCapsula[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/pizarra/time-capsulas`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar las cápsulas del tiempo");
  }
  return res.json();
}

// ===== Boletín (mural informativo: noticias, eventos, blog) =====

export type TipoBoletin = "NOTICIA" | "EVENTO" | "BLOG";

export interface BoletinItem {
  id: string;
  tipo: TipoBoletin;
  titulo: string;
  contenido: string;
  imagenUrl: string | null;
  fechaEvento: string | null;
  createdAt: string;
  updatedAt: string;
  autorNombre: string;
}

export interface BoletinResponse {
  data: BoletinItem[];
  hayMas: boolean;
}

export async function fetchBoletin(
  slug: string,
  opts?: { cursorId?: string; limit?: number },
): Promise<BoletinResponse> {
  const params = new URLSearchParams();
  if (opts?.cursorId) params.set("cursorId", opts.cursorId);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const query = params.toString();

  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/boletin${query ? `?${query}` : ""}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el mural informativo");
  }
  return res.json();
}

export interface AusenciaHoyBoletinItem {
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  departamento: string | null;
  tipo: "PERMISO" | "LICENCIA_MEDICA" | "VACACIONES";
  fechaFin: string;
}

export interface CumpleanosHoyBoletinItem {
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  departamento: string | null;
}

export interface BoletinHoyResponse {
  ausencias: AusenciaHoyBoletinItem[];
  cumpleanos: CumpleanosHoyBoletinItem[];
}

export async function fetchBoletinHoy(slug: string): Promise<BoletinHoyResponse> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/boletin/hoy`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo cargar el resumen del día");
  }
  return res.json();
}

export async function crearBoletin(
  slug: string,
  datos: { tipo: TipoBoletin; titulo: string; contenido: string; fechaEvento?: string; imagenUrl?: string },
): Promise<BoletinItem> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/boletin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo publicar");
  }
  return res.json();
}

export async function actualizarBoletin(
  slug: string,
  id: string,
  datos: Partial<{ tipo: TipoBoletin; titulo: string; contenido: string; fechaEvento: string; imagenUrl: string | null }>,
): Promise<BoletinItem> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/boletin/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar la publicación");
  }
  return res.json();
}

export async function borrarBoletin(slug: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/boletin/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo borrar la publicación");
  }
}

// ===== Vacantes =====

export type EstadoVacante = "ABIERTA" | "CERRADA";

export interface VacanteItem {
  id: string;
  titulo: string;
  descripcion: string;
  departamento: string | null;
  estado: EstadoVacante;
  createdAt: string;
  updatedAt: string;
  autorNombre: string;
}

export interface CandidatoInterno {
  talentoId: string;
  nombreCompleto: string;
  fotoUrl: string | null;
  departamento: string | null;
  puntaje: number;
  justificacion: string;
}

export interface CandidatosInternosResponse {
  evaluados: boolean;
  candidatos: CandidatoInterno[];
}

export async function fetchVacantes(slug: string): Promise<VacanteItem[]> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/vacantes`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudieron cargar las vacantes");
  }
  return res.json();
}

export async function crearVacante(
  slug: string,
  datos: { titulo: string; descripcion: string; departamento?: string },
): Promise<VacanteItem> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/vacantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo publicar la vacante");
  }
  return res.json();
}

export async function actualizarVacante(
  slug: string,
  id: string,
  datos: Partial<{ titulo: string; descripcion: string; departamento: string; estado: EstadoVacante }>,
): Promise<VacanteItem> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/vacantes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(datos),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo actualizar la vacante");
  }
  return res.json();
}

export async function borrarVacante(slug: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/empresas/${encodeURIComponent(slug)}/vacantes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo borrar la vacante");
  }
}

export async function buscarCandidatosInternos(slug: string, id: string): Promise<CandidatosInternosResponse> {
  const res = await fetch(
    `${API_URL}/empresas/${encodeURIComponent(slug)}/vacantes/${encodeURIComponent(id)}/candidatos-internos`,
    { method: "POST", headers: await authHeaders() },
  );
  if (res.status === 401) {
    throw new SesionInvalidaError("Sesión inválida o expirada");
  }
  if (!res.ok) {
    throw new Error("No se pudo buscar candidatos internos");
  }
  return res.json();
}
