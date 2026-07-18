"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  type EmpresaAdmin,
  AdminNoAutorizadoError,
  AdminConflictoError,
  fetchAdminDashboard,
  crearEmpresa,
  cambiarEstadoEmpresa,
} from "@/lib/admin-api";
import { leerTokenAdmin, borrarTokenAdmin } from "@/lib/admin-auth";
import { LoadingScreen } from "@/components/LoadingScreen";

const PLANES = ["starter", "pro", "enterprise"] as const;

export default function AdminEmpresasPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", slug: "", plan: "starter", codigoAcceso: "" });
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const token = leerTokenAdmin();
    if (!token) { router.replace("/admin"); return; }
    fetchAdminDashboard(token)
      .then((d) => { setEmpresas(d.empresas); setCargando(false); })
      .catch((err) => {
        if (err instanceof AdminNoAutorizadoError) { borrarTokenAdmin(); router.replace("/admin"); }
        else setCargando(false);
      });
  }, [router]);

  function slugDesdeNombre(nombre: string) {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNombreChange(nombre: string) {
    setForm((f) => ({ ...f, nombre, slug: f.slug || slugDesdeNombre(nombre) }));
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    const token = leerTokenAdmin();
    if (!token) return;
    setFormError(null);
    setGuardando(true);
    try {
      const nueva = await crearEmpresa(token, {
        nombre: form.nombre,
        slug: form.slug || undefined,
        plan: form.plan,
        codigoAcceso: form.codigoAcceso || undefined,
      });
      setEmpresas((prev) => [...prev, { ...nueva, totalEmpleados: 0, totalBitacoras: 0 }]);
      setForm({ nombre: "", slug: "", plan: "starter", codigoAcceso: "" });
      setMostrarForm(false);
    } catch (err) {
      if (err instanceof AdminConflictoError) setFormError(err.detail);
      else setFormError(err instanceof Error ? err.message : "Error al crear empresa");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleEmpresa(id: string, activo: boolean) {
    const token = leerTokenAdmin();
    if (!token) return;
    setToggling(id);
    try {
      const result = await cambiarEstadoEmpresa(token, id, !activo);
      setEmpresas((prev) => prev.map((e) => (e.id === id ? { ...e, activo: result.activo } : e)));
    } finally {
      setToggling(null);
    }
  }

  if (cargando) return <LoadingScreen />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Empresas ({empresas.length})</h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nueva empresa
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={(e) => void handleCrear(e)}
          className="rounded-xl border border-border bg-card p-5 shadow-card space-y-4"
        >
          <h3 className="font-display text-sm font-semibold text-foreground">Nueva empresa</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Nombre *</label>
              <input
                required
                value={form.nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug (auto si vacío)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder={form.nombre ? slugDesdeNombre(form.nombre) : "mi-empresa"}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Plan *</label>
              <select
                value={form.plan}
                onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PLANES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Código de acceso (auto si vacío)</label>
              <input
                value={form.codigoAcceso}
                onChange={(e) => setForm((f) => ({ ...f, codigoAcceso: e.target.value }))}
                placeholder="Autogenerado"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {guardando ? "Creando..." : "Crear empresa"}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); setFormError(null); }}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Escritorio/tablet ancha: tabla */}
      <div className="hidden rounded-xl border border-border bg-card shadow-card overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <th className="px-5 py-3">Empresa</th>
              <th className="px-3 py-3">Slug</th>
              <th className="px-3 py-3">Plan</th>
              <th className="px-3 py-3 text-right">Empl.</th>
              <th className="px-3 py-3 text-right">Bit.</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {empresas.map((e) => (
              <tr key={e.id} className="hover:bg-accent/40">
                <td className="px-5 py-3 font-medium text-foreground">{e.nombre}</td>
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{e.slug}</td>
                <td className="px-3 py-3 capitalize text-muted-foreground">{e.plan}</td>
                <td className="px-3 py-3 text-right tabular-nums">{e.totalEmpleados}</td>
                <td className="px-3 py-3 text-right tabular-nums">{e.totalBitacoras}</td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => void toggleEmpresa(e.id, e.activo)}
                    disabled={toggling === e.id}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${e.activo ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    {toggling === e.id ? "..." : e.activo ? "Activa" : "Inactiva"}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/empresas/${e.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver / Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular/tablet vertical: tarjetas apiladas */}
      <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-card lg:hidden">
        {empresas.map((e) => (
          <div key={e.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{e.nombre}</p>
                <p className="truncate text-xs font-mono text-muted-foreground">{e.slug}</p>
              </div>
              <button
                onClick={() => void toggleEmpresa(e.id, e.activo)}
                disabled={toggling === e.id}
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50 ${e.activo ? "bg-success/10 text-success hover:bg-success/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {toggling === e.id ? "..." : e.activo ? "Activa" : "Inactiva"}
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="capitalize">{e.plan}</span>
              <span className="tabular-nums">{e.totalEmpleados} empl.</span>
              <span className="tabular-nums">{e.totalBitacoras} bit.</span>
            </div>
            <Link href={`/admin/empresas/${e.id}`} className="text-xs font-medium text-primary hover:underline">
              Ver / Editar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
