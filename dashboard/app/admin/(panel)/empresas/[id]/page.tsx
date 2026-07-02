"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff, Plus } from "lucide-react";
import {
  type EmpresaAdmin,
  type EmpleadoAdmin,
  AdminNoAutorizadoError,
  AdminConflictoError,
  fetchAdminDashboard,
  editarEmpresa,
  fetchEmpleadosAdmin,
  crearEmpleadoAdmin,
  cambiarEstadoEmpleadoAdmin,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

const PLANES = ["starter", "pro", "enterprise"] as const;

export default function AdminEmpresaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [empresa, setEmpresa] = useState<EmpresaAdmin | null>(null);
  const [empleados, setEmpleados] = useState<EmpleadoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [codigoVisible, setCodigoVisible] = useState(false);

  const [editForm, setEditForm] = useState({ nombre: "", plan: "", codigoAcceso: "" });
  const [guardandoEdit, setGuardandoEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editOk, setEditOk] = useState(false);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombreCompleto: "", rol: "" });
  const [guardandoEmpleado, setGuardandoEmpleado] = useState(false);
  const [empleadoError, setEmpleadoError] = useState<string | null>(null);
  const [mostrarFormEmpleado, setMostrarFormEmpleado] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) { router.replace("/admin"); return; }

    Promise.all([fetchAdminDashboard(token), fetchEmpleadosAdmin(token, id)])
      .then(([dash, emps]) => {
        const emp = dash.empresas.find((e) => e.id === id) ?? null;
        setEmpresa(emp);
        if (emp) setEditForm({ nombre: emp.nombre, plan: emp.plan, codigoAcceso: emp.codigoAcceso ?? "" });
        setEmpleados(emps);
        setCargando(false);
      })
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) { borrarTokenAdmin(); router.replace("/admin"); }
        else setCargando(false);
      });
  }, [id, router]);

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token || !empresa) return;
    setEditError(null);
    setEditOk(false);
    setGuardandoEdit(true);
    try {
      const updated = await editarEmpresa(token, id, {
        nombre: editForm.nombre || undefined,
        plan: editForm.plan || undefined,
        codigoAcceso: editForm.codigoAcceso || undefined,
      });
      setEmpresa((prev) => prev ? { ...prev, ...updated } : prev);
      setEditOk(true);
    } catch (err) {
      if (err instanceof AdminConflictoError) setEditError(err.detail);
      else setEditError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setGuardandoEdit(false);
    }
  }

  async function handleCrearEmpleado(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token) return;
    setEmpleadoError(null);
    setGuardandoEmpleado(true);
    try {
      const nuevo = await crearEmpleadoAdmin(token, id, nuevoEmpleado);
      setEmpleados((prev) => [...prev, { ...nuevo, _count: { worklogs: 0 } }]);
      setNuevoEmpleado({ nombreCompleto: "", rol: "" });
      setMostrarFormEmpleado(false);
    } catch (err) {
      setEmpleadoError(err instanceof Error ? err.message : "Error al crear empleado");
    } finally {
      setGuardandoEmpleado(false);
    }
  }

  async function toggleEmpleado(talentoId: string, estadoActual: string) {
    const token = leerTokenAdmin();
    if (!token) return;
    setToggling(talentoId);
    try {
      const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
      const result = await cambiarEstadoEmpleadoAdmin(token, talentoId, nuevoEstado);
      setEmpleados((prev) => prev.map((e) => (e.id === talentoId ? { ...e, estado: result.estado } : e)));
    } finally {
      setToggling(null);
    }
  }

  if (cargando) return <LoadingScreen />;
  if (!empresa) return <p className="text-sm text-muted-foreground">Empresa no encontrada.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver
      </button>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-base font-semibold text-foreground mb-4">Datos de la empresa</h2>
        <form onSubmit={(e) => void handleEdit(e)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre</label>
              <input
                value={editForm.nombre}
                onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug (inmutable)</label>
              <input
                value={empresa.slug}
                disabled
                className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm font-mono text-muted-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Plan</label>
              <select
                value={editForm.plan}
                onChange={(e) => setEditForm((f) => ({ ...f, plan: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PLANES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Código de acceso</label>
              <div className="relative">
                <input
                  type={codigoVisible ? "text" : "password"}
                  value={editForm.codigoAcceso}
                  onChange={(e) => setEditForm((f) => ({ ...f, codigoAcceso: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 pr-9 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setCodigoVisible((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {codigoVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          {editError && <p className="text-sm text-destructive">{editError}</p>}
          {editOk && <p className="text-sm text-success">Guardado correctamente.</p>}
          <button
            type="submit"
            disabled={guardandoEdit}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {guardandoEdit ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Empleados ({empleados.length})
          </h2>
          <button
            onClick={() => setMostrarFormEmpleado((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar empleado
          </button>
        </div>

        {mostrarFormEmpleado && (
          <form onSubmit={(e) => void handleCrearEmpleado(e)} className="border-b border-border px-5 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre completo *</label>
                <input
                  required
                  value={nuevoEmpleado.nombreCompleto}
                  onChange={(e) => setNuevoEmpleado((f) => ({ ...f, nombreCompleto: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Rol *</label>
                <input
                  required
                  value={nuevoEmpleado.rol}
                  onChange={(e) => setNuevoEmpleado((f) => ({ ...f, rol: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            {empleadoError && <p className="text-sm text-destructive">{empleadoError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={guardandoEmpleado}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {guardandoEmpleado ? "Agregando..." : "Agregar"}
              </button>
              <button
                type="button"
                onClick={() => { setMostrarFormEmpleado(false); setEmpleadoError(null); }}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-border">
          {empleados.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">Sin empleados registrados.</p>
          ) : (
            empleados.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{emp.nombreCompleto}</p>
                  <p className="text-xs text-muted-foreground">{emp.rol} · {emp._count.worklogs} bitácoras</p>
                </div>
                <button
                  onClick={() => void toggleEmpleado(emp.id, emp.estado)}
                  disabled={toggling === emp.id}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${emp.estado === "activo" ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {toggling === emp.id ? "..." : emp.estado === "activo" ? "Activo" : "Inactivo"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
