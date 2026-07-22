import { API_URL } from "./api";

export class AdminNoAutorizadoError extends Error {}
export class AdminConflictoError extends Error {
  constructor(public readonly detail: string) {
    super(detail);
  }
}

export interface EmpresaAdmin {
  id: string;
  nombre: string;
  slug: string;
  plan: string;
  activo: boolean;
  codigoAcceso?: string;
  botToken?: string;
  logoUrl?: string | null;
  createdAt: string;
  totalEmpleados: number;
  totalBitacoras: number;
}

export interface ResumenAdmin {
  totalEmpresas: number;
  empresasActivas: number;
  empresasInactivas: number;
  totalEmpleados: number;
  totalBitacoras: number;
}

export interface DashboardAdmin {
  resumen: ResumenAdmin;
  empresas: EmpresaAdmin[];
}

export interface EmpleadoAdmin {
  id: string;
  nombreCompleto: string;
  rol: string;
  estado: string;
  _count: { worklogs: number };
}

export interface WorklogFichaAdmin {
  id: string;
  fecha: string;
  estadoEnvio: string;
  puntajeIA: number | null;
  actividadesRealizadas: string | null;
  horaEnvio: string | null;
  semana: number | null;
  dia: string | null;
}

export interface FichaTalentoAdmin {
  id: string;
  nombreCompleto: string;
  rol: string;
  estado: string;
  cedula: string | null;
  correo: string | null;
  telefono: string | null;
  fechaIngreso: string | null;
  fechaNacimiento: string | null;
  direccion: string | null;
  notas: string | null;
  empresa: { nombre: string; slug: string };
  metricas: {
    totalBitacoras: number;
    puntajePromedio: number | null;
    cumplimiento: number;
  };
  worklogs: WorklogFichaAdmin[];
}

async function adminFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": token,
      ...(options.headers as Record<string, string>),
    },
    cache: "no-store",
  });
  if (res.status === 401) throw new AdminNoAutorizadoError();
  if (res.status === 409) {
    const body = await res.json().catch(() => ({}));
    throw new AdminConflictoError((body as { message?: string }).message ?? "Conflicto");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function validarTokenAdmin(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 400) throw new AdminNoAutorizadoError();
  if (res.status === 429) throw new Error("Demasiados intentos. Espera un momento.");
  if (!res.ok) throw new Error("Error al conectar con el servidor");
}

export function fetchAdminDashboard(token: string): Promise<DashboardAdmin> {
  return adminFetch<DashboardAdmin>("/admin/dashboard", token);
}

