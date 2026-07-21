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
  email: string;
  rol: Rol;
  talentoId: string | null;
  fotoUrl: string | null;
  passwordEstablecida: boolean;
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

export type RolInvitable = "TALENTO" | "MANAGER";

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

// ── Mi Mural ────────────────────────────────────────────────────────────

export type TipoEstampaForma = "REDONDEADO" | "CIRCULAR" | "CUADRADO" | "DIAMANTE" | "LIBRE";

export interface PerfilMural {
  apodo: string | null;
  meGusta: string | null;
  noMeGusta: string | null;
  cancionFavorita: string | null;
  superpoder: string | null;
  fondoId: string;
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

export interface CumpleanosResponse {
  hoy: CumpleanosHoyItem[];
  esteMes: CumpleanosMesItem[];
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
  | "CV_LISTO_PARA_REVISAR";

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
