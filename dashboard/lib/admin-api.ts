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
  data: { nombre?: string; plan?: string; codigoAcceso?: string },
): Promise<EmpresaAdmin> {
  return adminFetch<EmpresaAdmin>(`/admin/empresas/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function cambiarEstadoEmpresa(token: string, id: string, activo: boolean): Promise<{ id: string; nombre: string; activo: boolean }> {
  return adminFetch(`/admin/empresas/${id}/estado`, token, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
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