export function crearEmpresa(
  token: string,
  data: { nombre: string; slug?: string; plan: string; codigoAcceso?: string },
): Promise<EmpresaAdmin> {
  return adminFetch<EmpresaAdmin>("/admin/empresas", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function editarEmpresa(
  token: string,
  id: string,
  data: { nombre?: string; plan?: string; codigoAcceso?: string; logoUrl?: string },
): Promise<EmpresaAdmin> {
  return adminFetch<EmpresaAdmin>(`/admin/empresas/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarEstadoEmpresa(
  token: string,
  id: string,
  activo: boolean,
): Promise<{ id: string; nombre: string; activo: boolean }> {
  return adminFetch(`/admin/empresas/${id}/estado`, token, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
}

export function borrarEmpresaAdmin(token: string, id: string): Promise<{ ok: boolean }> {
  return adminFetch(`/admin/empresas/${id}`, token, { method: "DELETE" });
}

export function fetchEmpleadosAdmin(token: string, empresaId: string): Promise<EmpleadoAdmin[]> {
  return adminFetch<EmpleadoAdmin[]>(`/admin/empresas/${empresaId}/empleados`, token);
}

export function crearEmpleadoAdmin(
  token: string,
  empresaId: string,
  data: { nombreCompleto: string; rol: string },
): Promise<{ id: string; nombreCompleto: string; rol: string; estado: string }> {
  return adminFetch(`/admin/empresas/${empresaId}/empleados`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type RolAdmin = "CEO" | "RRHH" | "MANAGER" | "TALENTO";

export function crearUsuarioAdmin(
  token: string,
  empresaId: string,
  data: { email: string; nombre: string; rol: RolAdmin; talentoId?: string },
): Promise<{ usuario: { id: string; email: string; nombre: string; rol: RolAdmin }; invitacionEnviada: true }> {
  return adminFetch(`/admin/empresas/${empresaId}/usuarios`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fichaEmpleadoAdmin(token: string, talentoId: string): Promise<FichaTalentoAdmin> {
  return adminFetch<FichaTalentoAdmin>(`/admin/talentos/${talentoId}`, token);
}

export function editarEmpleadoAdmin(
  token: string,
  talentoId: string,
  data: Partial<{
    nombreCompleto: string;
    rol: string;
    cedula: string | null;
    correo: string | null;
    telefono: string | null;
    fechaIngreso: string | null;
    fechaNacimiento: string | null;
    direccion: string | null;
    notas: string | null;
  }>,
): Promise<FichaTalentoAdmin> {
  return adminFetch<FichaTalentoAdmin>(`/admin/talentos/${talentoId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarEstadoEmpleadoAdmin(
  token: string,
  talentoId: string,
  estado: "activo" | "inactivo",
): Promise<{ id: string; nombreCompleto: string; estado: string }> {
  return adminFetch(`/admin/talentos/${talentoId}/estado`, token, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export function borrarEmpleadoAdmin(token: string, talentoId: string): Promise<{ ok: boolean }> {
  return adminFetch(`/admin/talentos/${talentoId}`, token, { method: "DELETE" });
}

// ── Catálogo de departamentos por empresa ──────────────────────────────────

export interface DepartamentoAdmin {
  id: string;
  nombre: string;
  createdAt: string;
}

export function fetchDepartamentosAdmin(token: string, empresaId: string): Promise<DepartamentoAdmin[]> {
  return adminFetch(`/admin/empresas/${empresaId}/departamentos`, token);
}

export function crearDepartamentoAdmin(
  token: string,
  empresaId: string,
  nombre: string,
): Promise<DepartamentoAdmin> {
  return adminFetch(`/admin/empresas/${empresaId}/departamentos`, token, {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
}

export function borrarDepartamentoAdmin(
  token: string,
  empresaId: string,
  departamentoId: string,
): Promise<{ ok: boolean }> {
  return adminFetch(`/admin/empresas/${empresaId}/departamentos/${departamentoId}`, token, { method: "DELETE" });
}

export interface UsuarioAdmin {
  id: string;
  email: string;
  nombre: string;
  rol: RolAdmin;
  activo: boolean;
  passwordEstablecida: boolean;
  talentoId: string | null;
  ultimoLoginAt: string | null;
}

export function fetchUsuariosAdmin(token: string, empresaId: string): Promise<UsuarioAdmin[]> {
  return adminFetch(`/admin/empresas/${empresaId}/usuarios`, token);
}

export function cambiarCorreoUsuarioAdmin(
  token: string,
  usuarioId: string,
  email: string,
): Promise<{ id: string; email: string; nombre: string; rol: RolAdmin }> {
  return adminFetch(`/admin/usuarios/${usuarioId}/correo`, token, {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export function restablecerPasswordAdmin(token: string, usuarioId: string): Promise<{ ok: boolean }> {
  return adminFetch(`/admin/usuarios/${usuarioId}/restablecer-password`, token, { method: "POST" });
}

export function cambiarRolUsuarioAdmin(
  token: string,
  usuarioId: string,
  rol: RolAdmin,
  talentoId?: string,
): Promise<{ id: string; email: string; nombre: string; rol: RolAdmin; talentoId: string | null }> {
  return adminFetch(`/admin/usuarios/${usuarioId}/rol`, token, {
    method: "PATCH",
    body: JSON.stringify({ rol, talentoId }),
  });
}

// ── Sucursales: accesos vinculados a otra(s) empresa(s) ────────────────────

export interface VinculoAdmin {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: RolAdmin;
  empresaCasa: string;
  vinculadoDesde: string;
}

export function fetchVinculosAdmin(token: string, empresaId: string): Promise<VinculoAdmin[]> {
  return adminFetch(`/admin/empresas/${empresaId}/vinculos`, token);
}

export function vincularUsuarioAdmin(token: string, empresaId: string, email: string): Promise<{ ok: boolean }> {
  return adminFetch(`/admin/empresas/${empresaId}/vinculos`, token, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function desvincularUsuarioAdmin(
  token: string,
  empresaId: string,
  usuarioId: string,
): Promise<{ ok: boolean }> {
  return adminFetch(`/admin/empresas/${empresaId}/vinculos/${usuarioId}`, token, { method: "DELETE" });
}

// ── Solicitudes de soporte (Dock del panel) ────────────────────────────────

export interface SolicitudSoporteAdmin {
  id: string;
  tipo: "AVERIA" | "SUGERENCIA";
  mensaje: string;
  leida: boolean;
  createdAt: string;
  empresa: { nombre: string; slug: string };
  usuario: { nombre: string; email: string };
}

export function fetchSolicitudesSoporteAdmin(token: string): Promise<SolicitudSoporteAdmin[]> {
  return adminFetch("/admin/soporte", token);
}

export function fetchSolicitudesSoportePendientesAdmin(token: string): Promise<{ total: number }> {
  return adminFetch("/admin/soporte/pendientes", token);
}

export function marcarSolicitudSoporteLeidaAdmin(token: string, id: string): Promise<{ id: string; leida: boolean }> {
  return adminFetch(`/admin/soporte/${id}/leida`, token, { method: "PATCH" });
}
